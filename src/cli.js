#!/usr/bin/env node

import { program } from 'commander';
import path from 'path';
import fs from 'fs';
import { CsvLoader } from './csvLoader.js';
import { createServer, startServer } from './server.js';

// CLI version and description
program
  .name('csv2api')
  .description('Turn any CSV file into a REST API server')
  .version('1.0.0')
  .argument('<csv-file>', 'Path to the CSV file to serve')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-w, --watch <boolean>', 'Watch CSV file for changes', 'true')
  .option('--no-watch', 'Disable file watching')
  .option('--host <host>', 'Host to bind the server to', 'localhost')
  .option('--cors', 'Enable CORS (enabled by default)')
  .option('--no-cors', 'Disable CORS')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--help', 'Show help information')
  .parse();

// Get command line arguments
const options = program.opts();
const csvFilePath = program.args[0];

// Validate CSV file path
if (!csvFilePath) {
  console.error('❌ Error: CSV file path is required');
  console.error('💡 Usage: csv2api <path-to-csv> [options]');
  console.error('💡 Example: csv2api data.csv --port 8080');
  process.exit(1);
}

// Resolve and validate file path
const resolvedPath = path.resolve(csvFilePath);

if (!fs.existsSync(resolvedPath)) {
  console.error(`❌ Error: CSV file not found: ${resolvedPath}`);
  console.error('💡 Please check the file path and try again');
  process.exit(1);
}

if (!resolvedPath.endsWith('.csv')) {
  console.error(`❌ Error: File must have .csv extension: ${resolvedPath}`);
  process.exit(1);
}

// Parse options
const port = parseInt(options.port) || 3000;
const watch = options.watch === 'true' || options.watch === true;
const host = options.host || 'localhost';
const cors = options.cors !== false; // Default to true
const verbose = options.verbose || false;

// Main CLI function
async function main() {
  try {
    console.log('🚀 Starting CSV2API...');
    console.log(`📁 CSV file: ${resolvedPath}`);
    console.log(`🌐 Port: ${port}`);
    console.log(`👀 Watch mode: ${watch ? 'enabled' : 'disabled'}`);
    console.log(`🔒 CORS: ${cors ? 'enabled' : 'disabled'}`);
    console.log('');

    // Create CSV loader instance
    const csvLoader = new CsvLoader();

    // Load initial CSV data
    console.log('📊 Loading CSV data...');
    const loadResult = await csvLoader.loadCsv(resolvedPath);
    console.log(`✅ Loaded ${loadResult.totalRows} rows with ${loadResult.columns.length} columns`);
    console.log(`📅 Last modified: ${loadResult.lastModified.toLocaleString()}`);
    console.log('');

    // Create and start server
    const app = createServer(csvLoader, port);
    const serverInfo = await startServer(app, port);

    // Start file watching if enabled
    if (watch) {
      await csvLoader.startWatching(resolvedPath, (data, columns) => {
        console.log(`🔄 CSV file updated - ${data.length} rows, ${columns.length} columns`);
        console.log(`📅 Last modified: ${new Date().toLocaleString()}`);
      }, true);
    }

    // Display available endpoints
    console.log('');
    console.log('📖 Available API endpoints:');
    console.log(`   GET ${serverInfo.url}/                    - API documentation`);
    console.log(`   GET ${serverInfo.url}/health              - Health check`);
    console.log(`   GET ${serverInfo.url}/data                - All CSV data`);
    console.log(`   GET ${serverInfo.url}/data/:id            - Single row by ID`);
    console.log(`   GET ${serverInfo.url}/columns             - Column names`);
    console.log(`   GET ${serverInfo.url}/stats               - Column statistics`);
    console.log(`   GET ${serverInfo.url}/unique/:column      - Unique values`);
    console.log('');

    console.log('🔍 Example queries:');
    console.log(`   ${serverInfo.url}/data?search=john`);
    console.log(`   ${serverInfo.url}/data?columns=name,email&page=1&limit=5`);
    console.log(`   ${serverInfo.url}/data?sort=age&order=desc`);
    console.log('');

    console.log('💡 Press Ctrl+C to stop the server');
    console.log('');

  } catch (error) {
    console.error('❌ Failed to start CSV2API:', error.message);
    
    if (error.code === 'EADDRINUSE') {
      console.error(`💡 Port ${port} is already in use. Try a different port:`);
      console.error(`   csv2api ${csvFilePath} --port ${port + 1}`);
    }
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
