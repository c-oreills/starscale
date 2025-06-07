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
      await Tone.start()
      
      const notes = getMajorTriadNotes(note)
      const now = Tone.now()
      
      // Play each note in sequence with 0.25s spacing
      notes.forEach((n, i) => {
        sampler.triggerAttackRelease(n, "4n", now + i * 0.5)
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
        <button 
          onClick={playNote}
          disabled={!isLoaded}
        >
          {isLoaded ? `Major` : 'Loading piano...'}
        </button>
      </div>
    </div>
  )
}

export default App
