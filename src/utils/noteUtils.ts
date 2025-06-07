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
  // Get third (4 semitones for major, 3 for minor)
  const thirdInterval = isMinor ? 3 : 4;
  const third = shiftNote(baseNote, thirdInterval);
  // Get perfect fifth (7 semitones up)
  const fifth = shiftNote(baseNote, 7);

  return [baseNote, third, fifth, third, baseNote];
} 