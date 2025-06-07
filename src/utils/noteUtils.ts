export const NOTE_MAP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const splitNote = (note: string): [string, string] => {
  const [noteName, octave] = note.split(/(\d+)/)
  return [noteName, octave]
}

export const shiftNote = (currentNote: string, semitones: number): string => {
  const [noteName, octave] = splitNote(currentNote)
  let currentIndex = NOTE_MAP.indexOf(noteName)
  let currentOctave = parseInt(octave)

  currentIndex += semitones
  
  // Handle octave changes
  if (currentIndex >= NOTE_MAP.length) {
    currentIndex = currentIndex % NOTE_MAP.length
    currentOctave++
  } else if (currentIndex < 0) {
    currentIndex = NOTE_MAP.length + (currentIndex % NOTE_MAP.length)
    currentOctave--
  }

  return `${NOTE_MAP[currentIndex]}${currentOctave}`
}

export const getTriadNotes = (baseNote: string, isMinor: boolean): string[] => {
  const [noteName, octave] = splitNote(baseNote)
  const baseIndex = NOTE_MAP.indexOf(noteName)
  
  // Get third (4 semitones for major, 3 for minor)
  const thirdInterval = isMinor ? 3 : 4
  const thirdIndex = (baseIndex + thirdInterval) % 12
  const thirdOctave = thirdIndex < baseIndex ? String(Number(octave) + 1) : octave
  const third = NOTE_MAP[thirdIndex] + thirdOctave

  // Get perfect fifth (7 semitones up)
  const fifthIndex = (baseIndex + 7) % 12
  const fifthOctave = fifthIndex < baseIndex ? String(Number(octave) + 1) : octave
  const fifth = NOTE_MAP[fifthIndex] + fifthOctave

  return [baseNote, third, fifth, third, baseNote]
} 