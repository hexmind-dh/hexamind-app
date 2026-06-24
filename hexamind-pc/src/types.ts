export interface Trigram {
  id: number; // 1 to 8
  name: string; // 乾, 兑, 离, 震, 巽, 坎, 艮, 坤
  pinyin: string; // Qian, Dui, Li, Zhen, Xun, Kan, Gen, Kun
  english: string; // Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, Earth
  element: string; // 金, 金, 火, 木, 木, 水, 土, 土 (or "Metal", "Fire", "Wood", "Water", "Earth")
  symbol: string; // ☰, ☱, ☲, ☳, ☴, ☵, ☶, ☷
  lines: number[]; // e.g. [1, 1, 1] (from bottom Line 1 to top Line 3)
}

export interface Hexagram {
  upper: number; // 1-8
  lower: number; // 1-8
  name: string; // e.g. 乾为天, 天泽履
  english: string; // e.g. Heaven, Treading
  pinyin: string; // e.g. Qian, Lu
  description: string; // General description
  judgement: string; // The classic decision/verdict
}

export interface DivinationInput {
  question: string;
  latitude?: number;
  longitude?: number;
  kineticValue?: number; // peaks velocity or motion index
  timestamp?: number;
}

export interface DivinationPayload {
  temporalSeed: {
    rawValue: number;
    hex: string;
  };
  spatialSeed: {
    lat: number;
    lng: number;
    formatted: string;
  };
  kineticSeed: {
    rawValue: number;
    coordinate?: { x: number; y: number };
  };
  charts: {
    original: {
      name: string;
      english: string;
      symbol: string;
      lines: number[]; // 6 lines bottom-to-top [L1, ..., L6]
      upper: Trigram;
      lower: Trigram;
    };
    nuclear: {
      name: string;
      english: string;
      symbol: string;
      lines: number[];
      upper: Trigram;
      lower: Trigram;
    };
    transformed: {
      name: string;
      english: string;
      symbol: string;
      lines: number[];
      upper: Trigram;
      lower: Trigram;
    };
  };
  changingLine: number; // 1-6
  tiGua: {
    role: "Upper" | "Lower";
    trigram: Trigram;
  };
  yongGua: {
    role: "Upper" | "Lower";
    trigram: Trigram;
  };
  relationship: {
    type: string; // Yong Produces Ti, Ti and Yong Harmonize, Ti Produces Yong, Ti Controls Yong, Yong Controls Ti
    conclusion: string; // "用生体" | "体用比和" | "体生用" | "体克用" | "用克体"
    auspiciousness: string; // Extremely Auspicious, Auspicious, Leak, Exhausting, Highly Inauspicious
    chineseInterpretation: string;
  };
}

export interface DivinationApiResponse {
  success: boolean;
  input: DivinationInput;
  payload: DivinationPayload;
  aiOutput?: {
    verdict: string; // e.g. Critical Advantage, Neutral/Stagnant, High Risk
    analysis: string; // AI markdown analysis
    tacticalAction: string[];
    phenomenologicalEcho: string;
    catalystWindow: string;
    yaoInfo?: {
      yaoCi: string;
      yaoExplanation: string;
      developmentDirection: string;
    };
  };
  error?: string;
}

export interface DivinationHistoryItem {
  id: string;
  date: string;
  question: string;
  originalGua: string;
  conclusion: string;
  auspiciousness: string;
  confidenceScore?: number;
  aiOutput?: {
    verdict: string;
    analysis: string;
    tacticalAction: string[];
    phenomenologicalEcho: string;
    catalystWindow: string;
    yaoInfo?: {
      yaoCi: string;
      yaoExplanation: string;
      developmentDirection: string;
    };
  };
  latitude?: number;
  longitude?: number;
  kineticValue?: number;
  timestamp?: number;
}
