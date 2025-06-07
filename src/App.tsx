import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { shiftNote, getTriadNotes } from './utils/noteUtils'
import './App.css'

function App() {
  const [note, setNote] = useState('C4')
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showNoteButtons, setShowNoteButtons] = useState(false)
  const [isNoteError, setIsNoteError] = useState(false)
  const [pressTimer, setPressTimer] = useState<number | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Detect touch device on first touch
  useEffect(() => {
    const handleTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', handleTouch);
    };
    window.addEventListener('touchstart', handleTouch);
    return () => window.removeEventListener('touchstart', handleTouch);
  }, []);

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
        C3: "C3.mp3",
        "F#3": "Fs3.mp3",
        C4: "C4.mp3",
        "F#4": "Fs4.mp3",
        C5: "C5.mp3",
        "F#5": "Fs5.mp3",
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

  const startRepeatingShift = (semitones: number) => {
    // Initial immediate shift
    setNote(shiftNote(note, semitones))
    
    // Start repeating shifts after 500ms delay
    const timer = setTimeout(() => {
      let isFirstTick = true;  // This will be captured in the interval's closure
      const repeatTimer = setInterval(() => {
        // If first tick, shift 11 semitones since we want to retain the original note
        const octaveShiftAmount = semitones * (isFirstTick ? 11 : 12);
        setNote((prevNote) => shiftNote(prevNote, octaveShiftAmount));
        isFirstTick = false;
      }, 200) // Then shift every 200ms while held
      setPressTimer(repeatTimer)
    }, 500)
    
    setPressTimer(timer)
  }

  const stopRepeatingShift = () => {
    if (pressTimer) {
      clearInterval(pressTimer)
      setPressTimer(null)
    }
  }

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote( event.target.value)
    setIsNoteError(false)
  }

  const handleNoteBlur = () => {
    const upperValue = note.toUpperCase()
    if (/^[A-G]#?\d+$/.test(upperValue)) {
      setNote(upperValue)
      setIsNoteError(false)
    } else {
      setIsNoteError(true)
    }
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
            <button 
              onMouseDown={() => !isTouchDevice && startRepeatingShift(-1)}
              onMouseUp={() => !isTouchDevice && stopRepeatingShift()}
              onMouseLeave={() => !isTouchDevice && stopRepeatingShift()}
              onTouchStart={() => startRepeatingShift(-1)}
              onTouchEnd={stopRepeatingShift}
              title="Lower base note by one semitone (hold for octave)"
            >
              ⬇️
            </button>
            <input
              type="text"
              id="note"
              value={note}
              onChange={handleNoteChange}
              onBlur={handleNoteBlur}
              placeholder="Enter note (e.g. C4)"
              className={isNoteError ? 'error' : ''}
              title={isNoteError ? 'Invalid note format. Use format like C4, F#4, etc.' : ''}
            />
            <button 
              onMouseDown={() => !isTouchDevice && startRepeatingShift(1)}
              onMouseUp={() => !isTouchDevice && stopRepeatingShift()}
              onMouseLeave={() => !isTouchDevice && stopRepeatingShift()}
              onTouchStart={() => startRepeatingShift(1)}
              onTouchEnd={stopRepeatingShift}
              title="Raise base note by one semitone (hold for octave)"
            >
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

