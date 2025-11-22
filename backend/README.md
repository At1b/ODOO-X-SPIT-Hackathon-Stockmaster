# StockMaster Backend - Node.js + Express + MySQL

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL database access

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the backend directory:
```
DB_HOST=sql12.freesqldatabase.com
DB_DATABASE=sql12808934
DB_USER=sql12808934
DB_PASSWORD=your_password
DB_PORT=3306
PORT=3000
```

3. Initialize the database:
```bash
npm run init-db
```

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Products
- `GET /api/products` - Get all products (supports search, filters, pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (auto-generates SKU & barcode)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/stock` - Get stock by location
- `POST /api/products/:id/generate-sku` - Generate new SKU

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### Tables Created:
1. **products** - Product master data
2. **categories** - Product categories
3. **product_locations** - Stock by location
4. **reordering_rules** - Min/max stock rules
5. **stock_movements** - Initial stock adjustments

## Features
- Auto-generate unique SKU
- Generate barcode (base64)
- Low stock detection
- Location-based inventory
- Reordering rules
- Input validation with Joi
