import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import ngrok from 'ngrok'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// ============================================
// IN-MEMORY DATA STORE (Singleton Pattern)
// ============================================

const store = {
  latestBPM: { bpm: 0, raw: 0, baseline: 0, device: 'R0384-ESP32C3', timestamp: new Date().toISOString() },
  sessionData: {
    default: {
      speech_script: 'Hello everyone, thank you for having me today.',
      crowd_count: 0,
      volume_level: 0.0,
    },
  },
}

// ============================================
// EXPRESS ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * POST /api/bpm
 * Receives BPM data from ESP32
 * Accepts TWO formats:
 * 1. Full: { "bpm": 78, "raw": 1023, "baseline": 1020, "device": "R0384-ESP32C3" }
 * 2. Simple: { "bpm": 78 } (uses defaults for raw/baseline)
 */
app.post('/api/bpm', (req, res) => {
  const { bpm, raw, baseline, device } = req.body

  // Validation - only BPM is required
  if (typeof bpm !== 'number' || bpm < 0 || bpm > 300) {
    console.warn('Invalid BPM data received:', req.body)
    return res.status(400).json({ error: 'Invalid BPM: must be a number between 0-300' })
  }

  // Use provided values or defaults
  const rawVal = typeof raw === 'number' ? raw : 1023
  const baselineVal = typeof baseline === 'number' ? baseline : 1020
  const deviceVal = device || 'R0384-ESP32C3'

  // Store in memory
  store.latestBPM = {
    bpm,
    raw: rawVal,
    baseline: baselineVal,
    device: deviceVal,
    timestamp: new Date().toISOString(),
  }

  // Log to console
  console.log(`📊 Received BPM: ${bpm} (Device: ${deviceVal})`)

  // Broadcast to all connected clients via WebSocket
  io.emit('bpm_update', {
    bpm,
    raw,
    baseline,
    device,
    timestamp: store.latestBPM.timestamp,
  })

  res.status(200).json({ success: true, message: 'BPM recorded' })
})

/**
 * GET /api/latest
 * Returns the latest BPM data
 */
app.get('/api/latest', (req, res) => {
  res.json(store.latestBPM)
})

/**
 * POST /api/session
 * Update session settings (for therapist dashboard)
 * Expected JSON: { "speech_script": "...", "crowd_count": 4, "volume_level": 0.5 }
 */
app.post('/api/session', (req, res) => {
  const { speech_script, crowd_count, volume_level } = req.body

  // Validation
  if (
    typeof speech_script !== 'string' ||
    typeof crowd_count !== 'number' ||
    typeof volume_level !== 'number'
  ) {
    console.warn('Invalid session data received:', req.body)
    return res.status(400).json({ error: 'Invalid JSON: check all required fields' })
  }

  if (crowd_count < 0 || crowd_count > 8) {
    return res.status(400).json({ error: 'crowd_count must be between 0 and 8' })
  }

  if (volume_level < 0 || volume_level > 1) {
    return res.status(400).json({ error: 'volume_level must be between 0.0 and 1.0' })
  }

  // Store in memory
  store.sessionData.default = {
    speech_script,
    crowd_count,
    volume_level,
  }

  console.log(
    `📝 Session updated: Crowd=${crowd_count}, Volume=${(volume_level * 100).toFixed(0)}%`
  )

  // Broadcast to Unity clients
  io.emit('session_update', store.sessionData.default)

  res.status(200).json({
    success: true,
    message: 'Session updated',
    data: store.sessionData.default,
  })
})

/**
 * GET /v1/session/:sessionId
 * Endpoint for Unity to poll the current session configuration
 * Returns ONLY the fields expected by TherapyData C# class:
 * - speech_script (string)
 * - crowd_count (int, 0-8)
 * - volume_level (float, 0.0-1.0)
 * 
 * Unity will call this every 1-2 seconds
 * Response format matches TherapySyncManager.cs TherapyData class
 */
app.get('/v1/session/:sessionId', (req, res) => {
  const { sessionId } = req.params

  // In this simple implementation, we just return the default session
  // In production, you'd look up the sessionId in a database
  const sessionData = store.sessionData[sessionId] || store.sessionData.default

  // Return ONLY the fields that TherapyData C# class expects
  // DO NOT add extra fields (sessionId, timestamp) as they're not in the class
  res.json({
    speech_script: sessionData.speech_script,
    crowd_count: sessionData.crowd_count,
    volume_level: sessionData.volume_level,
  })
})

/**
 * GET /session-data
 * Alternative endpoint - matches the placeholder URL from Unity code
 * Returns the default session in TherapyData format
 * Same response as /v1/session/default
 */
app.get('/session-data', (req, res) => {
  const sessionData = store.sessionData.default

  res.json({
    speech_script: sessionData.speech_script,
    crowd_count: sessionData.crowd_count,
    volume_level: sessionData.volume_level,
  })
})

/**
 * GET /api/stats
 * Get overall statistics (for dashboard analytics)
 */
app.get('/api/stats', (req, res) => {
  res.json({
    current_bpm: store.latestBPM.bpm,
    session_config: store.sessionData.default,
    server_uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// ============================================
// SOCKET.IO REAL-TIME COMMUNICATION
// ============================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  // Send current data immediately upon connection
  socket.emit('bpm_update', store.latestBPM)
  socket.emit('session_update', store.sessionData.default)

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })

  // Optional: Handle client requesting latest data
  socket.on('request_latest', () => {
    socket.emit('bpm_update', store.latestBPM)
    socket.emit('session_update', store.sessionData.default)
  })
})

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

httpServer.listen(PORT, HOST, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Xposure Therapist Backend Server Started                ║
╠════════════════════════════════════════════════════════════╣
║   Server: http://${HOST}:${PORT}                            
║   Health: http://localhost:${PORT}/health                  
║   WebSocket: ws://localhost:${PORT}                         
╠════════════════════════════════════════════════════════════╣
║   API Endpoints:                                           ║
║   • POST   /api/bpm          (ESP32 sends BPM)            ║
║   • GET    /api/latest       (Get latest BPM)             ║
║   • POST   /api/session      (Update VR config)           ║
║   • GET    /v1/session/:id   (Unity polls config)         ║
║   • GET    /api/stats        (Dashboard analytics)        ║
║   • GET    /health           (Health check)               ║
╚════════════════════════════════════════════════════════════╝
  `)

  // ============================================
  // OPTIONAL: Start ngrok tunnel for remote access
  // ============================================
  
  const useNgrok = process.env.USE_NGROK === 'true'
  
  if (useNgrok) {
    try {
      const authtoken = process.env.NGROK_AUTHTOKEN
      
      if (!authtoken) {
        console.warn('⚠️  USE_NGROK=true but NGROK_AUTHTOKEN not set in .env')
        console.warn('   To enable ngrok:')
        console.warn('   1. Get authtoken from https://dashboard.ngrok.com/get-started/your-authtoken')
        console.warn('   2. Add NGROK_AUTHTOKEN to .env file')
        console.warn('   3. Set USE_NGROK=true in .env')
      } else {
        await ngrok.authtoken(authtoken)
        const publicUrl = await ngrok.connect(PORT)
        console.log(`\n🌐 NGROK TUNNEL ACTIVE:\n   Public URL: ${publicUrl}`)
        console.log(`   Use this URL for remote VR and sensors\n`)
        
        // Update Socket.IO CORS to accept ngrok URL
        io.opts.cors.origin = [io.opts.cors.origin, publicUrl]
      }
    } catch (err) {
      console.error('❌ ngrok tunnel failed:', err.message)
    }
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})
