import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { shiftNote, getTriadNotes } from './utils/noteUtils'
import './App.css'

function App() {
  const [note, setNote] = useState('C4')
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const playNote = async (noteToPlay: string) => {
    if (sampler && isLoaded) {
      await Tone.start()
      sampler.triggerAttackRelease(noteToPlay, "4n")
    }
  }

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

  const playPattern = async (isMinor: boolean) => {
    if (sampler && isLoaded) {
      await Tone.start()
      
      const notes = getTriadNotes(note, isMinor)
      const now = Tone.now()
      
      notes.forEach((n, i) => {
        sampler.triggerAttackRelease(n, "4n", now + i * 0.5)
      })
    }
  }

  const playBothPatterns = async () => {
    if (sampler && isLoaded) {
      await Tone.start()
      
      const majorNotes = getTriadNotes(note, false)
      const minorNotes = getTriadNotes(note, true)
      const now = Tone.now()
      
      // Play major pattern
      majorNotes.forEach((n, i) => {
        sampler.triggerAttackRelease(n, "4n", now + i * 0.5)
      })
      
      const delayBetweenPatterns = 0.5 
      
      // Play minor pattern after major pattern finishes + delay
      minorNotes.forEach((n, i) => {
        sampler.triggerAttackRelease(n, "4n", now + (i + 5) * 0.5 + delayBetweenPatterns)
      })
    }
  }

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value)
  }

  if (!isLoaded) {
    return (
      <div className="App">
        <h1>⭐️ StarScale</h1>
        <div className="card">
          <div className="loading">Loading piano samples... 🎹</div>
        </div>
      </div>
    )
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
        <div className="button-group">
          <button onClick={() => setNote(shiftNote(note, -1))}>
            ⬇️
          </button>
          <button onClick={() => playPattern(false)}>
            🌝
          </button>
          <button onClick={playBothPatterns}>
            🌝🌚
          </button>
          <button onClick={() => playPattern(true)}>
            🌚
          </button>
          <button onClick={() => setNote(shiftNote(note, 1))}>
            ⬆️
          </button>
        </div>
        <div className="button-group">
          <button onClick={() => playNote(note)} title="Root note">
            1️⃣
          </button>
          <button onClick={() => playNote(shiftNote(note, 4))} title="Major third">
            🌝3️⃣
          </button>
          <button onClick={() => playNote(shiftNote(note, 3))} title="Minor third">
            🌚3️⃣
          </button>
          <button onClick={() => playNote(shiftNote(note, 7))} title="Perfect fifth">
            5️⃣
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
