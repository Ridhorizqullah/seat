import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}

envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const parts = trimmed.split('=')
  if (parts.length >= 2) {
    const key = parts[0].trim()
    let val = parts.slice(1).join('=').trim()
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  console.log('Querying venues...')
  const { data: venues, error: venuesErr } = await supabase.from('venues').select('*')
  console.log('Venues:', venues, 'Error:', venuesErr)

  console.log('Querying seating_layouts...')
  const { data: layouts, error: layoutsErr } = await supabase.from('seating_layouts').select('*')
  console.log('Seating Layouts:', layouts, 'Error:', layoutsErr)
}

test()
