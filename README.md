# CSV2API 🚀

Turn any CSV file into a REST API server - CLI tool and Node.js library

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **📊 CSV Loading**: Load and parse CSV files with automatic column detection
- **🔍 Search & Filter**: Full-text search across all fields with column filtering
- **📄 Pagination**: Built-in pagination with customizable page sizes
- **🔄 Real-time Updates**: Watch CSV files for changes and auto-reload
- **🌐 REST API**: Full REST API with comprehensive endpoints
- **📱 CLI Tool**: Command-line interface for quick server startup
- **📚 Library**: Use as a Node.js library in your own applications
- **📈 Statistics**: Built-in data analysis and column statistics
- **🔒 CORS Support**: Cross-origin resource sharing enabled by default

## 🚀 Quick Start

### Installation

```bash
npm install csv2api
```

### CLI Usage

```bash
# Start a server with a CSV file
npx csv2api data.csv

# Custom port and options
npx csv2api data.csv --port 8080 --host 0.0.0.0 --cors

# Disable file watching
npx csv2api data.csv --no-watch
```

### Library Usage

```javascript
import { loadCsv, searchCsv, createDataset } from 'csv2api';

// Quick load
const data = await loadCsv('./data.csv');
console.log(`Loaded ${data.totalRows} rows`);

// Create queryable dataset
const dataset = await createDataset('./data.csv');
const results = dataset.search('search term');
```

## 📖 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API documentation and metadata |
| `/health` | GET | Health check endpoint |
| `/data` | GET | Get all CSV data with filtering, search, and pagination |
| `/data/:id` | GET | Get a single row by ID |
| `/columns` | GET | Get all column names |
| `/stats` | GET | Get basic statistics for numeric columns |
| `/unique/:column` | GET | Get unique values from a specific column |

### Query Parameters

- `search`: Case-insensitive search across all fields
- `columns`: Comma-separated list of columns to return
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)
- `sort`: Column name to sort by
- `order`: Sort order: `asc` or `desc` (default: `asc`)

### Example Queries

```bash
# Search for specific content
GET /data?search=engineer

# Filter columns and paginate
GET /data?columns=name,email&page=1&limit=5

# Sort by column
GET /data?sort=salary&order=desc

# Get unique values
GET /unique/department
```

## 🛠️ CLI Options

```bash
csv2api <csv-file> [options]

Options:
  -p, --port <port>        Port to run the server on (default: 3000)
  -w, --watch <boolean>    Watch CSV file for changes (default: true)
  --no-watch               Disable file watching
  --host <host>            Host to bind the server to (default: localhost)
  --cors                   Enable CORS (enabled by default)
  --no-cors                Disable CORS
  -v, --verbose            Enable verbose logging
  -h, --help               Show help information
  -V, --version            Show version number
```

## 📚 Library API

### Core Classes

#### `CsvLoader`

Main class for loading and managing CSV data.

```javascript
import { CsvLoader } from 'csv2api';

const loader = new CsvLoader();

// Load CSV file
const result = await loader.loadCsv('./data.csv');

// Get data
const data = loader.getData();
const columns = loader.getColumns();
const metadata = loader.getMetadata();

// Watch for changes
loader.startWatching('./data.csv', (data, columns) => {
  console.log('CSV updated!');
});
```

#### `createDataset()`

Convenience function that creates a queryable dataset wrapper.

```javascript
import { createDataset } from 'csv2api';

const dataset = await createDataset('./data.csv');

// Query methods
const results = dataset.search('search term');
const filtered = dataset.filter(['name', 'email']);
const page = dataset.paginate(1, 10);
const row = dataset.findById('123');
const sorted = dataset.sort('salary', 'desc');
const unique = dataset.getUnique('department');
const stats = dataset.getStats(['salary', 'age']);
```

### Utility Functions

```javascript
import { 
  searchCsv, 
  filterColumns, 
  paginateCsv, 
  getRowById,
  sortCsv,
  getUniqueValues,
  getColumnStats 
} from 'csv2api';

// Search across all fields
const results = searchCsv(data, 'search term');

// Filter columns
const filtered = filterColumns(data, ['name', 'email']);

// Paginate results
const page = paginateCsv(data, 1, 10);

// Find by ID
const row = getRowById(data, '123');

// Sort data
const sorted = sortCsv(data, 'column', 'desc');

// Get unique values
const unique = getUniqueValues(data, 'column');

// Get statistics
const stats = getColumnStats(data, ['numeric_column']);
```

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

```bash
git clone <repository-url>
cd csv2api
npm install
```

### Scripts

```bash
# Run tests
npm test

# Run basic tests
node test-basic.js

# Run library tests
node test-library.js

# Start development server
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
csv2api/
├── src/
│   ├── index.js          # Main library exports
│   ├── csvLoader.js      # Core CSV loading functionality
│   ├── queryUtils.js     # Search, filter, pagination utilities
│   ├── server.js         # Express server setup
│   ├── apiRoutes.js      # API route definitions
│   └── cli.js           # Command-line interface
├── examples/
│   └── library-usage.js  # Library usage examples
├── test-basic.js         # Basic functionality tests
├── test-library.js       # Library functionality tests
├── example-data.csv      # Sample CSV data
└── package.json
```

## 📊 Example Data

The project includes sample data (`example-data.csv`) with employee information:

```csv
id,name,email,age,city,occupation,salary,department,hire_date
1,John Smith,john.smith@email.com,32,New York,Software Engineer,85000,Engineering,2020-03-15
2,Sarah Johnson,sarah.j@email.com,28,San Francisco,Product Manager,95000,Product,2019-07-22
...
```

## 🌟 Use Cases

- **Data Exploration**: Quickly explore CSV data through a web interface
- **API Development**: Create REST APIs from existing CSV datasets
- **Data Integration**: Serve CSV data to frontend applications
- **Prototyping**: Rapidly prototype data-driven applications
- **Data Analysis**: Built-in statistics and querying capabilities
- **Real-time Updates**: Monitor CSV files for changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/csv2api/issues)
- **Documentation**: [API Reference](docs/api-reference.md)
- **Examples**: [Examples Directory](examples/)

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- CSV parsing with [csv-parser](https://github.com/mafintosh/csv-parser)
- File watching with [chokidar](https://github.com/paulmillr/chokidar)
- CLI framework with [Commander.js](https://github.com/tj/commander.js)

---

**Made with ❤️ for the developer community**
