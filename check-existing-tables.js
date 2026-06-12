#!/usr/bin/env node

// Check existing tables in your Supabase project
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set in environment');
    process.exit(1);
}
const supabaseKey = process.env.SUPABASE_KEY;

console.log('🔍 Checking existing tables in your Supabase project\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingTables() {
    try {
        // Method 1: Try to get all table names using information_schema
        console.log('📊 Method 1: Checking information_schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_type', 'BASE TABLE');

        if (schemaError) {
            console.log('❌ Schema query failed:', schemaError.message);
        } else {
            console.log('✅ Found tables via schema:');
            schemaData.forEach(table => {
                console.log(`   - ${table.table_name}`);
            });
        }

        console.log('\n📊 Method 2: Testing common table names...');
        
        // Method 2: Test common table names that might exist
        const commonTables = [
            'users', 'profiles', 'user_profiles', 'accounts',
            'tracks', 'music', 'songs', 'audio',
            'royalties', 'payments', 'earnings', 'revenue',
            'contracts', 'agreements', 'deals',
            'analytics', 'stats', 'statistics',
            'copyrights', 'rights', 'licenses',
            'auth', 'authentication', 'sessions'
        ];

        for (const tableName of commonTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('count', { count: 'exact', head: true });

                if (!error) {
                    console.log(`✅ ${tableName} - Exists (${data} rows)`);
                }
            } catch (err) {
                // Table doesn't exist, continue
            }
        }

        console.log('\n📊 Method 3: Testing raw SQL query...');
        
        // Method 3: Try a raw SQL query to list tables
        try {
            const { data: rawData, error: rawError } = await supabase
                .rpc('get_table_names') || {};
            
            if (!rawError && rawData) {
                console.log('✅ Tables via RPC:', rawData);
            }
        } catch (err) {
            console.log('ℹ️ RPC method not available');
        }

    } catch (error) {
        console.log('❌ Error checking tables:', error.message);
    }
}

checkExistingTables();