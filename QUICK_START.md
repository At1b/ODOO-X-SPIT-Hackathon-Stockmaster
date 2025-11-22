# Quick Start Guide

## 🚀 Setup Steps

### 1. Database Setup (phpMyAdmin)

1. Go to http://www.phpmyadmin.co
2. Login with:
   - Host: `sql12.freesqldatabase.com`
   - Database: `sql12808934`
   - User: `sql12808934`
   - Password: `pNWB367nhp`
   - Port: `3306`

3. Click on SQL tab
4. Copy and run `database/mysql_schema.sql` - Creates all tables
5. Copy and run `database/mysql_seed.sql` - Adds sample data

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
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

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd project
npm install
```

Start frontend:
```bash
npm run dev
```

### 4. Access Application

Open http://localhost:5173 in your browser

## ✨ New Features

### Clickable Stats Cards
- Click any stat card (Total, Completed, Draft, Waiting) to see detailed list
- Shows filtered operations in a modal
- Full operation details with items

### Dark Mode
- Toggle button in top navigation
- Persists your preference
- Beautiful dark theme across all components

### Dynamic Data
- All data loads from MySQL database
- Real-time updates via Socket.IO
- No more static/empty data!

## 🎯 What's Changed

✅ **Removed Supabase** - Now using MySQL
✅ **Clickable Cards** - Click stats to see details
✅ **Dark Mode** - Full theme support
✅ **Dynamic Data** - Everything loads from database
✅ **Better UI** - Enhanced styling and interactions

## 📝 Notes

- Make sure backend is running before frontend
- Database credentials are already configured
- Theme preference is saved in browser localStorage
- All operations are now dynamic and connected to MySQL


