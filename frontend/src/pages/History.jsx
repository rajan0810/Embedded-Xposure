import { useState, useEffect, useRef } from 'react'
import { Chart } from 'chart.js/auto'

export default function History() {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    const data = [102, 95, 88]
    const labels = ['Session 1', 'Session 2', 'Session 3']

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
            label: 'Avg BPM',
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

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Session History</h1>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Total Sessions</p>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Average BPM</p>
          <p className="text-2xl font-bold">95</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-sm">Best Session</p>
          <p className="text-2xl font-bold">88 BPM</p>
        </div>
      </div>

      {/* TREND CHART */}
      <div className="bg-slate-800 p-6 rounded-xl mb-6">
        <h3 className="mb-4">Stress Trend</h3>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-800 p-6 rounded-xl">
        <table className="w-full">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="text-left py-3">Date</th>
              <th className="text-left py-3">Avg BPM</th>
              <th className="text-left py-3">Peak BPM</th>
              <th className="text-left py-3">Duration</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Mar 10', avg: 102, peak: 118, duration: '12 min' },
              { date: 'Mar 15', avg: 95, peak: 110, duration: '15 min' },
              { date: 'Mar 22', avg: 88, peak: 101, duration: '15 min' },
            ].map((row, idx) => (
              <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700 transition">
                <td className="py-3">{row.date}</td>
                <td className="py-3">{row.avg}</td>
                <td className="py-3">{row.peak}</td>
                <td className="py-3">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
