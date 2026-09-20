/**
 * Migration Script: Local MongoDB Compass -> MongoDB Atlas
 * 
 * Safely migrates all collections and documents from local Compass (Nursery_Plant)
 * to MongoDB Atlas (Plant_Nest) without deleting or duplicating existing documents.
 */

const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/Nursery_Plant';
const ATLAS_URI = process.env.MONGODB_URI;

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function migrateData() {
  console.log('====================================================');
  console.log('🍃 Ganapathi Gardens: Local Compass -> Atlas Migration');
  console.log('====================================================');

  if (!ATLAS_URI || !ATLAS_URI.includes('mongodb')) {
    console.error('❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const maskedAtlasUri = ATLAS_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`📍 Local Source: ${LOCAL_URI}`);
  console.log(`☁️ Atlas Destination: ${maskedAtlasUri}\n`);

  let localClient, atlasClient;

  try {
    localClient = new MongoClient(LOCAL_URI, { serverSelectionTimeoutMS: 5000 });
    atlasClient = new MongoClient(ATLAS_URI, { serverSelectionTimeoutMS: 15000 });

    console.log('⏳ Connecting to Local MongoDB...');
    await localClient.connect();
    console.log('✅ Connected to Local MongoDB.');

    console.log('⏳ Connecting to MongoDB Atlas...');
    await atlasClient.connect();
    console.log('✅ Connected to MongoDB Atlas.\n');

    const localDb = localClient.db('Nursery_Plant');
    const atlasDb = atlasClient.db('Plant_Nest');

    // List of collections to migrate
    const collectionsToMigrate = [
      'admins',
      'users',
      'products',
      'categories',
      'orders',
      'businessinfos',
      'deliveryareas',
      'offers',
      'coupons',
      'contactmessages'
    ];

    const migrationSummary = {};

    for (const colName of collectionsToMigrate) {
      console.log(`📦 Processing collection: [${colName}]`);
      const localCol = localDb.collection(colName);
      const atlasCol = atlasDb.collection(colName);

      const localDocs = await localCol.find().toArray();
      let insertedCount = 0;
      let existingCount = 0;

      for (const doc of localDocs) {
        // Query by _id or unique field
        let filter = { _id: doc._id };
        if (doc.id) filter = { $or: [{ _id: doc._id }, { id: doc.id }] };
        else if (doc.email) filter = { $or: [{ _id: doc._id }, { email: doc.email }] };
        else if (doc.orderNumber) filter = { $or: [{ _id: doc._id }, { orderNumber: doc.orderNumber }] };

        const existing = await atlasCol.findOne(filter);
        if (!existing) {
          await atlasCol.insertOne(doc);
          insertedCount++;
        } else {
          existingCount++;
        }
      }

      // Also for products: if db.json has starter catalog products not yet in Atlas, merge them safely
      if (colName === 'products' && fs.existsSync(DB_FILE)) {
        try {
          const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
          if (dbData.products && Array.isArray(dbData.products)) {
            for (const catProd of dbData.products) {
              const filter = { $or: [{ id: catProd.id }, { name: catProd.name }] };
              const existing = await atlasCol.findOne(filter);
              if (!existing) {
                const prodToInsert = { ...catProd };
                delete prodToInsert._id;
                await atlasCol.insertOne(prodToInsert);
                insertedCount++;
              }
            }
          }
        } catch (e) {
          console.warn('Note on catalog merge:', e.message);
        }
      }

      // Drop any problematic legacy indexes (like orders.id_1) on Atlas if present
      if (colName === 'orders') {
        try {
          const indexes = await atlasCol.indexes();
          if (indexes.some(idx => idx.name === 'id_1')) {
            await atlasCol.dropIndex('id_1');
            console.log('  🛡️ Dropped legacy id_1 unique index on orders in Atlas.');
          }
        } catch (e) {}
      }

      const totalInAtlas = await atlasCol.countDocuments();
      migrationSummary[colName] = {
        localCount: localDocs.length,
        migrated: insertedCount,
        alreadyExisted: existingCount,
        totalInAtlas
      };

      console.log(`  -> Migrated: ${insertedCount} | Kept existing: ${existingCount} | Total in Atlas: ${totalInAtlas}`);
    }

    console.log('\n====================================================');
    console.log('🎉 MongoDB Atlas Migration Complete!');
    console.log('====================================================');
    console.table(migrationSummary);

  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
    process.exit(0);
  }
}

migrateData();
