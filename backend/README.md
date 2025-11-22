# Haniya Inventory Backend

Production-ready Node.js + Express + MySQL backend for the Haniya Product Management module.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
Create a `.env` file based on `.env.example`:
```
DB_HOST=sql12.freesqldatabase.com
DB_DATABASE=sql12808934
DB_USER=sql12808934
DB_PASSWORD=your_password
DB_PORT=3306
PORT=3000
```

3. Initialize database:
```bash
npm run init-db
```
This creates the required tables: `products`, `locations`, and `product_stock_levels`.

4. Start server:
```bash
npm start
```

Server will run on `http://localhost:3000`

## Database Schema

### products
- `product_id` (PK, Auto Increment)
- `name` (VARCHAR 255, NOT NULL)
- `sku` (VARCHAR 100, UNIQUE, NOT NULL)
- `category` (VARCHAR 100, NOT NULL)
- `uom` (VARCHAR 50, NOT NULL)
- `low_stock_threshold` (INT, DEFAULT 10)
- `initial_stock` (INT, DEFAULT 0)
- `created_at` (TIMESTAMP)

### locations
- `location_id` (PK, Auto Increment)
- `name` (VARCHAR 255, NOT NULL)
- `code` (VARCHAR 50, UNIQUE, NOT NULL)
- `parent_id` (INT, FK to locations)
- `created_at` (TIMESTAMP)

### product_stock_levels
- `id` (PK, Auto Increment)
- `product_id` (FK to products)
- `location_id` (FK to locations)
- `quantity` (INT, DEFAULT 0)
- `last_updated` (TIMESTAMP)

## API Endpoints

### Products
- `GET /api/products` - List all products (supports search, category, location filters, pagination)
- `GET /api/products/:id` - Get product details by ID
- `POST /api/products` - Create new product (auto-generates SKU and barcode)
- `PUT /api/products/:id` - Update product details
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/locations` - Get stock breakdown by location
- `GET /api/products/categories/list` - Get list of all categories

### Locations
- `GET /api/locations` - List all locations
- `GET /api/locations/:id` - Get location details
- `POST /api/locations` - Create new location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

### Dashboard
- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics including:
  - Total products count
  - Low stock count
  - Total categories
  - Total stock across all locations
  - Stock by category breakdown
  - Stock by location breakdown
  - Recently added products

## Features

### SKU Generation
- Format: `CATEGORYCODE-NAMEHASH-XXXX`
- Example: `ELC-A3F2-0001`
- Deterministic and unique based on category, product name, and sequence

### Barcode Generation
- Automatically generates Code 128 barcode for each SKU
- Returns base64 encoded PNG image

### Low Stock Detection
- Automatically calculates low stock status
- Compares total stock across all locations against threshold

### Validation
- All inputs validated using Joi schema
- Consistent error response format
- Proper HTTP status codes

## Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "data": {},
  "error": "error message (if applicable)"
}
```
