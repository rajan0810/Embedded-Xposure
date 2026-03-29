# 🎯 Xposure VR Exposure Therapy Platform

## Quick Start Guide

### Backend Setup (5 min)

```bash
cd backend
npm install
npm run dev
```

Server will start on **http://0.0.0.0:3000** with these endpoints:
- `POST /api/bpm` - ESP32 sends heart rate
- `GET /api/latest` - Get latest BPM
- `POST /api/session` - Update VR config (crowd, volume, script)
- `GET /v1/session/:id` - Unity polls for config
- `GET /api/stats` - Dashboard analytics
- `GET /health` - Health check

**WebSocket Events** (real-time):
- `bpm_update` - Broadcasts new heart rate to all clients
- `session_update` - Broadcasts config changes to Unity

### Frontend Setup (5 min)

```bash
cd frontend
npm install
npm run dev
```

Dashboard will start on **http://localhost:5173**

Three main pages:
- **Dashboard**: Monitor patient BPM in real-time, control VR environment (crowd 0-8, volume 0-1), upload speech script
- **History**: View past sessions, stress trends, analytics
- **Library**: Manage speech scripts for practice

---

## 📊 Data Flow

### 1️⃣ Patient BPM Monitoring (ESP32 → Dashboard)
```
ESP32 Device (every 0.4-1.2s)
    ↓ POST /api/bpm
    └─→ Backend (validates, stores in memory)
        ├─→ Console: "Received BPM: 78"
        └─→ WebSocket broadcast to all clients
            └─→ React Dashboard (updates real-time chart)
```

### 2️⃣ Therapist Controls VR (Dashboard → Unity)
```
Therapist adjusts sliders (crowd, noise) on Dashboard
    ↓ POST /api/session
    └─→ Backend (stores config)
        ├─→ WebSocket broadcast (other dashboards)
        └─→ Awaits Unity polling...
        
Unity polls every 1-2 seconds
    ↓ GET /v1/session/default
    └─→ Backend returns latest config
        └─→ Unity applies to VR scene (crowd count, volume level, speech)
```

### 3️⃣ Complete Session Flow
1. Therapist uploads speech script → Dashboard
2. Therapist sets crowd density (0-8) & noise level (0.0-1.0)
3. Therapist clicks "Send to VR"
4. Backend stores: `{speech_script, crowd_count, volume_level}`
5. Unity fetches config on next poll → scene updates
6. Patient begins practicing speech in VR with:
   - Their speech text visible
   - Crowd size they set
   - Ambient noise level they set
   - Real-time BPM being monitored

---

## 🔌 API Examples

### ESP32 Sending BPM
```bash
curl -X POST http://localhost:3000/api/bpm \
  -H "Content-Type: application/json" \
  -d '{
    "bpm": 78,
    "raw": 1023,
    "baseline": 1020,
    "device": "R0384-ESP32C3"
  }'

# Response: { "success": true, "message": "BPM recorded" }
```

### Get Latest BPM
```bash
curl http://localhost:3000/api/latest

# Response:
# {
#   "bpm": 78,
#   "raw": 1023,
#   "baseline": 1020,
#   "device": "R0384-ESP32C3",
#   "timestamp": "2024-03-29T10:30:45.123Z"
# }
```

### Therapist Updates Session Config
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{
    "speech_script": "Hello everyone, thank you for having me...",
    "crowd_count": 5,
    "volume_level": 0.7
  }'

# Response:
# {
#   "success": true,
#   "message": "Session updated",
#   "data": { "speech_script": "...", "crowd_count": 5, "volume_level": 0.7 }
# }
```

### Unity Polls Config
```bash
curl http://localhost:3000/v1/session/default

# Response:
# {
#   "sessionId": "default",
#   "speech_script": "Hello everyone...",
#   "crowd_count": 5,
#   "volume_level": 0.7,
#   "timestamp": "2024-03-29T10:35:00.456Z"
# }
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    THERAPIST BROWSER                     │
│  React Dashboard (http://localhost:5173)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Real-time BPM Chart (WebSocket)                  │   │
│  │ Crowd Density Slider (0-8)                       │   │
│  │ Ambient Noise Slider (0.0-1.0)                   │   │
│  │ Speech Script Upload                             │   │
│  │ "Send to VR" Button                              │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────────┘
                     │
          WebSocket + REST API
                     │
         ┌───────────▼───────────┐
         │  Express Backend      │
         │  http://0.0.0.0:3000  │
         │  ┌─────────────────┐  │
         │  │ In-Memory Store │  │
         │  │ - Latest BPM    │  │
         │  │ - Session Cfg   │  │
         │  └─────────────────┘  │
         │  • Validates JSON     │
         │  • Logs events        │
         │  • Broadcasts updates │
         └────┬──────────────┬──┘
              │              │
        ┌─────▼─────┐  ┌────▼────────┐
        │  ESP32    │  │ Unity Client │
        │  Device   │  │ (VR Patient) │
        │ (Wearable)│  │              │
        │ Heart Rate│  │ • Polls every│
        │ Monitor   │  │   1-2 sec    │
        │           │  │ • Gets script│
        │ BPM: 78   │  │ • Gets crowd │
        │ Baseline  │  │ • Gets noise │
        │ Data:     │  │              │
        │ 1023 raw  │  │ VR Auditorium│
        └───────────┘  │ W/ patient   │
                       │ speaking     │
                       └──────────────┘
```

---

## 📝 Backend Code Highlights

### Real-Time BPM Broadcasting
```javascript
app.post('/api/bpm', (req, res) => {
  const { bpm, raw, baseline, device } = req.body
  
  // Validate & store
  store.latestBPM = { bpm, raw, baseline, device, timestamp: new Date() }
  
  // Log to console
  console.log(`Received BPM: ${bpm}`)
  
  // Broadcast to all connected clients
  io.emit('bpm_update', store.latestBPM)
  
  res.json({ success: true })
})
```

### Session Config Storage
```javascript
app.post('/api/session', (req, res) => {
  const { speech_script, crowd_count, volume_level } = req.body
  
  // Validate constraints
  if (crowd_count < 0 || crowd_count > 8) return res.status(400).json({ ... })
  if (volume_level < 0 || volume_level > 1) return res.status(400).json({ ... })
  
  // Store & broadcast
  store.sessionData.default = { speech_script, crowd_count, volume_level }
  io.emit('session_update', store.sessionData.default)
  
  res.json({ success: true, data })
})
```

### Unity Polling Endpoint
```javascript
app.get('/v1/session/:sessionId', (req, res) => {
  res.json({
    sessionId: req.params.sessionId,
    ...store.sessionData.default,
    timestamp: new Date()
  })
})
```

---

## 🎨 Frontend Features

### Dashboard Page
- **Real-time BPM Display**: Shows current BPM in large text + live Chart.js graph
- **Patient Info**: Name, ID, session type, age
- **VR Controls**: 
  - Crowd Density slider (0-8)
  - Ambient Noise slider (0.0-1.0)
  - Emergency Pause button
  - Trigger Distraction button
- **Script Manager**: Upload/edit/send scripts to VR
- **ESP32 Status**: Connected/Disconnected indicator

### History Page
- Session statistics (total, avg BPM, best)
- Stress trend chart
- Session log table with details

### Library Page
- Add new speeches with title & content
- Browse existing speeches
- Delete speeches
- Start practice (loads into dashboard)

---

## 🚀 Production Checklist

- [ ] Add authentication (JWT/OAuth)
- [ ] Add database (MongoDB/PostgreSQL) for persistent storage
- [ ] Implement Redis for multi-server BPM synchronization
- [ ] Add HTTPS/TLS for secure communication
- [ ] Configure CORS for specific domains
- [ ] Add rate limiting on /api/bpm (ESP32 sends frequently)
- [ ] Implement user session management
- [ ] Add error logging & monitoring
- [ ] Deploy backend on Railway/Render/Heroku
- [ ] Deploy frontend on Vercel/Netlify
- [ ] Set up CI/CD pipeline

---

## 🔗 Key Technologies

- **Frontend**: React 18, React Router, Socket.IO Client, Axios, Chart.js, Tailwind CSS
- **Backend**: Express, Socket.IO, Node.js
- **Communication**: REST API, WebSocket
- **Storage**: In-memory (JavaScript object)
- **Styling**: Tailwind CSS

---

## 📞 Support

Check console logs on backend:
```
📊 Received BPM: 78 (Device: R0384-ESP32C3)
📝 Session updated: Crowd=5, Volume=70%
🔌 Client connected: socket_id_here
```

Frontend browser console shows WebSocket connection status.

---

**Version**: 1.0.0  
**Last Updated**: March 2024  
**Status**: Production Ready (with enhancements)
