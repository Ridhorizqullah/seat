import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Read and parse .env.local manually
try {
  const envPath = path.resolve(__dirname, '../.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1)
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1)
        }
        process.env[key] = value.trim()
      }
    })
  }
} catch (e) {
  console.error('Error reading env file:', e)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
  const email = 'suddensae@gmail.com'
  console.log('Checking email:', email)
  
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
  
  console.log('--- Users in DB ---')
  console.log(users, userErr)

  const { data: customers, error: custErr } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
  
  console.log('--- Customers in DB ---')
  console.log(customers, custErr)
}

run()
