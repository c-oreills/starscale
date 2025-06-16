import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { shiftNote, getTriadNotes, getScaleNotes, SCALES, type ScaleId } from './utils/noteUtils'
import './App.css'

// Helper functions for URL query parameters
const getScaleFromUrl = (): ScaleId => {
  const urlParams = new URLSearchParams(window.location.search)
  const scaleParam = urlParams.get('scale')
  if (scaleParam && scaleParam in SCALES) {
    return scaleParam as ScaleId
  }
  return 'major-minor' // default
}

const updateUrlWithScale = (scale: ScaleId) => {
  const url = new URL(window.location.href)
  url.searchParams.set('scale', scale)
  window.history.replaceState({}, '', url.toString())
}

function App() {
  const [note, setNote] = useState('C4')
  const [selectedScale, setSelectedScale] = useState<ScaleId>(getScaleFromUrl())
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

  const ensureAudioContext = async () => {
    if (!sampler || !isLoaded) return false
    await Tone.start()
    sampler.releaseAll()
    // Cancel any existing scheduled events
    Tone.Transport.cancel()
    Tone.Transport.stop()
    return true
  }

  const playNote = async (noteToPlay: string) => {
    if (await ensureAudioContext()) {
      sampler!.triggerAttackRelease(noteToPlay, "4n")
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
    if (await ensureAudioContext()) {
      const notes = getTriadNotes(note, isMinor)
      
      // Schedule notes using Transport instead of absolute time
      Tone.Transport.scheduleOnce(() => {
        notes.forEach((n, i) => {
          Tone.Transport.scheduleOnce(() => {
            sampler!.triggerAttackRelease(n, "4n")
          }, `+${i * 0.5}`)
        })
      }, "+0.01")
      
      Tone.Transport.start()
    }
  }

  const playBothPatterns = async () => {
    if (await ensureAudioContext()) {
      const majorNotes = getTriadNotes(note, false)
      const minorNotes = getTriadNotes(note, true)
      
      // Schedule both patterns using Transport
      Tone.Transport.scheduleOnce(() => {
        // Play major pattern
        majorNotes.forEach((n, i) => {
          Tone.Transport.scheduleOnce(() => {
            sampler!.triggerAttackRelease(n, "4n")
          }, `+${i * 0.5}`)
        })
        
        // Play minor pattern after delay
        const delayBetweenPatterns = 0.5
        minorNotes.forEach((n, i) => {
          Tone.Transport.scheduleOnce(() => {
            sampler!.triggerAttackRelease(n, "4n")
          }, `+${(i + 5) * 0.5 + delayBetweenPatterns}`)
        })
      }, "+0.01")
      
      Tone.Transport.start()
    }
  }

  const playScale = async (ascending: boolean = true) => {
    if (await ensureAudioContext()) {
      const scaleNotes = getScaleNotes(note, selectedScale)
      const notesToPlay = ascending ? scaleNotes : [...scaleNotes].reverse()
      
      // Schedule scale notes using Transport
      Tone.Transport.scheduleOnce(() => {
        notesToPlay.forEach((n, i) => {
          Tone.Transport.scheduleOnce(() => {
            sampler!.triggerAttackRelease(n, "4n")
          }, `+${i * 0.5}`)
        })
      }, "+0.01")
      
      Tone.Transport.start()
    }
  }

  const playScaleAscendingDescending = async () => {
    if (await ensureAudioContext()) {
      const scaleNotes = getScaleNotes(note, selectedScale)
      const ascendingNotes = scaleNotes
      const descendingNotes = [...scaleNotes].reverse().slice(1) // Remove the octave to avoid repeating it
      
      // Schedule ascending then descending notes using Transport
      Tone.Transport.scheduleOnce(() => {
        // Play ascending
        ascendingNotes.forEach((n, i) => {
          Tone.Transport.scheduleOnce(() => {
            sampler!.triggerAttackRelease(n, "4n")
          }, `+${i * 0.5}`)
        })
        
        // Play descending after ascending finishes
        const ascendingDuration = ascendingNotes.length * 0.5
        descendingNotes.forEach((n, i) => {
          Tone.Transport.scheduleOnce(() => {
            sampler!.triggerAttackRelease(n, "4n")
          }, `+${ascendingDuration + i * 0.5}`)
        })
      }, "+0.01")
      
      Tone.Transport.start()
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
        <div className="scale-selector">
                      <select 
              value={selectedScale} 
              onChange={(e) => {
                const newScale = e.target.value as ScaleId
                setSelectedScale(newScale)
                updateUrlWithScale(newScale)
              }}
              title="Select musical scale"
            >
            {Object.entries(SCALES).map(([slug, scale]) => (
              <option key={slug} value={slug}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>
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
              className={isNoteError ? "error" : ""}
              title={
                isNoteError
                  ? "Invalid note format. Use format like C4, F#4, etc."
                  : ""
              }
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
        {selectedScale !== "major-minor" ? (
          <div className="button-group">
            <button
              onClick={() => playScale(true)}
              title="Play scale ascending"
            >
              🌔
            </button>
            <button
              onClick={playScaleAscendingDescending}
              title="Play scale ascending then descending"
            >
              🌔🌘
            </button>
            <button
              onClick={() => playScale(false)}
              title="Play scale descending"
            >
              🌘
            </button>
          </div>
        ) : (
          <div className="button-group">
            <button
              onClick={() => playPattern(false)}
              title="Play major triad pattern"
            >
              🌝
            </button>
            <button
              onClick={playBothPatterns}
              title="Play major then minor triad patterns"
            >
              🌝🌚
            </button>
            <button
              onClick={() => playPattern(true)}
              title="Play minor triad pattern"
            >
              🌚
            </button>
          </div>
        )}
        <button
          onClick={() => setShowNoteButtons(!showNoteButtons)}
          className="toggle-button"
          title="Toggle individual note buttons"
        >
          {showNoteButtons ? "🎵" : "🎶"}
        </button>
        {showNoteButtons && selectedScale === 'major-minor' && (
          <div className="button-group">
            <button onClick={() => playNote(note)} title="Play root note">
              1️⃣
            </button>
            <button
              onClick={() => playNote(shiftNote(note, 4))}
              title="Play major third"
            >
              🌝3️⃣
            </button>
            <button
              onClick={() => playNote(shiftNote(note, 3))}
              title="Play minor third"
            >
              🌚3️⃣
            </button>
            <button
              onClick={() => playNote(shiftNote(note, 7))}
              title="Play perfect fifth"
            >
              5️⃣
            </button>
          </div>
        )}
        {showNoteButtons && selectedScale !== 'major-minor' && (
          <>
            {Array.from({ length: Math.ceil(getScaleNotes(note, selectedScale).length / 4) }, (_, groupIndex) => (
              <div key={groupIndex} className="button-group">
                {getScaleNotes(note, selectedScale)
                  // Group into 4-note chunks
                  .slice(groupIndex * 4, groupIndex * 4 + 4)
                  .map((scaleNote, index) => (
                    <button 
                      key={`${scaleNote}-${groupIndex * 4 + index}`}
                      onClick={() => playNote(scaleNote)} 
                      title={`Play ${scaleNote}`}
                    >
                      {/* Remove the octave number from the note */}
                      {scaleNote.replace(/\d+/g, '')}
                    </button>
                  ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default App

