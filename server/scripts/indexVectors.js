/**
 * indexVectors.js
 * 
 * Standalone CLI Utility to index or re-index all plant store data paths
 * into the Unified Vector Database.
 * 
 * Usage:
 *   npm run rag:index
 *   node scripts/indexVectors.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { connectDB } = require('../config/db');
const { syncAllDataSources, getVectorDbStatus } = require('../services/vectorDbService');

async function main() {
  console.log('🌿 ====================================================');
  console.log('🍃 Ganapathi Gardens Plant Nursery - Vector DB Indexer');
  console.log('🌿 ====================================================\n');

  try {
    await connectDB();
    console.log('📡 Connected to MongoDB Atlas.');

    const startTime = Date.now();
    const result = await syncAllDataSources(true);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n🎉 Indexing completed in ${duration}s!`);
    console.log(`📊 Total documents indexed: ${result.total || result.synced}`);
    console.log(`🧠 Active vector records in store: ${result.activeVectors}`);
    
    const status = getVectorDbStatus();
    console.log(`🛡️ Store Provider: ${status.provider}`);
    console.log('\nAll plant store data paths are fully synchronized and ready for queries!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error indexing vector database:', err);
    process.exit(1);
  }
}

main();
