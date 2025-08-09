/**
 * Utility functions for searching, filtering, and paginating CSV data
 */

/**
 * Search CSV data across all string fields (case-insensitive)
 * @param {Array} data - Array of objects (CSV rows)
 * @param {string} searchTerm - Search term to look for
 * @returns {Array} - Filtered rows that match the search term
 */
export function searchCsv(data, searchTerm) {
  if (!searchTerm || !data || data.length === 0) {
    return data;
  }

  const term = searchTerm.toLowerCase();
  
  return data.filter(row => {
    return Object.values(row).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(term);
    });
  });
}

/**
 * Filter CSV data to only include specified columns
 * @param {Array} data - Array of objects (CSV rows)
 * @param {Array|string} columns - Array of column names or comma-separated string
 * @returns {Array} - Rows with only the specified columns
 */
export function filterColumns(data, columns) {
  if (!columns || !data || data.length === 0) {
    return data;
  }

  // Convert string to array if needed
  const columnArray = Array.isArray(columns) ? columns : columns.split(',').map(col => col.trim());
  
  // Filter out empty column names
  const validColumns = columnArray.filter(col => col && col.length > 0);
  
  if (validColumns.length === 0) {
    return data;
  }

  return data.map(row => {
    const filteredRow = {};
    validColumns.forEach(col => {
      if (row.hasOwnProperty(col)) {
        filteredRow[col] = row[col];
      }
    });
    return filteredRow;
  });
}

/**
 * Paginate CSV data
 * @param {Array} data - Array of objects (CSV rows)
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 * @returns {Object} - Object containing paginated data and metadata
 */
export function paginateCsv(data, page = 1, limit = 10) {
  if (!data || data.length === 0) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: limit,
        totalRows: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  // Validate and normalize parameters
  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageLimit = Math.max(1, parseInt(limit) || 10);
  
  const totalRows = data.length;
  const totalPages = Math.ceil(totalRows / pageLimit);
  const startIndex = (currentPage - 1) * pageLimit;
  const endIndex = Math.min(startIndex + pageLimit, totalRows);
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page: currentPage,
      limit: pageLimit,
      totalRows,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      startIndex: startIndex + 1,
      endIndex
    }
  };
}

/**
 * Get a single row by ID
 * @param {Array} data - Array of objects (CSV rows)
 * @param {string|number} id - ID to search for
 * @param {string} idColumn - Column name to use as ID (defaults to first column)
 * @returns {Object|null} - Row object or null if not found
 */
export function getRowById(data, id, idColumn = null) {
  if (!data || data.length === 0 || id === undefined || id === null) {
    return null;
  }

  // If no specific ID column is provided, use the first column
  const columnToUse = idColumn || Object.keys(data[0])[0];
  
  if (!columnToUse) {
    return null;
  }

  return data.find(row => {
    const rowId = row[columnToUse];
    if (rowId === null || rowId === undefined) return false;
    
    // Try to match as string first, then as number
    return String(rowId) === String(id) || Number(rowId) === Number(id);
  }) || null;
}

/**
 * Sort CSV data by a specific column
 * @param {Array} data - Array of objects (CSV rows)
 * @param {string} column - Column name to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc', default: 'asc')
 * @returns {Array} - Sorted data
 */
export function sortCsv(data, column, direction = 'asc') {
  if (!data || data.length === 0 || !column) {
    return data;
  }

  const sortedData = [...data];
  
  sortedData.sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    // Try to compare as numbers first
    const aNum = Number(aVal);
    const bNum = Number(bVal);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return direction === 'desc' ? bNum - aNum : aNum - bNum;
    }
    
    // Fall back to string comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (direction === 'desc') {
      return bStr.localeCompare(aStr);
    }
    return aStr.localeCompare(bStr);
  });
  
  return sortedData;
}

/**
 * Get unique values from a specific column
 * @param {Array} data - Array of objects (CSV rows)
 * @param {string} column - Column name to get unique values from
 * @returns {Array} - Array of unique values
 */
export function getUniqueValues(data, column) {
  if (!data || data.length === 0 || !column) {
    return [];
  }

  const uniqueSet = new Set();
  
  data.forEach(row => {
    if (row[column] !== null && row[column] !== undefined) {
      uniqueSet.add(row[column]);
    }
  });
  
  return Array.from(uniqueSet);
}

/**
 * Get basic statistics for numeric columns
 * @param {Array} data - Array of objects (CSV rows)
 * @param {Array} numericColumns - Array of column names to analyze
 * @returns {Object} - Statistics for each numeric column
 */
export function getColumnStats(data, numericColumns = []) {
  if (!data || data.length === 0) {
    return {};
  }

  const stats = {};
  
  // If no columns specified, try to auto-detect numeric columns
  const columnsToAnalyze = numericColumns.length > 0 ? numericColumns : Object.keys(data[0]);
  
  columnsToAnalyze.forEach(column => {
    const values = data
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(val => Number(val));
    
    if (values.length > 0) {
      const sum = values.reduce((acc, val) => acc + val, 0);
      const mean = sum / values.length;
      const sorted = values.sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      stats[column] = {
        count: values.length,
        sum,
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
        range: Math.max(...values) - Math.min(...values)
      };
    }
  });
  
  return stats;
}
