import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { shiftNote, getTriadNotes } from './utils/noteUtils'
import './App.css'

function App() {
  const [note, setNote] = useState('C4')
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showNoteButtons, setShowNoteButtons] = useState(false)

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
          <div className="note-controls">
            <button onClick={() => setNote(shiftNote(note, -1))} title="Lower base note by one semitone">
              ⬇️
            </button>
            <input
              type="text"
              id="note"
              value={note}
              onChange={handleNoteChange}
              placeholder="Enter note (e.g. C4)"
            />
            <button onClick={() => setNote(shiftNote(note, 1))} title="Raise base note by one semitone">
              ⬆️
            </button>
          </div>
        </div>
        <div className="button-group">
          <button onClick={() => playPattern(false)} title="Play major triad pattern">
            🌝
          </button>
          <button onClick={playBothPatterns} title="Play major then minor triad patterns">
            🌝🌚
          </button>
          <button onClick={() => playPattern(true)} title="Play minor triad pattern">
            🌚
          </button>
        </div>
        <button 
          onClick={() => setShowNoteButtons(!showNoteButtons)}
          className="toggle-button"
          title="Toggle individual note buttons"
        >
          {showNoteButtons ? '🎵' : '🎶'}
        </button>
        {showNoteButtons && (
          <div className="button-group">
            <button onClick={() => playNote(note)} title="Play root note">
              1️⃣
            </button>
            <button onClick={() => playNote(shiftNote(note, 4))} title="Play major third">
              🌝3️⃣
            </button>
            <button onClick={() => playNote(shiftNote(note, 3))} title="Play minor third">
              🌚3️⃣
            </button>
            <button onClick={() => playNote(shiftNote(note, 7))} title="Play perfect fifth">
              5️⃣
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
