import { useState, useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'
import axios from 'axios'
import io from 'socket.io-client'

export default function Dashboard() {
  const [currentBPM, setCurrentBPM] = useState(0)
  const [bpmHistory, setBpmHistory] = useState([])
  const [script, setScript] = useState('')
  const [crowdDensity, setCrowdDensity] = useState(4)
  const [ambientNoise, setAmbientNoise] = useState(0.5)
  const [espConnected, setEspConnected] = useState(false)
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const socketRef = useRef(null)

  // Initialize Socket.IO connection for real-time BPM updates
  useEffect(() => {
    socketRef.current = io('https://embedded-xposure.onrender.com', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setEspConnected(true)
    })

    socketRef.current.on('bpm_update', (data) => {
      setCurrentBPM(data.bpm)
      setBpmHistory((prev) => [
        ...prev.slice(-19),
        { time: new Date().toLocaleTimeString(), bpm: data.bpm }
      ])
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setEspConnected(false)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  // Fetch initial BPM
  useEffect(() => {
    const fetchBPM = async () => {
      try {
        const response = await axios.get('https://embedded-xposure.onrender.com/api/latest')
        setCurrentBPM(response.data.bpm)
      } catch (error) {
        console.log('Unable to fetch BPM (backend not running yet)')
      }
    }
    fetchBPM()
  }, [])

  // Update chart when BPM history changes
  useEffect(() => {
    if (chartRef.current && bpmHistory.length > 0) {
      const labels = bpmHistory.map((item) => item.time.split(' ')[0])
      const data = bpmHistory.map((item) => item.bpm)

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'BPM',
              data,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#fff' } },
          },
          scales: {
            y: {
              ticks: { color: '#fff' },
              grid: { color: '#475569' },
            },
            x: {
              ticks: { color: '#fff' },
              grid: { color: '#475569' },
            },
          },
        },
      })
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [bpmHistory])

  const handleSendToVR = async () => {
    try {
      await axios.post('https://embedded-xposure.onrender.com/api/session', {
        speech_script: script,
        crowd_count: crowdDensity,
        volume_level: ambientNoise,
      })
      alert('Script and settings sent to VR!')
    } catch (error) {
      console.error('Error sending to VR:', error)
      alert('Error sending to VR')
    }
  }

  const handleEmergencyPause = () => {
    alert('Emergency Pause activated!')
  }

  const handleTriggerDistraction = () => {
    alert('Distraction triggered!')
  }

  return (
    <div className="p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-slate-400 text-sm">Therapy Session</p>
          <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
        </div>
        <button
          className={`px-4 py-2 rounded font-semibold transition ${
            espConnected
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {espConnected ? 'ESP32 Connected' : 'ESP32 Disconnected'}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-6">
        {/* PATIENT INFO */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg mb-4">Patient Information</h3>
          <p className="mb-2">
            <span className="text-slate-400">Name:</span> John Doe
          </p>
          <p className="mb-2">
            <span className="text-slate-400">Patient ID:</span> P001
          </p>
          <p className="mb-2">
            <span className="text-slate-400">Session:</span> Public Speaking Therapy
          </p>
          <p>
            <span className="text-slate-400">Age:</span> 24
          </p>
        </div>

        {/* HEART RATE */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg mb-4">Real-time Heart Rate</h3>
          <div className="text-5xl font-bold text-red-500 mb-6">{currentBPM} BPM</div>
          <div className="h-32">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* VR CONTROLS */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg mb-6">VR Environment Controls</h3>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-slate-400">Crowd Density</label>
              <span className="text-white font-semibold">{crowdDensity}/8</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={crowdDensity}
              onChange={(e) => setCrowdDensity(parseInt(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-slate-400">Ambient Noise Level</label>
              <span className="text-white font-semibold">{(ambientNoise * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ambientNoise}
              onChange={(e) => setAmbientNoise(parseFloat(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleEmergencyPause}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition flex-1"
            >
              Emergency Pause
            </button>
            <button
              onClick={handleTriggerDistraction}
              className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 text-black font-semibold transition flex-1"
            >
              Trigger Distraction
            </button>
          </div>
        </div>

        {/* ACTIVE SCRIPT */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg mb-4">Active Script</h3>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full bg-slate-700 p-3 rounded text-white mb-4 h-32 resize-none"
            placeholder="Enter or paste the speech script here..."
          ></textarea>
          <div className="flex gap-3">
            <button
              onClick={handleSendToVR}
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition flex-1"
            >
              Send to VR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
