# Deployment Notes

## Render.com Configuration

### Build Command
Make sure Render is configured with this build command:
```bash
npm run build
```

This will:
1. Install backend dependencies
2. Navigate to `frontend/` folder
3. Install frontend dependencies
4. Build the React app to `frontend/build/`

### Start Command
```bash
npm start
```

This runs `node server.js` which:
- In production mode, serves the built frontend from `frontend/build/`
- Handles all API routes under `/api`
- Serves `index.html` for all non-API routes (React Router)

### Environment Variables
Required on Render:
- `NODE_ENV=production`
- `MONGODB_URI` (optional, falls back to in-memory)
- `GEMINI_API_KEY` (required for AI categorization)
- `PORT` (automatically set by Render)

### Important Notes
1. **Frontend changes won't appear until rebuilt**: After pushing frontend changes, Render must run `npm run build` to rebuild the React app
2. **Cache issues**: If changes don't appear, clear browser cache or hard reload (Ctrl+Shift+R)
3. **Build logs**: Check Render build logs to ensure `npm run build` completes successfully

## Manual Build (Local Testing)
```bash
# Install all dependencies
npm run install-all

# Build frontend
cd frontend && npm run build

# Run in production mode
NODE_ENV=production npm start
```

## Verifying Deployment
After deployment completes, check:
1. Navigate to your Render URL
2. Hard refresh (Ctrl+Shift+R) to clear cache
3. Open browser console - should see no errors
4. Delete button should appear on document cards (red trash icon)
5. Test deletion functionality

## Troubleshooting

### Delete button not visible
- Check Render build logs - ensure `npm run build` ran
- Verify frontend build completed: "Compiled successfully!"
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors

### Delete not working
- Check backend logs for errors
- Verify DELETE route exists: `/api/delete/:id`
- Test directly: `curl -X DELETE https://your-app.onrender.com/api/delete/[id]`
- Check MongoDB connection if using database

### Build fails on Render
- Ensure `package.json` has correct build script
- Check Node version matches (20.x)
- Verify frontend dependencies install correctly
- Check Render build logs for specific errors
