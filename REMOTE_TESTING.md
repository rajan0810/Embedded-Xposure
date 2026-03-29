# 🚀 Quick Start: Local vs Remote Testing

## Local Testing (Same Device)

```bash
# Terminal 1: Start backend (localhost:3000)
cd backend
npm run dev

# Terminal 2: Start frontend (localhost:5174)
cd frontend
npm run dev

# Open in browser: http://localhost:5174
```

**Use Cases:**
- Testing all components locally during development
- Debugging frontend and backend together
- No internet required

---

## Remote Testing (VR + WiFi Sensors)

### Step 1: Enable ngrok in Backend

```bash
# Edit backend/.env
USE_NGROK=true
NGROK_AUTHTOKEN=your_token_from_ngrok_dashboard
```

### Step 2: Start Backend with Public URL

```bash
cd backend
npm run dev

# You'll see:
# 🌐 NGROK TUNNEL ACTIVE:
#    Public URL: https://abc123-xyz.ngrok.io
```

### Step 3: Update Your Remote Clients

#### ESP32 WiFi Sensor
```cpp
// In Arduino code, update:
const char* serverUrl = "https://abc123-xyz.ngrok.io/api/bpm";
```

#### Unity VR App
```csharp
// In C#, update:
private string backendUrl = "https://abc123-xyz.ngrok.io";
```

### Step 4: Test Data Flow

```bash
# Send BPM from terminal (simulating ESP32)
curl -X POST https://abc123-xyz.ngrok.io/api/bpm \
  -H "Content-Type: application/json" \
  -d '{"bpm": 85, "raw": 1020, "baseline": 1015, "device": "R0384-ESP32C3"}'

# Check session config (simulating Unity polling)
curl https://abc123-xyz.ngrok.io/session-data
```

---

## Architecture Comparison

| Component | Local | Remote (ngrok) |
|-----------|-------|----------------|
| **Frontend React** | `http://localhost:5174` | Same (on your laptop) |
| **Backend API** | `http://localhost:3000` | `https://abc123-xyz.ngrok.io` |
| **ESP32 Sensor** | Must be on same WiFi | Any WiFi/4G network |
| **VR Headset** | Must be on same WiFi | Any WiFi/4G network |
| **Best For** | Development | Testing with real VR/sensors |

---

## Typical Workflow

```
1. Development (local):
   npm run dev (both frontend + backend)
   → Test UI changes and API logic
   
2. Remote testing (with ngrok):
   Frontend: http://localhost:5174 (stays local)
   Backend: https://ngrok-url (exposed publicly)
   → VR and sensors can connect
   → Test full integration
```

---

## Firewall/Network Notes

- **Local Network**: Frontend, backend, and mobile device must be on same WiFi
- **Remote/Public**: Use ngrok to expose backend anywhere
- **Mixed Mode**: Frontend on your laptop, backend public via ngrok, sensors connect remotely

---

## Port References

| Service | Local | Description |
|---------|-------|-------------|
| Backend HTTP | `:3000` | Express API server |
| Backend ngrok | `https://xxx.ngrok.io` | Public tunnel to `:3000` |
| Frontend Dev | `:5174` | Vite dev server (or `:5173`) |
| Frontend ngrok | Not needed | Backend only needs tunneling |

---

## Troubleshooting

**"Connection refused" on VR?**
- ✅ Use your ngrok URL from console output
- ✅ Check backend is running: `curl https://your-ngrok-url/health`
- ✅ Verify USE_NGROK=true in `.env`

**"Port 3000 already in use?"**
```bash
kill -9 $(lsof -t -i:3000)
npm run dev
```

**ngrok not showing public URL?**
- ✅ Add NGROK_AUTHTOKEN to `.env`
- ✅ Set USE_NGROK=true
- ✅ Restart backend

**ESP32 can't connect?**
- Use ngrok URL: `https://abc123-xyz.ngrok.io`
- Check WiFi credentials in Arduino code
- Verify SSID/password are correct
- Test with `curl` first from terminal

---

## Next: Deployment

When ready for production:
- Deploy on AWS/Azure/Heroku
- Replace ngrok URL with production URL
- Enable HTTPS with real certificates
- Add authentication to API endpoints

See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed ngrok configuration.
