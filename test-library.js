#!/usr/bin/env node

/**
 * Test script to verify CSV2API library functionality
 */

import { CsvLoader, createDataset } from './src/index.js';

async function testLibrary() {
  console.log('🧪 Testing CSV2API Library...\n');

  try {
    // Test 1: Basic CsvLoader
    console.log('1️⃣ Testing CsvLoader...');
    const loader = new CsvLoader();
    const result = await loader.loadCsv('./example-data.csv');
    console.log(`   ✅ Loaded ${result.totalRows} rows with ${result.columns.length} columns`);
    
    // Test 2: Dataset wrapper
    console.log('\n2️⃣ Testing Dataset wrapper...');
    const dataset = await createDataset('./example-data.csv');
    console.log(`   ✅ Dataset created with ${dataset.getData().length} rows`);
    
    // Test 3: Search functionality
    console.log('\n3️⃣ Testing search...');
    const engineers = dataset.search('engineer');
    console.log(`   🔍 Found ${engineers.length} engineers`);
    
    // Test 4: Column filtering
    console.log('\n4️⃣ Testing column filtering...');
    const namesOnly = dataset.filter(['name', 'email']);
    console.log(`   📊 First row has ${Object.keys(namesOnly[0]).length} columns`);
    
    // Test 5: Pagination
    console.log('\n5️⃣ Testing pagination...');
    const page1 = dataset.paginate(1, 5);
    console.log(`   📄 Page 1 has ${page1.data.length} items`);
    
    console.log('\n🎉 All library tests passed!');
    
  } catch (error) {
    console.error('❌ Library test failed:', error.message);
    process.exit(1);
  }
}

testLibrary();
