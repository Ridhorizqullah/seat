import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/)
  if (match) {
    const key = match[1].trim()
    let value = match[2].trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log('--- GET SYSTEM INDEXES ---')
  const { data, error } = await supabase.rpc('get_indexes')
  if (error) {
    // If RPC doesn't exist, we can run direct SQL using standard query or check table directly
    console.error('get_indexes rpc not found, querying pg_indexes...')
    const { data: indexes, error: idxErr } = await supabase.from('pg_indexes').select('*').eq('tablename', 'booking_items')
    // Wait, pg_indexes might not be exposed as a PostgREST table, let's see
    if (idxErr) console.error('pg_indexes select error:', idxErr.message)
    else console.log(indexes)
  } else {
    console.log(data)
  }

  // Let's query information_schema for constraints on booking_items
  const { data: constraints, error: constErr } = await supabase
    .from('booking_items')
    .select('*')
    .limit(1)
  if (constErr) console.error('constraints fetch error:', constErr.message)
  console.log('Fields in booking_items:', constraints ? Object.keys(constraints[0] || {}) : [])
}

run()
