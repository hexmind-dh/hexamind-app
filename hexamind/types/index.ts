export interface Trigram {
  id: number
  name: string
  pinyin: string
  english: string
  element: string
  symbol: string
  lines: number[]
}

export interface Hexagram {
  upper: number
  lower: number
  name: string
  english: string
  pinyin: string
  description: string
  judgement: string
}

export interface DivinationInput {
  question: string
  latitude?: number
  longitude?: number
  kineticValue?: number
  timestamp?: number
}

export interface DivinationPayload {
  temporalSeed: { rawValue: number; hex: string }
  spatialSeed: { lat: number; lng: number; formatted: string }
  kineticSeed: { rawValue: number }
  charts: {
    original: { name: string; english: string; symbol: string; lines: number[]; upper: Trigram; lower: Trigram }
    nuclear: { name: string; english: string; symbol: string; lines: number[]; upper: Trigram; lower: Trigram }
    transformed: { name: string; english: string; symbol: string; lines: number[]; upper: Trigram; lower: Trigram }
  }
  changingLine: number
  tiGua: { role: 'Upper' | 'Lower'; trigram: Trigram }
  yongGua: { role: 'Upper' | 'Lower'; trigram: Trigram }
  relationship: {
    type: string
    conclusion: string
    auspiciousness: string
    chineseInterpretation: string
  }
}

export interface DivinationResult {
  success: boolean
  input: DivinationInput
  payload: DivinationPayload
  confidenceScore?: number
  aiOutput?: {
    verdict: string
    analysis: string
    tacticalAction: string[]
    phenomenologicalEcho: string
    catalystWindow: string
  }
}

export interface DivinationHistoryItem {
  id: string
  date: string
  question: string
  originalGua: string
  conclusion: string
  auspiciousness: string
  confidenceScore?: number
  aiOutput?: {
    verdict: string
    analysis: string
    tacticalAction: string[]
    phenomenologicalEcho: string
    catalystWindow: string
  }
  latitude?: number
  longitude?: number
  kineticValue?: number
  timestamp?: number
}
