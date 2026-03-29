# 🌐 Remote Access Setup with ngrok

Enable your VR app and WiFi heart rate sensor to connect to your backend from anywhere.

## Why ngrok?

- **Public URL**: Access your localhost backend from VR devices, phones, and WiFi sensors
- **Easy Testing**: No need to deploy to cloud during development
- **Instant Tunneling**: Changes are visible immediately without redeployment

## Step 1: Get ngrok AuthToken

1. Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup) and create a free account
2. After signing up, visit [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your AuthToken (it looks like: `2qH7X2x7hZ9pK0mT5lQ8w_6nB4cXyF9s0aR3pT5u`)

## Step 2: Configure .env

1. Open `backend/.env` in your editor
2. Paste your authtoken:
```bash
USE_NGROK=true
NGROK_AUTHTOKEN=your_authtoken_here
```

3. Save the file

## Step 3: Start Backend with ngrok

```bash
cd backend
npm run dev
```

You'll see output like:
```
🌐 NGROK TUNNEL ACTIVE:
   Public URL: https://1a2b-34.56.78.90-ngrok.io
   Use this URL for remote VR and sensors
```

## Step 4: Update Your Remote Clients

### For ESP32 Heart Rate Sensor (WiFi):
Replace `localhost:3000` with your ngrok URL in the Arduino code:
```cpp
// Change this:
// const char* serverUrl = "http://localhost:3000/api/bpm";

// To this:
const char* serverUrl = "https://1a2b-34.56.78.90-ngrok.io/api/bpm";
```

### For Unity VR App:
Update the backend URL in your C# scripts:
```csharp
// Change this:
// private string backendUrl = "http://localhost:3000";

// To this:
private string backendUrl = "https://1a2b-34.56.78.90-ngrok.io";
```

### For Frontend (React):
The frontend automatically proxy requests to the backend, but if you're on a different network:
```
React App Frontend API calls → ngrok tunnel → Backend HTTP/WebSocket
```

## Testing Your Setup

### 1. Local Testing (Same Network)
```bash
# Terminal 1: Start backend (with or without ngrok)
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Open browser: http://localhost:5174
```

### 2. Remote Testing (Different Network/VR Device)

**Via ngrok URL:**
```bash
# Test health check
curl https://1a2b-34.56.78.90-ngrok.io/health

# Send test BPM
curl -X POST https://1a2b-34.56.78.90-ngrok.io/api/bpm \
  -H "Content-Type: application/json" \
  -d '{"bpm": 85, "raw": 1020, "baseline": 1015, "device": "TEST"}'

# Get session config (Unity polling endpoint)
curl https://1a2b-34.56.78.90-ngrok.io/session-data
```

### 3. Sending Data from ESP32
```cpp
// Arduino connection test
HTTPClient http;
String url = "https://1a2b-34.56.78.90-ngrok.io/api/bpm";
http.begin(url);
http.addHeader("Content-Type", "application/json");

String payload = "{\"bpm\": 85, \"raw\": 1020, \"baseline\": 1015, \"device\": \"R0384-ESP32C3\"}";
int httpCode = http.POST(payload);
http.end();
```

## Common Issues

### "Use_NGROK=true but NGROK_AUTHTOKEN not set"
**Fix**: Add your authtoken to `.env`:
```bash
NGROK_AUTHTOKEN=your_token_here
```

### "SSL certificate verify failed" Error
**Solution**: Some clients reject self-signed certs. Use plain HTTP (ngrok handles the security):
- Update URLs to use `http` instead of `https` if needed
- Or configure ngrok for better cert handling

### "Connection refused" on Remote Device
**Checklist**:
- ✅ Backend running locally (`npm run dev`)
- ✅ ngrok tunnel active (check console message)
- ✅ Remote device using correct ngrok URL
- ✅ Firewall not blocking ngrok traffic

### Port Already in Use
```bash
# Kill process on 3000
kill -9 $(lsof -t -i:3000)
npm run dev
```

## Architecture with ngrok

```
┌─────────────────────────────────────────────────────────────┐
│                      PUBLIC INTERNET                        │
├─────────────────────────────────────────────────────────────┤
│          ngrok Tunnel: https://xxx-ngrok.io               │
├─────────────────────────────────────────────────────────────┤
│                     LOCAL MACHINE                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend: http://localhost:5174                             │
│  Backend: http://localhost:3000 ←→ ngrok tunnel            │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │  React Dashboard (therapist interface)  │                │
│  │         ↓ (REST/WebSocket)              │                │
│  │  Express Backend API Server             │                │
│  │    • POST /api/bpm (from ESP32)        │                │
│  │    • POST /api/session (config)        │                │
│  │    • GET /session-data (for Unity)     │                │
│  └─────────────────────────────────────────┘                │
│                   ↑ ngrok tunnel ↓                          │
├──────────────────────────────────────────────────────────────┤
│                      REMOTE CLIENTS                          │
├──────────────────────────────────────────────────────────────┤
│  VR Headset (META Quest 3)      WiFi: Connected             │
│  └── Unity App                  └── https://xxx-ngrok.io    │
│      GET /session-data  ←──────────────────                │
│                                                              │
│  ESP32 Heart Rate Sensor        WiFi: Connected             │
│  └── Arduino Sketch              └── https://xxx-ngrok.io   │
│      POST /api/bpm  ←──────────────────                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Advanced: Custom Domain

For production or team testing, ngrok allows custom domains (paid tier):
- Go to [https://dashboard.ngrok.com/cloud-edge/domains](https://dashboard.ngrok.com/cloud-edge/domains)
- Update your `.env`:
```bash
NGROK_DOMAIN=my-domain.ngrok.io
```

## Debugging

Enable detailed logging in backend:
```bash
# Edit backend/server.js and add:
io.on('connection', (socket) => {
  console.log(`🔌 [${new Date().toISOString()}] Client connected: ${socket.id}`)
  // ... rest of code
})
```

## Security Notes

- ngrok URLs are accessible from the internet - they will be guessed
- Add authentication headers to your API calls for production
- Use ngrok's IP restrictions feature (premium) to limit access
- Never commit `.env` with real authtoken to git (it's in `.gitignore`)

## Quick Reference

```bash
# Enable ngrok
echo "USE_NGROK=true" >> backend/.env

# Check if ngrok is working
curl https://your-ngrok-url-ngrok.io/health

# View ngrok dashboard in browser
# https://dashboard.ngrok.com

# Disable ngrok (revert to localhost)
echo "USE_NGROK=false" > backend/.env
```

## Next Steps

1. ✅ Add ngrok authtoken to `.env`
2. ✅ Start backend: `npm run dev`
3. ✅ Copy public URL from console output
4. ✅ Update ESP32 Arduino code with ngrok URL
5. ✅ Update Unity C# scripts with ngrok URL
6. ✅ Test BPM transmission: `curl -X POST ...` with ngrok URL
7. ✅ Test VR polling: `curl https://xxx-ngrok.io/session-data`

For more details, see [ngrok official docs](https://ngrok.com/docs).
