#!/usr/bin/env node

/**
 * Example: Using CSV2API as a library
 * 
 * This script demonstrates how to import and use CSV2API functions
 * in your own Node.js applications.
 */

import { 
  loadCsv, 
  searchCsv, 
  filterColumns, 
  paginateCsv, 
  getRowById,
  sortCsv,
  getUniqueValues,
  getColumnStats,
  createDataset
} from '../src/index.js';

async function demonstrateLibraryUsage() {
  try {
    console.log('🚀 CSV2API Library Usage Examples\n');

    // Example 1: Basic CSV loading
    console.log('1️⃣ Loading CSV file...');
    const result = await loadCsv('./example-data.csv');
    console.log(`   ✅ Loaded ${result.totalRows} rows with ${result.columns.length} columns`);
    console.log(`   📅 Last modified: ${result.lastModified.toLocaleString()}\n`);

    // Example 2: Search functionality
    console.log('2️⃣ Searching for "engineer"...');
    const engineers = searchCsv(result.data, 'engineer');
    console.log(`   🔍 Found ${engineers.length} results containing "engineer"`);
    console.log(`   👥 Engineers: ${engineers.map(r => r.name).join(', ')}\n`);

    // Example 3: Column filtering
    console.log('3️⃣ Filtering columns...');
    const essentialInfo = filterColumns(result.data, ['name', 'email', 'department']);
    console.log(`   📊 First 3 rows with essential info:`);
    essentialInfo.slice(0, 3).forEach(row => {
      console.log(`      ${row.name} (${row.email}) - ${row.department}`);
    });
    console.log('');

    // Example 4: Pagination
    console.log('4️⃣ Pagination example...');
    const page1 = paginateCsv(result.data, 1, 5);
    console.log(`   📄 Page 1 of ${page1.pagination.totalPages} (${page1.pagination.totalRows} total rows)`);
    console.log(`   📊 Showing rows ${page1.pagination.startIndex}-${page1.pagination.endIndex}`);
    console.log(`   ➡️ Has next page: ${page1.pagination.hasNext}`);
    console.log(`   ⬅️ Has previous page: ${page1.pagination.hasPrev}\n`);

    // Example 5: Finding specific row
    console.log('5️⃣ Finding row by ID...');
    const employee = getRowById(result.data, '3');
    if (employee) {
      console.log(`   👤 Employee ID 3: ${employee.name} - ${employee.occupation} in ${employee.city}`);
    }
    console.log('');

    // Example 6: Sorting data
    console.log('6️⃣ Sorting by salary (highest first)...');
    const sortedBySalary = sortCsv(result.data, 'salary', 'desc');
    console.log(`   💰 Top 3 salaries:`);
    sortedBySalary.slice(0, 3).forEach((row, index) => {
      console.log(`      ${index + 1}. ${row.name}: $${row.salary}`);
    });
    console.log('');

    // Example 7: Getting unique values
    console.log('7️⃣ Unique departments...');
    const departments = getUniqueValues(result.data, 'department');
    console.log(`   🏢 Departments: ${departments.join(', ')}\n`);

    // Example 8: Column statistics
    console.log('8️⃣ Salary statistics...');
    const salaryStats = getColumnStats(result.data, ['salary', 'age']);
    console.log(`   💵 Salary stats:`, salaryStats.salary);
    console.log(`   🎂 Age stats:`, salaryStats.age);
    console.log('');

    // Example 9: Using the dataset wrapper
    console.log('9️⃣ Using dataset wrapper...');
    const dataset = await createDataset('./example-data.csv');
    
    console.log(`   📊 Dataset loaded: ${dataset.getData().length} rows`);
    console.log(`   🔍 Searching for "marketing": ${dataset.search('marketing').length} results`);
    console.log(`   📋 Columns: ${dataset.getColumns().join(', ')}`);
    console.log('');

    // Example 10: Advanced queries
    console.log('🔟 Advanced query combinations...');
    
    // Search + filter + paginate
    const marketingPeople = searchCsv(result.data, 'marketing');
    const marketingInfo = filterColumns(marketingPeople, ['name', 'email', 'salary']);
    const marketingPage = paginateCsv(marketingInfo, 1, 3);
    
    console.log(`   🎯 Marketing team (${marketingPage.pagination.totalResults} total):`);
    marketingPage.data.forEach(person => {
      console.log(`      ${person.name} - ${person.email} - $${person.salary}`);
    });

    console.log('\n✨ Library usage demonstration completed!');
    console.log('💡 Check the README.md for more examples and API documentation.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the demonstration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateLibraryUsage();
}
