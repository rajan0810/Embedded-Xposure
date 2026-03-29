# 🚀 Quick Start & API Reference

## Installation & Running

### 1. Backend (Express + Socket.IO)
```bash
cd backend
npm install
npm run dev
```
✅ Server running on `http://0.0.0.0:3000`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
✅ Dashboard running on `http://localhost:5173`

### 3. Test the System
```bash
# In a new terminal, send a test BPM to backend:
curl -X POST http://localhost:3000/api/bpm \
  -H "Content-Type: application/json" \
  -d '{"bpm": 85, "raw": 1020, "baseline": 1015, "device": "ESP32-TEST"}'

# Should see "Received BPM: 85" in backend terminal
# Dashboard should update in real-time
```

---

## 🔌 Complete API Reference

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/api/bpm` | POST | ESP32 sends BPM | `{bpm, raw, baseline, device}` | `{success, message}` |
| `/api/latest` | GET | Get current BPM | - | `{bpm, raw, baseline, device, timestamp}` |
| `/api/session` | POST | Therapist updates VR config | `{speech_script, crowd_count, volume_level}` | `{success, data}` |
| `/v1/session/:id` | GET | Unity polls config | - | `{sessionId, speech_script, crowd_count, volume_level, timestamp}` |
| `/api/stats` | GET | Dashboard analytics | - | `{current_bpm, session_config, server_uptime, timestamp}` |
| `/health` | GET | Health check | - | `{status, timestamp}` |

---

## 📊 Data Models

### BPM Data (from ESP32)
```json
{
  "bpm": 78,
  "raw": 1023,
  "baseline": 1020,
  "device": "R0384-ESP32C3",
  "timestamp": "2024-03-29T10:30:45.123Z"
}
```

### Session Configuration (sent to Unity)
```json
{
  "speech_script": "String: The full text the patient needs to read",
  "crowd_count": "Integer: 0-8 (matching your Unity prefabs)",
  "volume_level": "Float: 0.0-1.0 (for Unity audio slider)",
  "timestamp": "ISO-8601 timestamp"
}
```

---

## 🔊 WebSocket Events

### Client receives:
```javascript
// Real-time BPM update (from ESP32)
socket.on('bpm_update', (data) => {
  console.log(`New BPM: ${data.bpm}`)
})

// Session config changed (therapist updated)
socket.on('session_update', (data) => {
  console.log(`New config:`, data)
})
```

### Client can send:
```javascript
// Request latest data
socket.emit('request_latest')
```

---

## 📂 Project Structure

```
Xposure_Therapist_Interface/
├── backend/
│   ├── server.js                          # Main Express server + all endpoints
│   ├── package.json                       # Dependencies
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                        # Main app with routing
│   │   ├── main.jsx                       # React entry point
│   │   ├── App.css                        # Global styles
│   │   └── pages/
│   │       ├── Dashboard.jsx              # Real-time BPM, VR controls, script upload
│   │       ├── History.jsx                # Session analytics & trends
│   │       └── Library.jsx                # Speech/script management
│   │
│   ├── index.html                         # HTML entry point
│   ├── vite.config.js                     # Vite config with API proxy
│   ├── package.json                       # Dependencies
│   └── .gitignore
│
├── SETUP_GUIDE.md                         # Full setup instructions
├── QUICK_REF.md                           # This file
└── README.md                              # Original readme
```

---

## 🎯 Component Breakdown

### Dashboard.jsx
- **Real-time BPM Chart**: Chart.js displaying BPM history
- **Crowd Density Control**: Slider (0-8)
- **Ambient Noise Control**: Slider (0.0-1.0)  
- **Script Manager**: Textarea for speech content
- **Send to VR Button**: POSTs session config to backend
- **Socket.IO Integration**: Receives `bpm_update` events

### History.jsx
- **Statistics Cards**: Total sessions, avg BPM, best session
- **Trend Chart**: Line chart of stress over time
- **Session Table**: Date, avg/peak BPM, duration

### Library.jsx
- **Add Speech Form**: Title + content inputs
- **Speech Cards Grid**: Display all speeches
- **Start Practice Button**: Loads speech into Dashboard
- **Delete Button**: Removes speech

---

## 📡 Data Flow Examples

### Example 1: ESP32 sends a BPM reading
```
1. ESP32 → POST /api/bpm {bpm: 85, ...}
2. Backend validates & stores
3. Backend logs: "Received BPM: 85"
4. Backend broadcasts via Socket.IO: bpm_update event
5. All connected dashboards receive: {bpm: 85, ...}
6. Dashboard updates chart in real-time
```

### Example 2: Therapist moves crowd slider to 5
```
1. Therapist drags slider to 5
2. Dashboard POSTs to /api/session {speech_script: "...", crowd_count: 5, volume_level: ...}
3. Backend validates & stores
4. Backend logs: "Session updated: Crowd=5, Volume=..."
5. Backend broadcasts: session_update event
6. All dashboards see new config (if applicable)
7. Unity polls /v1/session/default on next cycle
8. Unity receives: {crowd_count: 5, ...}
9. Unity scene spawns 5 crowd members
```

---

## 💡 Key Features

✅ **Real-Time Updates**: WebSocket broadcasting for instant BPM to dashboard  
✅ **Input Validation**: All POST endpoints validate data types & ranges  
✅ **Easy Integration**: REST API for any client (ESP32, Unity, mobile, etc.)  
✅ **In-Memory Storage**: No database needed for MVP  
✅ **Logging**: Console logs every BPM received  
✅ **Multi-Client Support**: Dashboard + Unity can connect simultaneously  
✅ **Error Handling**: Returns 400 for malformed requests  

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 3000 not in use: `lsof -i :3000` |
| Frontend can't reach backend | Verify backend running, check proxy in `vite.config.js` |
| ESP32 gets 400 error | Check JSON format: all fields must be numbers |
| No real-time BPM updates | Ensure Socket.IO connected (check browser console) |
| Unity not getting config | Use `GET /v1/session/default` exactly, poll every 1-2s |

---

## 🔒 Validation Rules

### `/api/bpm` expects:
- `bpm`: number (required)
- `raw`: number (required)
- `baseline`: number (required)
- `device`: string (optional, defaults to "R0384-ESP32C3")

### `/api/session` expects:
- `speech_script`: string (required, any length)
- `crowd_count`: number (required, 0-8 inclusive)
- `volume_level`: number (required, 0.0-1.0 inclusive)

---

## 📋 Environment Variables

### Backend (.env file)
```
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
```

### Frontend (hardcoded in vite.config.js)
```javascript
proxy: {
  '/api': 'http://localhost:3000',
  '/v1': 'http://localhost:3000'
}
```

---

## 🎯 Next Steps

1. ✅ Backend & Frontend running locally
2. Send test BPM from terminal curl command
3. See real-time update on Dashboard
4. Move crowd/noise sliders
5. Check backend console logs
6. Integrate with your ESP32 device
7. Integrate with Unity (poll `/v1/session/default`)
8. Deploy to production (Railway/Vercel)

---

## 📚 Learning Resources

- **Express Docs**: https://expressjs.com/
- **Socket.IO Docs**: https://socket.io/docs/
- **React Docs**: https://react.dev/
- **Chart.js Docs**: https://www.chartjs.org/
- **Vite Docs**: https://vitejs.dev/

---

**Need help?** Check backend console for real-time logs!
