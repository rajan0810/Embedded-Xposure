# 👋 Start Here - Documentation Navigation

Welcome to the **Xposure Therapist Interface** full-stack project! This guide will help you navigate all the documentation.

---

## 🎯 Where to Start?

### **I just want to run the project NOW** ⏱️
👉 **Read**: [COMMANDS.md](COMMANDS.md) (3 min read)
- Copy-paste ready terminal commands
- Health checks and testing
- Most common issues & fixes

### **I want to understand everything** 📚
👉 **Read**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) (15 min read)
- Complete architecture overview
- What was created and why
- All technologies used
- Data flow diagrams

### **I need step-by-step setup instructions** 🛠️
👉 **Read**: [SETUP_GUIDE.md](SETUP_GUIDE.md) (10 min read)
- Detailed backend setup
- Detailed frontend setup
- How everything connects
- Usage scenarios

### **I need quick API reference** 🔌
👉 **Read**: [QUICK_REF.md](QUICK_REF.md) (5 min read)
- All endpoints documented
- Data models
- WebSocket events
- Common issues

### **I'm integrating with ESP32** 📱
👉 **Read**: [ESP32_EXAMPLE.ino](ESP32_EXAMPLE.ino)
- Complete Arduino code
- How to send BPM data
- WiFi configuration
- Debugging tips

### **I'm integrating with Unity** 🎮
👉 **Read**: [UNITY_INTEGRATION.cs](UNITY_INTEGRATION.cs)
- Complete C# scripts
- How to poll backend
- How to update VR environment
- Setup in Unity Editor

---

## 📂 Project Structure

```
Xposure_Therapist_Interface/
│
├── 📚 DOCUMENTATION
│   ├── START_HERE.md                  👈 You are here
│   ├── PROJECT_SUMMARY.md            📊 Architecture & Overview
│   ├── SETUP_GUIDE.md                🛠️  Step-by-step setup
│   ├── QUICK_REF.md                  🔌 API reference
│   └── COMMANDS.md                   ⚡ Copy-paste commands
│
├── 💻 SOURCE CODE
│   ├── frontend/                     React Dashboard
│   │   ├── src/pages/
│   │   │   ├── Dashboard.jsx         Real-time BPM monitor
│   │   │   ├── History.jsx           Analytics
│   │   │   └── Library.jsx           Script management
│   │   └── ... (React config files)
│   │
│   └── backend/                      Express Server
│       ├── server.js                 All endpoints & logic
│       └── ... (Node config files)
│
├── 🔗 INTEGRATION GUIDES
│   ├── ESP32_EXAMPLE.ino             Arduino code for wearable
│   └── UNITY_INTEGRATION.cs          C# scripts for VR
│
└── 📄 README.md                      Original project readme
```

---

## 🚀 Quick Start (Copy-Paste)

### Terminal 1: Start Backend
```bash
cd backend && npm install && npm run dev
```

### Terminal 2: Start Frontend
```bash
cd frontend && npm install && npm run dev
```

### Terminal 3: Test
```bash
curl http://localhost:3000/health
```

### Browser
```
Open: http://localhost:5173
```

Done! Dashboard should be running. 🎉

---

## 📖 Reading Order

### For Developers
1. **START_HERE.md** (this file) - 2 min
2. **PROJECT_SUMMARY.md** - 15 min
3. **SETUP_GUIDE.md** - 10 min
4. **COMMANDS.md** - 5 min
5. Examine `frontend/` code
6. Examine `backend/server.js`

### For Integration
1. **START_HERE.md** - 2 min
2. **SETUP_GUIDE.md** - 10 min
3. **ESP32_EXAMPLE.ino** (if using ESP32)
4. **UNITY_INTEGRATION.cs** (if using Unity)
5. **QUICK_REF.md** - 5 min

### For DevOps/Deployment
1. **COMMANDS.md** - 5 min
2. **PROJECT_SUMMARY.md** (Deployment section)
3. `backend/package.json` and `frontend/vite.config.js`
4. Docker setup in COMMANDS.md

---

## 🎯 What Each Component Does

### **Frontend** (React Dashboard)
```
📍 Location: frontend/src/

What it does:
- Displays real-time patient BPM
- Allows therapist to control VR environment
- Manages speech scripts
- Shows session history & analytics

Pages:
- Dashboard.jsx    → Main interface with BPM chart
- History.jsx      → Past sessions & trends
- Library.jsx      → Speech management

Visit: http://localhost:5173
```

### **Backend** (Express Server)
```
📍 Location: backend/server.js

What it does:
- Receives BPM data from ESP32
- Stores configuration in memory
- Sends data to VR via polling
- Broadcasts real-time updates via WebSocket

Endpoints:
- POST /api/bpm              ← ESP32 sends here
- GET /api/latest            ← Get current BPM
- POST /api/session          ← Therapist updates config
- GET /v1/session/:id        ← Unity polls here
- WebSocket connections

Listen on: http://0.0.0.0:3000
```

### **ESP32 Device** (Wearable)
```
📍 Location: ESP32_EXAMPLE.ino

What it does:
- Measures patient's heart rate
- Sends BPM data every 0.4-1.2 seconds
- Connects via WiFi to backend
- Sends JSON with {bpm, raw, baseline, device}

Sends to: http://your-backend-ip:3000/api/bpm
```

### **Unity VR** (Patient Experience)
```
📍 Location: UNITY_INTEGRATION.cs

What it does:
- Displays speech script to patient
- Shows virtual audience (0-8 people)
- Plays ambient noise (0-100%)
- Polls backend every 1-2 seconds
- Updates environment in real-time

Polls: http://your-backend-ip:3000/v1/session/default
```

---

## 🔄 Data Flow Summary

```
1. Patient heartbeat
   ↓
2. ESP32 measures → Sends BPM to backend
   ↓
3. Backend receives → Broadcasts to all frontend dashboards
   ↓
4. Therapist sees BPM on dashboard
   ↓
5. Therapist moves crowd/noise slider
   ↓
6. Frontend sends config to backend
   ↓
7. Backend stores new config
   ↓
8. Unity polls backend (every 1-2 seconds)
   ↓
9. Unity receives new config → Updates VR scene
   ↓
10. Patient sees audience appear/audio volume change
```

---

## 📋 Pre-Requisites

### System Requirements
- Node.js 14+ (test: `node --version`)
- npm 6+ (test: `npm --version`)
- 50MB free disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

### For ESP32 Integration
- Arduino IDE
- ESP32 board (ESP32 C3 Mini recommended)
- Heart rate sensor (MAX30102 or similar)
- USB cable for uploading

### For Unity Integration
- Unity 2021+ (ideally 2022+)
- VR plugin (Meta XR SDK, SteamVR, etc.)
- C# scripting knowledge

### Networking
- Device on same WiFi as backend (or use public IP/domain)
- Port 3000 accessible from ESP32 & Unity
- Port 5173 accessible from browser

---

## ⚡ Quick Command Reference

```bash
# 1. Start backend (Terminal 1)
cd backend && npm run dev

# 2. Start frontend (Terminal 2)
cd frontend && npm run dev

# 3. Test backend (Terminal 3)
curl http://localhost:3000/health

# 4. Send test BPM
curl -X POST http://localhost:3000/api/bpm \
  -H "Content-Type: application/json" \
  -d '{"bpm": 85, "raw": 1023, "baseline": 1020, "device": "TEST"}'

# 5. Check latest BPM
curl http://localhost:3000/api/latest

# 6. Update session config
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"speech_script": "Hello", "crowd_count": 5, "volume_level": 0.7}'
```

Full list: See [COMMANDS.md](COMMANDS.md)

---

## 🐛 Common Issues & Fixes

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

### "npm install fails"
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Frontend can't reach backend"
- Verify backend running: `curl http://localhost:3000/health`
- Check proxy in `frontend/vite.config.js`
- Check browser console for errors

### "WebSocket not connecting"
- Backend must be running
- Check browser console (F12 → Console)
- Verify no firewall blocking port 3000

### "ESP32 returning 400 error"
- Check JSON format: all fields present?
- Check data types: numbers not strings?
- Verify backend URL is correct
- Check network connectivity

More issues? See [QUICK_REF.md](QUICK_REF.md#troubleshooting) or [COMMANDS.md](COMMANDS.md#troubleshooting-quick-fixes)

---

## 📚 Documentation Map

| Document | Purpose | Read Time |
|----------|---------|-----------|
| START_HERE.md | Navigation guide | 2 min |
| PROJECT_SUMMARY.md | Architecture & overview | 15 min |
| SETUP_GUIDE.md | Detailed setup | 10 min |
| QUICK_REF.md | API reference | 5 min |
| COMMANDS.md | Copy-paste commands | 5 min |
| ESP32_EXAMPLE.ino | Arduino code | 20 min |
| UNITY_INTEGRATION.cs | Unity C# code | 20 min |

**Total reading time**: ~60 minutes to fully understand

---

## 🎓 Learning Outcomes

After following this project, you'll understand:
- ✅ Full-stack web development (React + Express)
- ✅ Real-time communication (WebSocket)
- ✅ RESTful API design
- ✅ IoT device integration (ESP32)
- ✅ Game engine integration (Unity)
- ✅ Software architecture patterns
- ✅ Data flow in complex systems

---

## 🚀 What's Next?

### Immediate (Now)
1. Run the project following COMMANDS.md
2. Test with curl commands
3. Explore the dashboard UI

### Short Term (Today)
1. Read PROJECT_SUMMARY.md
2. Examine frontend code
3. Study backend endpoints
4. Send test BPM data

### Medium Term (This Week)
1. Integrate ESP32 with Arduino board
2. Integrate Unity with C# scripts
3. End-to-end testing
4. Customize to your needs

### Long Term (Next)
1. Add database
2. Deploy to production
3. Add authentication
4. Multi-patient support

---

## 🤝 Contributing

Want to improve this project?
1. Fork on GitHub
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📞 Quick Links

- **React Docs**: https://react.dev/
- **Express Docs**: https://expressjs.com/
- **Socket.IO**: https://socket.io/docs/
- **Chart.js**: https://www.chartjs.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Arduino Docs**: https://docs.arduino.cc/
- **Unity Docs**: https://docs.unity.com/

---

## 💡 Pro Tips

1. **Keep terminals organized**: Use separate terminal tabs for backend/frontend
2. **Browser DevTools**: Use F12 in browser to debug frontend
3. **Network tab**: Monitor API calls in browser Network tab
4. **Backend console**: Watch for "Received BPM" logs
5. **Test incrementally**: Get one part working before adding next

---

## 📄 License & Credits

This is an educational project for Exposure Therapy VR Platform.

**Built with:**
- React 18
- Express.js
- Socket.IO
- Chart.js
- Tailwind CSS
- Node.js

---

## ✅ You're Ready!

Pick where to start based on what you need, follow the guide, and you'll have a working system in minutes.

**Questions?** Check the relevant documentation file above.

**Good luck!** 🎉

---

**Last Updated**: March 2024  
**Version**: 1.0.0  
**Status**: Production Ready
