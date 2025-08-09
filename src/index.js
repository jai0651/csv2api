/**
 * CSV2API - Node.js library for loading and querying CSV data
 * 
 * This module provides functions to load CSV files and perform various
 * operations like searching, filtering, pagination, and data analysis.
 */

// Core CSV loading functionality
import { CsvLoader, csvLoader, loadCsv } from './csvLoader.js';
export { CsvLoader, csvLoader, loadCsv } from './csvLoader.js';

// Query utilities
import {
  searchCsv,
  filterColumns,
  paginateCsv,
  getRowById,
  sortCsv,
  getUniqueValues,
  getColumnStats
} from './queryUtils.js';
export {
  searchCsv,
  filterColumns,
  paginateCsv,
  getRowById,
  sortCsv,
  getUniqueValues,
  getColumnStats
} from './queryUtils.js';

// Server utilities (for advanced usage)
export { createServer, startServer } from './server.js';
export { createApiRoutes } from './apiRoutes.js';

/**
 * Convenience function to quickly load and query CSV data
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} - CSV data and metadata
 */
export async function quickLoad(filePath, options = {}) {
  const loader = new CsvLoader();
  return await loader.loadCsv(filePath, options);
}

/**
 * Create a queryable CSV dataset
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} - Queryable dataset object
 */
export async function createDataset(filePath, options = {}) {
  const loader = new CsvLoader();
  await loader.loadCsv(filePath, options);
  
  return {
    // Data access
    getData: () => loader.getData(),
    getColumns: () => loader.getColumns(),
    getMetadata: () => loader.getMetadata(),
    
    // Query methods
    search: (term) => searchCsv(loader.getData(), term),
    filter: (columns) => filterColumns(loader.getData(), columns),
    paginate: (page, limit) => paginateCsv(loader.getData(), page, limit),
    findById: (id, idColumn) => getRowById(loader.getData(), id, idColumn),
    sort: (column, direction) => sortCsv(loader.getData(), column, direction),
    getUnique: (column) => getUniqueValues(loader.getData(), column),
    getStats: (columns) => getColumnStats(loader.getData(), columns),
    
    // Reload data
    reload: () => loader.loadCsv(filePath, options),
    
    // Watch for changes
    watch: (callback, enable = true) => loader.startWatching(filePath, callback, enable),
    stopWatching: () => loader.stopWatching()
  };
}

/**
 * Utility function to validate CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<boolean>} - Whether file is valid CSV
 */
export async function validateCsv(filePath) {
  try {
    const loader = new CsvLoader();
    await loader.loadCsv(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get CSV file information without loading full data
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Object>} - File metadata
 */
export async function getCsvInfo(filePath) {
  try {
    const loader = new CsvLoader();
    await loader.loadCsv(filePath);
    return loader.getMetadata();
  } catch (error) {
    throw new Error(`Failed to get CSV info: ${error.message}`);
  }
}

// Default export for convenience
const csv2api = {
  CsvLoader,
  csvLoader,
  loadCsv,
  searchCsv,
  filterColumns,
  paginateCsv,
  getRowById,
  sortCsv,
  getUniqueValues,
  getColumnStats,
  quickLoad,
  createDataset,
  validateCsv,
  getCsvInfo
};

export default csv2api;
