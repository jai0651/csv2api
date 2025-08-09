import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import chokidar from 'chokidar';

/**
 * Core CSV loading, parsing, and watching functionality
 */
export class CsvLoader {
  constructor() {
    this.data = [];
    this.columns = [];
    this.filePath = null;
    this.watcher = null;
    this.onDataChange = null;
  }

  /**
   * Load CSV data from file
   * @param {string} filePath - Path to CSV file
   * @param {Object} options - Loading options
   * @returns {Promise<Object>} - Object containing data and metadata
   */
  async loadCsv(filePath, options = {}) {
    try {
      this.filePath = path.resolve(filePath);
      
      if (!fs.existsSync(this.filePath)) {
        throw new Error(`CSV file not found: ${this.filePath}`);
      }

      const data = [];
      const columns = new Set();
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(this.filePath)
          .pipe(csv())
          .on('data', (row) => {
            data.push(row);
            // Collect all column names
            Object.keys(row).forEach(key => columns.add(key));
          })
          .on('end', () => {
            this.data = data;
            this.columns = Array.from(columns);
            
            const result = {
              data: this.data,
              columns: this.columns,
              totalRows: this.data.length,
              filePath: this.filePath,
              lastModified: fs.statSync(this.filePath).mtime
            };
            
            resolve(result);
          })
          .on('error', (error) => {
            reject(new Error(`Error parsing CSV: ${error.message}`));
          });
      });
    } catch (error) {
      throw new Error(`Failed to load CSV: ${error.message}`);
    }
  }

  /**
   * Start watching CSV file for changes
   * @param {string} filePath - Path to CSV file
   * @param {Function} onDataChange - Callback when data changes
   * @param {boolean} watch - Whether to enable watching
   */
  async startWatching(filePath, onDataChange, watch = true) {
    if (!watch) return;

    this.onDataChange = onDataChange;
    
    try {
      // Stop existing watcher if any
      if (this.watcher) {
        this.watcher.close();
      }

      this.watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100
        }
      });

      this.watcher.on('change', async (changedPath) => {
        console.log(`CSV file changed: ${changedPath}`);
        try {
          await this.loadCsv(changedPath);
          if (this.onDataChange) {
            this.onDataChange(this.data, this.columns);
          }
        } catch (error) {
          console.error('Error reloading CSV:', error.message);
        }
      });

      this.watcher.on('error', (error) => {
        console.error('File watcher error:', error);
      });

      console.log(`Watching CSV file: ${filePath}`);
    } catch (error) {
      console.error('Failed to start file watcher:', error.message);
    }
  }

  /**
   * Stop watching CSV file
   */
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('Stopped watching CSV file');
    }
  }

  /**
   * Get current data
   * @returns {Array} - Current CSV data
   */
  getData() {
    return this.data;
  }

  /**
   * Get current columns
   * @returns {Array} - Current CSV columns
   */
  getColumns() {
    return this.columns;
  }

  /**
   * Get file metadata
   * @returns {Object} - File metadata
   */
  getMetadata() {
    if (!this.filePath) return null;
    
    try {
      const stats = fs.statSync(this.filePath);
      return {
        filePath: this.filePath,
        fileName: path.basename(this.filePath),
        totalRows: this.data.length,
        totalColumns: this.columns.length,
        columns: this.columns,
        lastModified: stats.mtime,
        fileSize: stats.size
      };
    } catch (error) {
      return null;
    }
  }
}

// Export a default instance for library usage
export const csvLoader = new CsvLoader();

// Export the loadCsv function for backward compatibility
export const loadCsv = (filePath, options) => csvLoader.loadCsv(filePath, options);
