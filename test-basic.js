#!/usr/bin/env node

/**
 * Basic test script for CSV2API
 * Tests core functionality without external testing framework
 */

import { 
  CsvLoader, 
  searchCsv, 
  filterColumns, 
  paginateCsv, 
  getRowById 
} from './src/index.js';

async function runTests() {
  console.log('🧪 Running CSV2API Basic Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;

  function test(name, testFn) {
    totalTests++;
    try {
      testFn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
    }
  }

  try {
    // Test 1: CSV Loading
    test('CSV Loading', async () => {
      const loader = new CsvLoader();
      const result = await loader.loadCsv('./example-data.csv');
      
      if (!result.data || result.data.length === 0) {
        throw new Error('No data loaded');
      }
      
      if (result.totalRows !== 15) {
        throw new Error(`Expected 15 rows, got ${result.totalRows}`);
      }
      
      if (result.columns.length !== 9) {
        throw new Error(`Expected 9 columns, got ${result.columns.length}`);
      }
    });

    // Test 2: Search Functionality
    test('Search Functionality', () => {
      const testData = [
        { name: 'John', email: 'john@test.com', age: '30' },
        { name: 'Jane', email: 'jane@test.com', age: '25' },
        { name: 'Bob', email: 'bob@test.com', age: '35' }
      ];
      
      const results = searchCsv(testData, 'john');
      if (results.length !== 1) {
        throw new Error(`Expected 1 result, got ${results.length}`);
      }
      
      const results2 = searchCsv(testData, 'test');
      if (results2.length !== 3) {
        throw new Error(`Expected 3 results, got ${results2.length}`);
      }
    });

    // Test 3: Column Filtering
    test('Column Filtering', () => {
      const testData = [
        { name: 'John', email: 'john@test.com', age: '30', city: 'NYC' },
        { name: 'Jane', email: 'jane@test.com', age: '25', city: 'LA' }
      ];
      
      const filtered = filterColumns(testData, ['name', 'email']);
      
      if (filtered.length !== 2) {
        throw new Error(`Expected 2 rows, got ${filtered.length}`);
      }
      
      if (Object.keys(filtered[0]).length !== 2) {
        throw new Error(`Expected 2 columns, got ${Object.keys(filtered[0]).length}`);
      }
      
      if (!filtered[0].hasOwnProperty('name') || !filtered[0].hasOwnProperty('email')) {
        throw new Error('Expected name and email columns');
      }
    });

    // Test 4: Pagination
    test('Pagination', () => {
      const testData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
      
      const page1 = paginateCsv(testData, 1, 10);
      if (page1.data.length !== 10) {
        throw new Error(`Expected 10 items on page 1, got ${page1.data.length}`);
      }
      
      if (page1.pagination.totalPages !== 3) {
        throw new Error(`Expected 3 total pages, got ${page1.pagination.totalPages}`);
      }
      
      if (!page1.pagination.hasNext) {
        throw new Error('Expected hasNext to be true for page 1');
      }
    });

    // Test 5: Get Row by ID
    test('Get Row by ID', () => {
      const testData = [
        { id: '1', name: 'John', email: 'john@test.com' },
        { id: '2', name: 'Jane', email: 'jane@test.com' }
      ];
      
      const row = getRowById(testData, '1');
      if (!row || row.name !== 'John') {
        throw new Error('Expected to find John with ID 1');
      }
      
      const notFound = getRowById(testData, '999');
      if (notFound !== null) {
        throw new Error('Expected null for non-existent ID');
      }
    });

    // Test 6: Load and query actual CSV
    test('Load and Query Actual CSV', async () => {
      const loader = new CsvLoader();
      const result = await loader.loadCsv('./example-data.csv');
      
      // Test search
      const engineers = searchCsv(result.data, 'engineer');
      if (engineers.length === 0) {
        throw new Error('Expected to find engineers in the data');
      }
      
      // Test column filtering
      const namesOnly = filterColumns(result.data, ['name', 'email']);
      if (namesOnly[0].hasOwnProperty('age')) {
        throw new Error('Expected only name and email columns');
      }
      
      // Test pagination
      const firstPage = paginateCsv(result.data, 1, 5);
      if (firstPage.data.length !== 5) {
        throw new Error(`Expected 5 items on first page, got ${firstPage.data.length}`);
      }
    });

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! CSV2API is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
