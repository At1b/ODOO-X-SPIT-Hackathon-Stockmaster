# StockMaster - Operations Module

A complete, production-ready Operations Module for the Inventory Management System StockMaster, built with MERN stack and Supabase.

## 🚀 Features

- **Receipts (Incoming Stock)**: Create and manage incoming stock operations
- **Delivery Orders (Outgoing Stock)**: Handle outgoing stock with validation
- **Internal Transfers**: Transfer stock between locations
- **Real-time Updates**: Socket.IO integration for live updates
- **Automatic Stock Updates**: Stock levels update automatically on validation
- **Move History Logging**: Complete audit trail of all stock movements
- **Dynamic Filters**: Filter by status, type, warehouse, and product
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## 📁 Project Structure

```
project/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Supabase configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # Express server
│   └── package.json
├── database/               # Database schema & seeds
│   ├── schema.sql         # Complete Supabase schema
│   └── seed.sql           # Sample data
├── src/                    # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API & Socket.IO clients
│   ├── store/             # Zustand state management
│   └── App.tsx            # Main app component
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand (state management)
- React Hook Form + Zod (validation)
- Axios
- Socket.IO client

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Socket.IO
- Zod (validation)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Supabase account and project

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Run the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to project root:
```bash
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Run the development server:
```bash
npm run dev
```

### Database Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run `database/schema.sql` to create all tables
4. Run `database/seed.sql` to populate sample data

## 🎯 API Endpoints

### Operations
- `POST /api/operations/receipt` - Create receipt
- `POST /api/operations/delivery` - Create delivery order
- `POST /api/operations/transfer` - Create internal transfer
- `GET /api/operations` - Get operations (with filters)
- `GET /api/operations/:id` - Get operation details
- `PUT /api/operations/:id/validate` - Validate operation

## 🔄 Real-time Events

Socket.IO events emitted:
- `operation:created` - New operation created
- `operation:updated` - Operation status updated
- `stock:updated` - Stock levels changed

## 📝 Usage

### Creating a Receipt
1. Navigate to Receipts page
2. Click "Create Receipt"
3. Fill in supplier, destination location, and items
4. Save as draft or validate immediately

### Creating a Delivery Order
1. Navigate to Delivery Orders page
2. Click "Create Delivery"
3. Fill in customer, source location, and items
4. Validate when ready (checks stock availability)

### Creating a Transfer
1. Navigate to Internal Transfers page
2. Click "Create Transfer"
3. Select source and destination locations
4. Add items and quantities
5. Validate to execute transfer

## 🔐 Authentication

Currently uses a development stub. In production, implement proper JWT authentication in `backend/src/middleware/auth.js`.

## 📊 Database Schema

- `products` - Product catalog
- `warehouses` - Warehouse locations
- `locations` - Storage locations within warehouses
- `stock_levels` - Current stock at each location
- `operations` - Receipts, deliveries, and transfers
- `operation_items` - Items in each operation
- `move_history` - Complete audit trail

## 🚀 Production Deployment

1. Set up environment variables
2. Configure CORS for your domain
3. Implement proper JWT authentication
4. Set up Supabase Row Level Security (RLS)
5. Configure production database
6. Build frontend: `npm run build`
7. Deploy backend to your hosting service
8. Deploy frontend to static hosting (Vercel, Netlify, etc.)

## 📄 License

MIT


