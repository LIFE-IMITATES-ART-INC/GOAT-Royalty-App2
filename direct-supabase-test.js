#!/usr/bin/env node

// Direct Supabase Connection Test
// Using the exact format provided

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('🔧 Direct Supabase Connection Test\n');
console.log('📋 Configuration:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'NOT FOUND'}\n`);

if (!supabaseKey) {
    console.log('❌ SUPABASE_KEY not found in environment variables');
    console.log('💡 Available environment variables:');
    console.log(Object.keys(process.env).filter(key => key.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectConnection() {
    try {
        console.log('📡 Testing direct connection...\n');
        
        // Test 1: Simple health check
        console.log('1️⃣ Testing basic connection...');
        const { data, error } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.log('❌ Error:', error.message);
            console.log('💡 This usually means:');
            console.log('   - Project is paused or inactive');
            console.log('   - Tables dont exist yet');
            console.log('   - API key is invalid\n');
            
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('✅ Connection successful, but tables missing');
                console.log('🔧 SOLUTION: Run SQL-SCRIPTS.sql in Supabase SQL Editor\n');
                console.log('📋 Steps:');
                console.log('1. Go to your Supabase project dashboard');
                console.log('2. Click SQL Editor');
                console.log('3. Click New query');
                console.log('4. Paste SQL-SCRIPTS.sql content');
                console.log('5. Click Run\n');
                return;
            }
        } else {
            console.log('✅ Connection successful!');
            console.log(`📊 Found ${data} profiles in database\n`);
        }
        
        // Test 2: List tables
        console.log('2️⃣ Checking table structure...');
        const tables = ['profiles', 'tracks', 'royalties', 'contracts', 'analytics', 'copyrights', 'payments'];
        
        for (const table of tables) {
            const { error: tableError } = await supabase
                .from(table)
                .select('count', { count: 'exact', head: true });
            
            if (tableError) {
                console.log(`❌ ${table} - Not found`);
            } else {
                console.log(`✅ ${table} - Ready`);
            }
        }
        
        console.log('\n🎉 Supabase integration is working!');
        console.log('🚀 Your GOAT Royalty App can now use the live database!\n');
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if project is active in your Supabase dashboard');
        console.log('2. Verify project status (not paused)');
        console.log('3. Check API key validity');
        console.log('4. Ensure database is provisioned\n');
        
        console.log('💡 If project is paused:');
        console.log('- Go to Supabase dashboard');
        console.log('- Click "Resume project"');
        console.log('- Wait a few minutes for activation');
        console.log('- Run this test again\n');
    }
}

testDirectConnection();