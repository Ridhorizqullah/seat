/* eslint-disable */
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const cacheBuster = `?cb=${Date.now()}`;
  const baseUrl = 'https://seat-mocha.vercel.app';
  const url = `${baseUrl}/${cacheBuster}`;
  console.log(`Fetching ${url}...`);
  try {
    const page = await fetchUrl(url);
    console.log(`Status Code: ${page.statusCode}`);
    console.log(`Headers:`, {
      date: page.headers.date,
      'x-vercel-id': page.headers['x-vercel-id'],
      'cache-control': page.headers['cache-control']
    });
    
    // Look for script tags in the HTML
    const scriptRegex = /<script[^>]*src="([^"]+)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(page.body)) !== null) {
      scripts.push(match[1]);
    }
    
    console.log(`Found ${scripts.length} script tags on page.`);
    
    // Check if the project ID is directly in the page body
    const projectId = 'wwmn4i2yo8';
    if (page.body.includes(projectId)) {
      console.log(`✅ FOUND Clarity project ID "${projectId}" directly in the main HTML!`);
      return;
    }
    
    console.log(`Checking script bundles for project ID and "clarity" keyword...`);
    for (const script of scripts) {
      const cleanScript = script.split('?')[0];
      const scriptUrl = cleanScript.startsWith('http') 
        ? `${cleanScript}${cacheBuster}` 
        : `${baseUrl}${cleanScript}${cacheBuster}`;
      console.log(`Fetching bundle: ${scriptUrl}`);
      try {
        const bundle = await fetchUrl(scriptUrl);
        const hasProjectId = bundle.body.includes(projectId);
        const hasClarityKeyword = bundle.body.toLowerCase().includes('clarity');
        
        if (hasClarityKeyword) {
          console.log(`ℹ️ FOUND "clarity" keyword in bundle: ${cleanScript}`);
        }
        if (hasProjectId) {
          console.log(`✅ FOUND Clarity project ID "${projectId}" in bundle: ${cleanScript}`);
          return;
        }
      } catch (e) {
        console.error(`Error fetching bundle ${cleanScript}: ${e.message}`);
      }
    }
    
    console.log(`❌ Clarity project ID "${projectId}" was NOT found in the main HTML or any script bundles.`);
    console.log(`This indicates that NEXT_PUBLIC_CLARITY_PROJECT_ID was not set during the production build on Vercel.`);
  } catch (e) {
    console.error(`Error checking site: ${e.message}`);
  }
}

main();
