// Test Supabase Connection
// Run this with: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...\n')
console.log('Project URL:', supabaseUrl)
console.log('API Key:', supabaseKey ? '✅ Found' : '❌ Missing')
console.log('')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('📡 Connecting to Supabase...')
    
    // Test 1: Check connection
    const { data, error } = await supabase.from('royalties').select('count', { count: 'exact', head: true })
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('⚠️  Connection successful, but tables not found')
        console.log('   You need to run SQL-SCRIPTS.sql in Supabase SQL Editor')
        console.log('')
        console.log('📋 Next steps:')
        console.log('   1. Go to your Supabase project SQL Editor')
        console.log('   2. Click "SQL Editor" in left sidebar')
        console.log('   3. Click "New query"')
        console.log('   4. Copy contents of SQL-SCRIPTS.sql')
        console.log('   5. Paste and click "Run"')
        return
      }
      throw error
    }
    
    console.log('✅ Connection successful!')
    console.log('✅ Database tables found!')
    console.log('')
    
    // Test 2: List available tables
    console.log('📊 Checking tables...')
    const tables = ['royalties', 'tracks', 'contracts', 'analytics', 'copyrights', 'payments', 'profiles']
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (error) {
        console.log(`   ❌ ${table} - Not found`)
      } else {
        console.log(`   ✅ ${table} - Ready`)
      }
    }
    
    console.log('')
    console.log('🎉 Your GOAT Royalty App is ready to use real data!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Open: http://localhost:3000')
    console.log('   3. Start updating components to use real data')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('')
    console.log('🔧 Troubleshooting:')
    console.log('   1. Check your Supabase project is active (not paused)')
    console.log('   2. Verify credentials in .env.local are correct')
    console.log('   3. Check your internet connection')
  }
}

testConnection()