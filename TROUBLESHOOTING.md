# Troubleshooting Guide

## Socket.IO Connection Errors

### Error: "WebSocket connection to 'ws://localhost:3000/socket.io/' failed"

**Cause:** The backend server is not running or not accessible.

**Solution:**

1. **Start the backend server:**
   ```bash
   cd backend
   npm install  # If you haven't already
   npm run dev
   ```

2. **Verify the backend is running:**
   - You should see: `🚀 StockMaster API server running on port 3000`
   - You should see: `📡 Socket.IO server ready for connections`

3. **Check environment variables:**
   - Ensure `backend/.env` exists with correct configuration
   - Verify `VITE_SOCKET_URL` in frontend `.env` matches backend port

4. **Check if port 3000 is available:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

5. **The app will still work without Socket.IO:**
   - Real-time updates will be disabled
   - All other features (CRUD operations) will work normally
   - You can manually refresh to see updates

## Common Issues

### Backend won't start

**Error:** `Missing Supabase environment variables`

**Solution:**
1. Create `backend/.env` file
2. Add your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

### Frontend can't connect to API

**Error:** `Network Error` or `CORS error`

**Solution:**
1. Verify backend is running on port 3000
2. Check `VITE_API_URL` in frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
3. Verify CORS settings in `backend/src/server.js`

### Database errors

**Error:** `Failed to fetch products` or similar

**Solution:**
1. Verify Supabase project is active
2. Run `database/schema.sql` in Supabase SQL Editor
3. Check Supabase credentials in backend `.env`
4. Verify service role key has proper permissions

### Forms not loading products/locations

**Error:** Dropdowns are empty

**Solution:**
1. Ensure database is seeded (run `database/seed.sql`)
2. Check browser console for API errors
3. Verify backend data endpoints are working:
   ```bash
   curl http://localhost:3000/api/products
   ```

## Development Tips

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd project
npm run dev
```

### Testing Without Backend

The frontend can work without the backend for UI development:
- Socket.IO errors are handled gracefully
- API calls will fail but won't crash the app
- You can develop UI components independently

### Checking Socket.IO Status

Open browser console:
- ✅ `Socket.IO connected` - Working correctly
- ⚠️ `Socket.IO connection failed` - Backend not running (app still works)
- ❌ `Socket.IO disconnected` - Connection lost (will auto-reconnect)

## Still Having Issues?

1. Check all environment variables are set correctly
2. Verify both servers are running
3. Check browser console for detailed error messages
4. Verify Supabase project is active and accessible
5. Ensure all dependencies are installed (`npm install` in both directories)


