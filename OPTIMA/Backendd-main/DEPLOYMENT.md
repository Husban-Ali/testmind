# Backend Deployment Guide

## Deploy to Vercel

### Step 1: Prepare Backend Repository

1. Create a new repository on GitHub for backend only
2. Navigate to server folder:
   ```bash
   cd server
   ```

3. Initialize git (if not already):
   ```bash
   git init
   ```

4. Add files:
   ```bash
   git add .
   git commit -m "Initial backend commit"
   ```

5. Push to GitHub:
   ```bash
   git remote add origin YOUR_BACKEND_REPO_URL
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your backend GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (leave as is)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

### Step 3: Environment Variables

Add these environment variables in Vercel Dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=production
```

### Step 4: Deploy

Click "Deploy" and wait for deployment to complete.

Your backend API will be available at: `https://your-backend.vercel.app/api`

---

## Frontend Deployment

### Step 1: Prepare Frontend Repository

1. Create another repository for frontend
2. Navigate to client folder:
   ```bash
   cd ../client
   ```

3. Initialize git:
   ```bash
   git init
   git add .
   git commit -m "Initial frontend commit"
   ```

4. Push to GitHub:
   ```bash
   git remote add origin YOUR_FRONTEND_REPO_URL
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Frontend on Vercel

1. Import frontend repository
2. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `.`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Environment Variables (Frontend)

```
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_SOCKET_URL=https://your-backend.vercel.app
```

### Step 4: Update API URLs in Frontend

Before deploying frontend, update `src/services/api.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

And `src/services/socket.js`:

```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
```

---

## Important Notes

⚠️ **Socket.IO Limitation on Vercel**:
Vercel's serverless functions don't support WebSocket connections well. For production with Socket.IO, consider:
- **Railway.app** (Better for Socket.IO)
- **Render.com** (Supports WebSockets)
- **Heroku**
- **DigitalOcean App Platform**

If you want to use Vercel, you may need to use a separate service for Socket.IO or switch to HTTP polling.

---

## Alternative: Deploy Both on Render.com

1. Create account on [render.com](https://render.com)
2. Create "Web Service" for backend
3. Create "Static Site" for frontend
4. Configure environment variables
5. Deploy both

Render supports WebSockets natively, so Socket.IO will work perfectly!
