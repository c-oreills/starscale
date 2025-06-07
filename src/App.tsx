import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import './App.css'

function App() {
  const [note, setNote] = useState('C4')
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Helper function to get major third and fifth
  const getMajorTriadNotes = (baseNote: string) => {
    const noteMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const [noteName, octave] = baseNote.split(/(\d+)/)
    const baseIndex = noteMap.indexOf(noteName)
    
    // Get major third (4 semitones up)
    const thirdIndex = (baseIndex + 4) % 12
    const thirdOctave = thirdIndex < baseIndex ? String(Number(octave) + 1) : octave
    const third = noteMap[thirdIndex] + thirdOctave

    // Get perfect fifth (7 semitones up)
    const fifthIndex = (baseIndex + 7) % 12
    const fifthOctave = fifthIndex < baseIndex ? String(Number(octave) + 1) : octave
    const fifth = noteMap[fifthIndex] + fifthOctave

    return [baseNote, third, fifth, third, baseNote]
  }

  // Helper function to get minor third and fifth
  const getMinorTriadNotes = (baseNote: string) => {
    const noteMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const [noteName, octave] = baseNote.split(/(\d+)/)
    const baseIndex = noteMap.indexOf(noteName)
    
    // Get minor third (3 semitones up)
    const thirdIndex = (baseIndex + 3) % 12
    const thirdOctave = thirdIndex < baseIndex ? String(Number(octave) + 1) : octave
    const third = noteMap[thirdIndex] + thirdOctave

    // Get perfect fifth (7 semitones up)
    const fifthIndex = (baseIndex + 7) % 12
    const fifthOctave = fifthIndex < baseIndex ? String(Number(octave) + 1) : octave
    const fifth = noteMap[fifthIndex] + fifthOctave

    return [baseNote, third, fifth, third, baseNote]
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
      
      const notes = isMinor ? getMinorTriadNotes(note) : getMajorTriadNotes(note)
      const now = Tone.now()
      
      notes.forEach((n, i) => {
        sampler.triggerAttackRelease(n, "4n", now + i * 0.5)
      })
    }
  }

  const playBothPatterns = async () => {
    if (sampler && isLoaded) {
      await Tone.start()
      
      const majorNotes = getMajorTriadNotes(note)
      const minorNotes = getMinorTriadNotes(note)
      const now = Tone.now()
      
      // Play major pattern
      majorNotes.forEach((n, i) => {
        sampler.triggerAttackRelease(n, "4n", now + i * 0.5)
      })
      
      // Add a 1 second delay between patterns
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
          <button 
            onClick={() => playPattern(false)}
            disabled={!isLoaded}
          >
            {isLoaded ? '🌝' : 'Loading piano...'}
          </button>
          <button 
            onClick={playBothPatterns}
            disabled={!isLoaded}
          >
            {isLoaded ? '🌝🌚' : 'Loading piano...'}
          </button>
          <button 
            onClick={() => playPattern(true)}
            disabled={!isLoaded}
          >
            {isLoaded ? '🌚' : 'Loading piano...'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
