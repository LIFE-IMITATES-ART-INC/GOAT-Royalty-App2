#!/usr/bin/env node

// Add sample tracks to your Supabase database
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Set them in .env.local before running this script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎵 Adding Sample Tracks to GOAT Royalty App\n');

const sampleTracks = [
  {
    title: "GOAT Anthem",
    artist: "Harvey Miller DJ Speedy",
    album: "Royal Collection",
    duration: "3:45",
    genre: "Hip Hop",
    isrc: "USQ123456789",
    release_date: "2024-01-15",
    streams: 458239,
    revenue: 3421.50,
    streaming_platforms: ["Spotify", "Apple Music", "TikTok", "YouTube"],
    created_at: new Date().toISOString()
  },
  {
    title: "Royalty Flow",
    artist: "Harvey Miller DJ Speedy",
    album: "Royal Collection",
    duration: "4:12",
    genre: "Hip Hop",
    isrc: "USQ123456790",
    release_date: "2024-02-20",
    streams: 342156,
    revenue: 2851.75,
    streaming_platforms: ["Spotify", "Apple Music", "TikTok"],
    created_at: new Date().toISOString()
  },
  {
    title: "No Hands (feat. Roscoe Dash & Wale)",
    artist: "Waka Flocka Flame",
    album: "Flockaveli",
    duration: "4:01",
    genre: "Hip Hop",
    isrc: "USQ123456791",
    release_date: "2010-10-05",
    streams: 1250000000,
    revenue: 865432.00,
    streaming_platforms: ["Spotify", "Apple Music", "TikTok", "YouTube", "SoundCloud"],
    created_at: new Date().toISOString()
  },
  {
    title: "Hard in Da Paint",
    artist: "Waka Flocka Flame",
    album: "Flockaveli",
    duration: "3:48",
    genre: "Hip Hop",
    isrc: "USQ123456792",
    release_date: "2010-09-28",
    streams: 890000000,
    revenue: 678921.25,
    streaming_platforms: ["Spotify", "Apple Music", "YouTube"],
    created_at: new Date().toISOString()
  },
  {
    title: "Grove St. Party",
    artist: "Waka Flocka Flame",
    album: "Flockaveli",
    duration: "3:55",
    genre: "Hip Hop",
    isrc: "USQ123456793",
    release_date: "2010-10-12",
    streams: 750000000,
    revenue: 567890.50,
    streaming_platforms: ["Spotify", "Apple Music", "TikTok", "YouTube"],
    created_at: new Date().toISOString()
  }
];

async function addSampleTracks() {
    try {
        console.log('📊 Adding sample tracks to database...');
        
        for (const track of sampleTracks) {
            const { data, error } = await supabase
                .from('tracks')
                .insert({
                    ...track,
                    user_id: '17b006c7-1c62-46da-8b11-7f66e8989dca' // Demo user ID
                })
                .select();

            if (error) {
                if (error.message.includes('duplicate')) {
                    console.log(`✅ "${track.title}" already exists`);
                } else {
                    console.log(`❌ Error adding "${track.title}": ${error.message}`);
                }
            } else {
                console.log(`✅ Added "${track.title}"`);
            }
        }

        console.log('\n🎉 Sample tracks added successfully!');
        console.log('\n📈 Track Statistics:');
        console.log(`   Total Tracks: ${sampleTracks.length}`);
        console.log(`   Total Streams: ${sampleTracks.reduce((sum, track) => sum + track.streams, 0).toLocaleString()}`);
        console.log(`   Total Revenue: $${sampleTracks.reduce((sum, track) => sum + track.revenue, 0).toLocaleString()}`);
        console.log('\n🌐 Visit your tracks page:');
        console.log('   https://3000-02db9438-9294-43f9-b325-28e34dd7c07d.proxy.daytona.works/tracks');
        
    } catch (error) {
        console.error('❌ Failed to add sample tracks:', error.message);
    }
}

addSampleTracks();