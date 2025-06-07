import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import './App.css'

function App() {
  const [note, setNote] = useState('C4')
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initialize piano sampler
    const newSampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsLoaded(true)
      }
    }).toDestination()

    setSampler(newSampler)

    return () => {
      newSampler.dispose()
    }
  }, [])

  const playNote = async () => {
    if (sampler && isLoaded) {
      // Ensure audio context is started (needed for browsers)
      await Tone.start()
      sampler.triggerAttackRelease(note, "2n")
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
        <button 
          onClick={playNote}
          disabled={!isLoaded}
        >
          {isLoaded ? `Play ${note}` : 'Loading piano...'}
        </button>
      </div>
    </div>
  )
}

export default App
