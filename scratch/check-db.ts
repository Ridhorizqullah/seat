import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  const { data: shows, error: showError } = await supabase.from('shows').select('id, title')
  if (showError) {
    console.error('Error fetching shows:', showError)
  } else {
    console.log('Shows found:', shows.length)
    if (shows.length > 0) {
      console.log('First show:', shows[0])
      const { data: seats, error: seatError } = await supabase
        .from('seats')
        .select('count', { count: 'exact', head: true })
        .eq('show_id', shows[0].id)
      
      if (seatError) {
        console.error('Error fetching seats:', seatError)
      } else {
        console.log('Seats for first show:', seats)
      }
    }
  }
}

checkData()
