import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import './App.css'

function App() {
  const [note, setNote] = useState('C4')
  const [synth, setSynth] = useState<Tone.Synth | null>(null)

  useEffect(() => {
    // Initialize synth
    const newSynth = new Tone.Synth().toDestination()
    setSynth(newSynth)

    return () => {
      newSynth.dispose()
    }
  }, [])

  const playNote = () => {
    if (synth) {
      synth.triggerAttackRelease(note, "8n")
    }
  }

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value)
  }

  return (
    <div className="App">
      <h1>⭐️ StarScale</h1>
      <div className="card">
        <div className="note-input">
          <label htmlFor="note">Note</label>
          <input
            type="text"
            id="note"
            value={note}
            onChange={handleNoteChange}
            placeholder="Enter note (e.g. C4)"
          />
        </div>
        <button onClick={playNote}>
          Play {note}
        </button>
      </div>
    </div>
  )
}

export default App
