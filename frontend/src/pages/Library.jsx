import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Library() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [speeches, setSpeeches] = useState([
    { id: 1, title: 'Confidence Speech', content: 'Introduce yourself confidently to the audience.' },
    { id: 2, title: 'Job Interview Practice', content: 'Explain your strengths and experiences.' },
  ])

  const handleAddSpeech = () => {
    if (title.trim() && content.trim()) {
      const newSpeech = {
        id: speeches.length + 1,
        title,
        content,
      }
      setSpeeches([...speeches, newSpeech])
      setTitle('')
      setContent('')
    }
  }

  const handleDeleteSpeech = (id) => {
    setSpeeches(speeches.filter((speech) => speech.id !== id))
  }

  const handleStartPractice = (speech) => {
    localStorage.setItem('activeSpeech', speech.content)
    alert('Speech loaded! Redirecting to dashboard...')
    navigate('/')
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">Speech Library</h1>

      {/* ADD NEW SPEECH */}
      <div className="bg-slate-800 p-6 rounded-xl mb-8">
        <h3 className="text-lg mb-4">Add New Speech</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Speech Title"
          className="w-full p-2 bg-slate-700 rounded mb-3 text-white placeholder-slate-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Speech Content"
          className="w-full p-2 bg-slate-700 rounded mb-3 text-white placeholder-slate-500 h-24 resize-none"
        ></textarea>
        <button
          onClick={handleAddSpeech}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition font-semibold"
        >
          Add Speech
        </button>
      </div>

      {/* SPEECH LIST */}
      <div className="grid grid-cols-2 gap-6">
        {speeches.map((speech) => (
          <div key={speech.id} className="bg-slate-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">{speech.title}</h3>
            <p className="text-slate-400 mb-4 line-clamp-3">{speech.content}</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStartPractice(speech)}
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition flex-1"
              >
                Start Practice
              </button>
              <button
                onClick={() => handleDeleteSpeech(speech.id)}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {speeches.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No speeches yet. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}
