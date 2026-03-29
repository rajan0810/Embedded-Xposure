import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Library from './pages/Library'
import './App.css'

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* SIDEBAR */}
        <div className="w-64 h-screen bg-slate-800 p-6 fixed overflow-y-auto">
          <h2 className="text-xl font-bold mb-10">Xposure</h2>
          <nav className="space-y-4">
            <Link to="/" className="block text-white font-semibold hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link to="/history" className="block text-slate-300 hover:text-white transition">
              Session History
            </Link>
            <Link to="/library" className="block text-slate-300 hover:text-white transition">
              Speech Library
            </Link>
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 ml-64 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}
