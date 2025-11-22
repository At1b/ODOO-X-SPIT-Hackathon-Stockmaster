# StockMaster Setup Guide

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd project
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL from `database/schema.sql` to create all tables
4. Run the SQL from `database/seed.sql` to populate sample data

### 3. Configure Environment Variables

**Backend (.env in backend/):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (.env in project/):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd project
npm run dev
```

### 5. Access the Application

Open http://localhost:5173 in your browser.

## Database Schema Overview

The system uses the following main tables:

- **products**: Product catalog with SKU, category, UOM
- **warehouses**: Warehouse locations
- **locations**: Storage locations within warehouses
- **stock_levels**: Current stock quantity at each location
- **operations**: Receipts, deliveries, and transfers
- **operation_items**: Items in each operation
- **move_history**: Complete audit trail of all stock movements

## Features

✅ Create Receipts (incoming stock)
✅ Create Delivery Orders (outgoing stock)
✅ Create Internal Transfers (location to location)
✅ Validate operations (updates stock automatically)
✅ Real-time updates via Socket.IO
✅ Filter operations by type, status, warehouse, product
✅ Complete move history logging

## Troubleshooting

### Backend won't start
- Check that all environment variables are set
- Verify Supabase credentials are correct
- Ensure port 3000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check VITE_API_URL in frontend .env
- Check CORS settings in backend

### Socket.IO not connecting
- Verify VITE_SOCKET_URL in frontend .env
- Check backend Socket.IO server is running
- Check browser console for connection errors

### Database errors
- Verify schema.sql was run successfully
- Check Supabase project is active
- Verify service role key has proper permissions


