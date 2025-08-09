import express from 'express';
import { 
  searchCsv, 
  filterColumns, 
  paginateCsv, 
  getRowById,
  sortCsv,
  getUniqueValues,
  getColumnStats
} from './queryUtils.js';

/**
 * API routes for CSV data endpoints
 */
export function createApiRoutes(csvLoader) {
  const router = express.Router();

  // GET / - API metadata and available endpoints
  router.get('/', (req, res) => {
    const metadata = csvLoader.getMetadata();
    
    if (!metadata) {
      return res.status(404).json({
        error: 'No CSV file loaded',
        message: 'Please load a CSV file first'
      });
    }

    res.json({
      message: 'CSV2API Server',
      version: '1.0.0',
      csv: metadata,
      endpoints: {
        'GET /': 'API metadata and available endpoints',
        'GET /data': 'Get all CSV data with optional filtering, search, and pagination',
        'GET /data/:id': 'Get a single row by ID',
        'GET /columns': 'Get all column names',
        'GET /stats': 'Get basic statistics for numeric columns',
        'GET /unique/:column': 'Get unique values from a specific column'
      },
      queryParams: {
        search: 'Case-insensitive search across all fields',
        columns: 'Comma-separated list of columns to return',
        page: 'Page number for pagination (default: 1)',
        limit: 'Number of items per page (default: 10)',
        sort: 'Column name to sort by',
        order: 'Sort order: asc or desc (default: asc)'
      },
      examples: {
        'GET /data?search=john': 'Search for rows containing "john"',
        'GET /data?columns=name,email&page=1&limit=5': 'Get first 5 rows with only name and email columns',
        'GET /data?sort=age&order=desc': 'Sort by age in descending order'
      }
    });
  });

  // GET /data - Get all CSV data with optional filtering, search, and pagination
  router.get('/data', (req, res) => {
    try {
      const data = csvLoader.getData();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          error: 'No data available',
          message: 'CSV file is empty or not loaded'
        });
      }

      let result = [...data];

      // Apply search filter
      if (req.query.search) {
        result = searchCsv(result, req.query.search);
      }

      // Apply column filtering
      if (req.query.columns) {
        result = filterColumns(result, req.query.columns);
      }

      // Apply sorting
      if (req.query.sort) {
        const order = req.query.order === 'desc' ? 'desc' : 'asc';
        result = sortCsv(result, req.query.sort, order);
      }

      // Apply pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const paginated = paginateCsv(result, page, limit);

      res.json({
        success: true,
        data: paginated.data,
        pagination: paginated.pagination,
        totalResults: result.length,
        appliedFilters: {
          search: req.query.search || null,
          columns: req.query.columns || null,
          sort: req.query.sort || null,
          order: req.query.order || 'asc'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // GET /data/:id - Get a single row by ID
  router.get('/data/:id', (req, res) => {
    try {
      const data = csvLoader.getData();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          error: 'No data available',
          message: 'CSV file is empty or not loaded'
        });
      }

      const id = req.params.id;
      const idColumn = req.query.idColumn; // Optional: specify which column to use as ID
      
      const row = getRowById(data, id, idColumn);
      
      if (!row) {
        return res.status(404).json({
          error: 'Row not found',
          message: `No row found with ID: ${id}`,
          availableIds: data.slice(0, 10).map((r, index) => {
            const firstCol = Object.keys(r)[0];
            return r[firstCol] || index;
          })
        });
      }

      res.json({
        success: true,
        data: row,
        id: id,
        idColumn: idColumn || Object.keys(data[0])[0]
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // GET /columns - Get all column names
  router.get('/columns', (req, res) => {
    try {
      const columns = csvLoader.getColumns();
      
      if (!columns || columns.length === 0) {
        return res.status(404).json({
          error: 'No columns available',
          message: 'CSV file has no columns or not loaded'
        });
      }

      res.json({
        success: true,
        columns: columns,
        totalColumns: columns.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // GET /stats - Get basic statistics for numeric columns
  router.get('/stats', (req, res) => {
    try {
      const data = csvLoader.getData();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          error: 'No data available',
          message: 'CSV file is empty or not loaded'
        });
      }

      const columns = req.query.columns ? req.query.columns.split(',') : [];
      const stats = getColumnStats(data, columns);

      res.json({
        success: true,
        stats: stats,
        totalRows: data.length,
        analyzedColumns: Object.keys(stats)
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // GET /unique/:column - Get unique values from a specific column
  router.get('/unique/:column', (req, res) => {
    try {
      const data = csvLoader.getData();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          error: 'No data available',
          message: 'CSV file is empty or not loaded'
        });
      }

      const column = req.params.column;
      const columns = csvLoader.getColumns();
      
      if (!columns.includes(column)) {
        return res.status(400).json({
          error: 'Invalid column',
          message: `Column '${column}' not found`,
          availableColumns: columns
        });
      }

      const uniqueValues = getUniqueValues(data, column);

      res.json({
        success: true,
        column: column,
        uniqueValues: uniqueValues,
        totalUnique: uniqueValues.length,
        totalRows: data.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  });

  // 404 handler for undefined routes
  router.use('*', (req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
      availableEndpoints: [
        'GET /',
        'GET /data',
        'GET /data/:id',
        'GET /columns',
        'GET /stats',
        'GET /unique/:column'
      ]
    });
  });

  return router;
}
