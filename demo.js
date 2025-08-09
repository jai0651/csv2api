#!/usr/bin/env node

/**
 * CSV2API Demo Script
 * 
 * This script demonstrates the main features of CSV2API
 * including CSV loading, querying, and API server functionality
 */

import { CsvLoader, createDataset } from './src/index.js';
import { createServer, startServer } from './src/server.js';

async function runDemo() {
  console.log('🚀 CSV2API Demo\n');
  
  try {
    // Demo 1: Basic CSV Loading
    console.log('1️⃣ Basic CSV Loading');
    console.log('   Loading example-data.csv...');
    
    const loader = new CsvLoader();
    const result = await loader.loadCsv('./example-data.csv');
    
    console.log(`   ✅ Loaded ${result.totalRows} rows with ${result.columns.length} columns`);
    console.log(`   📅 Last modified: ${result.lastModified.toLocaleString()}`);
    console.log(`   📋 Columns: ${result.columns.join(', ')}\n`);
    
    // Demo 2: Data Querying
    console.log('2️⃣ Data Querying Examples');
    
    const dataset = await createDataset('./example-data.csv');
    
    // Search
    const engineers = dataset.search('engineer');
    console.log(`   🔍 Found ${engineers.length} engineers: ${engineers.map(r => r.name).join(', ')}`);
    
    // Filter columns
    const essential = dataset.filter(['name', 'email', 'department']);
    console.log(`   📊 First row with essential info: ${essential[0].name} (${essential[0].email}) - ${essential[0].department}`);
    
    // Pagination
    const page1 = dataset.paginate(1, 3);
    console.log(`   📄 Page 1 shows ${page1.data.length} items out of ${page1.pagination.totalRows} total`);
    
    // Statistics
    const stats = dataset.getStats(['salary', 'age']);
    console.log(`   💰 Average salary: $${stats.salary.mean}`);
    console.log(`   🎂 Average age: ${stats.age.mean.toFixed(1)} years\n`);
    
    // Demo 3: Start API Server
    console.log('3️⃣ Starting API Server');
    console.log('   Creating server on port 3003...');
    
    const app = createServer(loader, 3003);
    const serverInfo = await startServer(app, 3003);
    
    console.log(`   🌐 Server running at: ${serverInfo.url}`);
    console.log(`   📖 API docs: ${serverInfo.url}/`);
    console.log(`   💚 Health check: ${serverInfo.url}/health`);
    console.log(`   📊 Data endpoint: ${serverInfo.url}/data`);
    console.log('');
    
    console.log('🔍 Try these example API calls:');
    console.log(`   curl "${serverInfo.url}/data?search=engineer"`);
    console.log(`   curl "${serverInfo.url}/data?columns=name,email&page=1&limit=3"`);
    console.log(`   curl "${serverInfo.url}/stats"`);
    console.log(`   curl "${serverInfo.url}/unique/department"`);
    console.log('');
    
    console.log('💡 Press Ctrl+C to stop the server and end the demo');
    console.log('');
    
    // Keep server running for demo
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping demo server...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo();
}
