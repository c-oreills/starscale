export const NOTE_MAP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Scale definitions with display names and semitone intervals
export const SCALES = {
  'major-minor': {
    name: 'Major-Minor',
    intervals: [] // Special case for triad patterns
  },
  'major': {
    name: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12]
  },
  'minor': {
    name: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12]
  },
  'dorian': {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10, 12]
  },
  'phrygian': {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10, 12]
  },
  'lydian': {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11, 12]
  },
  'mixolydian': {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10, 12]
  },
  'locrian': {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10, 12]
  },
  'harmonic-minor': {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11, 12]
  },
  'melodic-minor': {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11, 12]
  },
  'pentatonic-major': {
    name: 'Pentatonic Major',
    intervals: [0, 2, 4, 7, 9, 12]
  },
  'pentatonic-minor': {
    name: 'Pentatonic Minor',
    intervals: [0, 3, 5, 7, 10, 12]
  },
  'blues': {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10, 12]
  },
  'chromatic': {
    name: 'Chromatic',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
} as const

export type ScaleId = keyof typeof SCALES

export const splitNote = (note: string): [string, string] => {
  const [noteName, octave] = note.split(/(\d+)/)
  return [noteName, octave]
}

export const shiftNote = (currentNote: string, semitones: number): string => {
  const [noteName, octave] = splitNote(currentNote)
  let currentIndex = NOTE_MAP.indexOf(noteName)
  let currentOctave = parseInt(octave)

  // Calculate octave shifts first
  const octaveShift = Math.floor((currentIndex + semitones) / NOTE_MAP.length)
  currentOctave += octaveShift

  // Then handle the note index wrapping
  currentIndex = ((currentIndex + semitones) % NOTE_MAP.length + NOTE_MAP.length) % NOTE_MAP.length

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

export const getScaleNotes = (baseNote: string, scaleId: ScaleId): string[] => {
  const intervals = SCALES[scaleId].intervals
  return intervals.map((interval: number) => shiftNote(baseNote, interval))
} 