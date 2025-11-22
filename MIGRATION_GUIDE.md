# Migration Guide: Supabase to MySQL

## Database Setup

1. **Access phpMyAdmin:**
   - Go to http://www.phpmyadmin.co
   - Login with credentials:
     - Host: sql12.freesqldatabase.com
     - Database: sql12808934
     - User: sql12808934
     - Password: pNWB367nhp
     - Port: 3306

2. **Create Tables:**
   - Open SQL tab in phpMyAdmin
   - Run the SQL from `database/mysql_schema.sql`
   - This will create all required tables

3. **Seed Data:**
   - Run the SQL from `database/mysql_seed.sql`
   - This will populate sample data

## Backend Configuration

1. **Update `.env` file in `backend/` directory:**
```env
DB_HOST=sql12.freesqldatabase.com
DB_USER=sql12808934
DB_PASSWORD=pNWB367nhp
DB_NAME=sql12808934
DB_PORT=3306
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

2. **Install dependencies:**
```bash
cd backend
npm install
```

3. **Start backend:**
```bash
npm run dev
```

## Frontend Configuration

1. **Remove Supabase dependencies** (already done)
2. **Install dependencies:**
```bash
cd project
npm install
```

3. **Start frontend:**
```bash
npm run dev
```

## Key Changes

### Backend
- ✅ Replaced Supabase client with MySQL connection pool
- ✅ Updated all services to use MySQL queries
- ✅ Added transaction support for stock updates
- ✅ Updated data controllers to use MySQL

### Frontend
- ✅ Removed Supabase client
- ✅ Added dataService using API calls
- ✅ Added theme toggle (light/dark mode)
- ✅ Made stats cards clickable with detailed views
- ✅ Added StatsDetailModal component

## Features Added

1. **Clickable Stats Cards:**
   - Click any stat card to see detailed list of operations
   - Shows filtered operations based on card type

2. **Dark Mode:**
   - Toggle button in navigation
   - Persists preference in localStorage
   - Full dark theme support across all components

3. **Dynamic Data:**
   - All data now loads from MySQL database
   - Real-time updates via Socket.IO
   - Proper error handling

## Testing

1. Verify database connection in backend logs
2. Test creating operations (receipts, deliveries, transfers)
3. Test validating operations
4. Test clicking stats cards to see detailed views
5. Test theme toggle

## Troubleshooting

- **Connection errors:** Check database credentials in `.env`
- **Table errors:** Ensure schema.sql was run successfully
- **Empty data:** Run seed.sql to populate sample data
- **Theme not working:** Clear browser cache and localStorage


