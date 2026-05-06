#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * EventSeats Setup Script
 * Helps new users get started quickly
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🎪 Welcome to EventSeats Setup!')
console.log('================================\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from template...')
  const envExample = path.join(process.cwd(), 'env.example')
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envPath)
    console.log('✅ Created .env.local - please edit with your database credentials\n')
  } else {
    console.log('❌ env.example not found\n')
  }
} else {
  console.log('✅ .env.local already exists\n')
}

// Check Node.js version
console.log('🔍 Checking Node.js version...')
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])

if (majorVersion < 18) {
  console.log('❌ Node.js 18+ is required. You have:', nodeVersion)
  console.log('Please update Node.js: https://nodejs.org/\n')
  process.exit(1)
} else {
  console.log('✅ Node.js version:', nodeVersion, '\n')
}

// Check if dependencies are installed
console.log('📦 Checking dependencies...')
const nodeModulesPath = path.join(process.cwd(), 'node_modules')

if (!fs.existsSync(nodeModulesPath)) {
  console.log('🔄 Installing dependencies...')
  try {
    execSync('npm install', { stdio: 'inherit' })
    console.log('✅ Dependencies installed\n')
  } catch (_error) {
    console.log('❌ Failed to install dependencies')
    console.log('Please run: npm install\n')
    process.exit(1)
  }
} else {
  console.log('✅ Dependencies already installed\n')
}

// Display next steps
console.log('🚀 Setup Complete! Next steps:')
console.log('================================')
console.log('1. Edit .env.local with your database credentials')
console.log('2. Set up your database (Supabase recommended):')
console.log('   - Create account at https://supabase.com')
console.log('   - Create new project')
console.log('   - Copy URL and keys to .env.local')
console.log('3. Seed demo data (creates demo org, venue, seats, admin user):')
console.log('   npm run setup-demo')
console.log('4. Start the development server:')
console.log('   npm run dev')
console.log('5. Open http://localhost:3000 in your browser')
console.log('')
console.log('📚 Need help? Check the documentation:')
console.log('   https://github.com/Hannah-goodridge/eventseats/tree/main/docs')
console.log('')
console.log('🎭 Happy booking!')
