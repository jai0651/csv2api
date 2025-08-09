import express from 'express';
import cors from 'cors';
import { createApiRoutes } from './apiRoutes.js';

/**
 * Create and configure Express server
 * @param {Object} csvLoader - CSV loader instance
 * @param {number} port - Port to run server on
 * @returns {Object} - Express app instance
 */
export function createServer(csvLoader, port = 3000) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      csvLoaded: csvLoader.getData().length > 0
    });
  });

  // API routes
  app.use('/', createApiRoutes(csvLoader));

  // Global error handler
  app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler for unmatched routes
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not found',
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
      availableRoutes: [
        'GET /',
        'GET /health',
        'GET /data',
        'GET /data/:id',
        'GET /columns',
        'GET /stats',
        'GET /unique/:column'
      ]
    });
  });

  return app;
}

/**
 * Start the Express server
 * @param {Object} app - Express app instance
 * @param {number} port - Port to run server on
 * @returns {Promise<Object>} - Server instance and port info
 */
export async function startServer(app, port = 3000) {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(port, () => {
        const address = server.address();
        const actualPort = address.port;
        
        console.log(`🚀 CSV2API Server running on port ${actualPort}`);
        console.log(`📊 API available at: http://localhost:${actualPort}`);
        console.log(`📖 Documentation at: http://localhost:${actualPort}/`);
        console.log(`💚 Health check at: http://localhost:${actualPort}/health`);
        
        resolve({
          server,
          port: actualPort,
          url: `http://localhost:${actualPort}`
        });
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`❌ Port ${port} is already in use`);
          console.error(`💡 Try using a different port: --port ${port + 1}`);
        } else {
          console.error('❌ Failed to start server:', error.message);
        }
        reject(error);
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        server.close(() => {
          console.log('✅ Server closed');
          process.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down server...');
        server.close(() => {
          console.log('✅ Server closed');
          process.exit(0);
        });
      });

    } catch (error) {
      reject(error);
    }
  });
}
