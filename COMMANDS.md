# 🚀 Command Reference - Copy & Paste Ready

## Backend Setup & Run

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Alternative: Run production
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║   Xposure Therapist Backend Server Started                ║
╠════════════════════════════════════════════════════════════╣
║   Server: http://0.0.0.0:3000                             ║
║   Health: http://localhost:3000/health                    ║
║   WebSocket: ws://localhost:3000                          ║
╚════════════════════════════════════════════════════════════╝
```

---

## Frontend Setup & Run

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Expected Output:**
```
VITE v4.4.9  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

---

## Testing the System

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-29T10:30:45.123Z"
}
```

### Test 2: Send Test BPM (from ESP32)
```bash
curl -X POST http://localhost:3000/api/bpm \
  -H "Content-Type: application/json" \
  -d '{
    "bpm": 85,
    "raw": 1020,
    "baseline": 1015,
    "device": "ESP32-TEST"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "BPM recorded"
}
```

**Backend Console Output:**
```
📊 Received BPM: 85 (Device: ESP32-TEST)
```

### Test 3: Get Latest BPM
```bash
curl http://localhost:3000/api/latest
```

**Expected Response:**
```json
{
  "bpm": 85,
  "raw": 1020,
  "baseline": 1015,
  "device": "ESP32-TEST",
  "timestamp": "2024-03-29T10:30:45.123Z"
}
```

### Test 4: Update Session Config (from Therapist Dashboard)
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "speech_script": "Hello everyone, thank you for having me.",
    "crowd_count": 5,
    "volume_level": 0.7
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session updated",
  "data": {
    "speech_script": "Hello everyone, thank you for having me.",
    "crowd_count": 5,
    "volume_level": 0.7
  }
}
```

**Backend Console Output:**
```
📝 Session updated: Crowd=5, Volume=70%
```

### Test 5: Unity Polls Session (Query from VR)
```bash
curl http://localhost:3000/v1/session/default
```

**Expected Response:**
```json
{
  "sessionId": "default",
  "speech_script": "Hello everyone, thank you for having me.",
  "crowd_count": 5,
  "volume_level": 0.7,
  "timestamp": "2024-03-29T10:30:45.123Z"
}
```

### Test 6: Get Dashboard Statistics
```bash
curl http://localhost:3000/api/stats
```

**Expected Response:**
```json
{
  "current_bpm": 85,
  "session_config": {
    "speech_script": "Hello everyone...",
    "crowd_count": 5,
    "volume_level": 0.7
  },
  "server_uptime": 3600.5,
  "timestamp": "2024-03-29T10:30:45.123Z"
}
```

---

## Continuous Testing

### Send BPM Every 1 Second (Simulating ESP32)
```bash
# macOS/Linux
while true; do
  curl -X POST http://localhost:3000/api/bpm \
    -H "Content-Type: application/json" \
    -d "{\"bpm\": $((60 + RANDOM % 50)), \"raw\": 1023, \"baseline\": 1020, \"device\": \"ESP32-SIM\"}"
  sleep 1
done
```

```bash
# Windows PowerShell
while ($true) {
  $bpm = Get-Random -Minimum 60 -Maximum 110
  Invoke-WebRequest -Uri "http://localhost:3000/api/bpm" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body "{`"bpm`": $bpm, `"raw`": 1023, `"baseline`": 1020, `"device`": `"ESP32-SIM`"}"
  Start-Sleep -Seconds 1
}
```

### Monitor Backend Logs
```bash
# With npm run dev (already shows logs)
npm run dev

# Or separately, use log following
tail -f backend.log  # if logging to file
```

---

## Database Setup (Future)

### MongoDB
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
apt-get install mongodb        # Ubuntu

# Start MongoDB
mongod

# Backend connection
npm install mongoose
# Then add to server.js: mongoose.connect('mongodb://localhost:27017/xposure')
```

### PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
apt-get install postgresql  # Ubuntu

# Start PostgreSQL
brew services start postgresql

# Backend connection
npm install pg
# Then add to server.js connection pool setup
```

---

## Deployment Commands

### Deploy to Heroku
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create xposure-app

# Deploy backend
cd backend
git subtree push --prefix backend heroku main

# Set environment variables
heroku config:set NODE_ENV=production

# View logs
heroku logs --tail
```

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g railway

# Login
railway login

# Deploy from project root
railway up

# Link to project
railway link
```

### Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend folder
cd frontend
vercel

# Production build
vercel --prod
```

---

## Debugging & Monitoring

### View All Running Processes on Port 3000
```bash
lsof -i :3000
```

### Kill Process on Port 3000
```bash
kill -9 <PID>
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reset Dependencies
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Check Node Version
```bash
node --version
npm --version
```

### Install Specific Node Version (using nvm)
```bash
nvm install 18.19.0
nvm use 18.19.0
nvm default 18.19.0
```

---

## Environment Variables

### Create `.env` in backend/
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/xposure
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
```

### Create `.env.local` in frontend/
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## Git Commands

### Initialize Git (if not already done)
```bash
cd Xposure_Therapist_Interface
git init
git add .
git commit -m "Initial commit: React frontend + Express backend"
```

### Create GitHub Repository
```bash
# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/Xposure_Therapist_Interface.git
git branch -M main
git push -u origin main
```

### Useful Git Commands
```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature
```

---

## Docker Setup (Optional)

### Create Dockerfile for Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Build Docker Image
```bash
docker build -t xposure-backend .
```

### Run Docker Container
```bash
docker run -p 3000:3000 xposure-backend
```

### Create Docker Compose
```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

### Run with Docker Compose
```bash
docker-compose up
```

---

## Performance Monitoring

### Monitor CPU/Memory (macOS/Linux)
```bash
# Real-time process monitoring
top

# More detailed Node.js monitoring
npm install -g clinic
clinic doctor npm run dev
```

### Check Bundle Size
```bash
cd frontend
npm run build
npm install -g serve
serve dist

# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
```

### Server Load Testing
```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Send 1000 requests
ab -n 1000 -c 10 http://localhost:3000/api/latest

# Load test /api/bpm
ab -n 1000 -c 50 -p data.json -T application/json http://localhost:3000/api/bpm
```

---

## Cleanup Commands

### Remove All Node Modules (Reset Everything)
```bash
# Backend
cd backend && rm -rf node_modules package-lock.json && npm install

# Frontend
cd frontend && rm -rf node_modules package-lock.json && npm install
```

### Clear Browser Cache
```bash
# Chrome DevTools: Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (macOS)
# Or manually: Settings > Privacy > Clear browsing data
```

### Kill All Node Processes
```bash
pkill -f node
```

### Reset to Clean State
```bash
# Remove all generated files
rm -rf backend/node_modules frontend/node_modules
rm backend/package-lock.json frontend/package-lock.json
rm -rf frontend/dist

# Reinstall clean
cd backend && npm install && cd ../frontend && npm install
```

---

## Quick Copy-Paste Template

### Full Fresh Start
```bash
# Navigate to project
cd path/to/Xposure_Therapist_Interface

# Start backend (Terminal 1)
cd backend && npm install && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm install && npm run dev

# Test (Terminal 3)
curl http://localhost:3000/health

# View dashboard
# Open browser: http://localhost:5173
```

### Production Deployment
```bash
# Build frontend
cd frontend && npm run build

# Backend production
cd backend && NODE_ENV=production npm start

# Verify
curl http://your-domain.com/health
```

---

## Troubleshooting Quick Fixes

```bash
# Port in use?
lsof -i :3000 && kill -9 <PID>

# Dependencies broken?
npm cache clean --force && npm install

# Frontend not updating?
rm -rf frontend/.vite && npm run dev

# WebSocket not connecting?
Check browser console for errors, verify backend running

# ESP32 sending but no response?
curl -v http://your-ip:3000/api/bpm  # verbose output

# Need to restart everything?
pkill -f node && npm run dev (in each folder)
```

---

**Save this file for quick reference!** 📌
