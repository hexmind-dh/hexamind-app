import { TRIGRAMS, HEXAGRAMS, lookupTrigramByLines } from "../data/guas";
import { Trigram, Hexagram, DivinationPayload } from "../types";

// Helper to determine five element interactions
export function getWuXingRelation(tiElement: string, yongElement: string): {
  type: string;
  conclusion: string;
  auspiciousness: string;
  chineseInterpretation: string;
} {
  // Elements: Metal, Wood, Water, Fire, Earth
  // Chinese: 金 (Metal), 木 (Wood), 水 (Water), 火 (Fire), 土 (Earth)

  const elementsMap: Record<string, string> = {
    "Metal": "金",
    "Wood": "木",
    "Water": "水",
    "Fire": "火",
    "Earth": "土"
  };

  const ti = elementsMap[tiElement] || "土";
  const yong = elementsMap[yongElement] || "土";

  // Identical Elements ->比和 (Harmonize)
  if (ti === yong) {
    return {
      type: "Ti and Yong Harmonize",
      conclusion: "体用比和",
      auspiciousness: "Auspicious",
      chineseInterpretation: `体用五行均为 ${ti}，代表同心协力、平稳和顺、谋事易成。`
    };
  }

  // Generative rules
  const produces: Record<string, string> = {
    "木": "火", // Wood produces Fire
    "火": "土", // Fire produces Earth
    "土": "金", // Earth produces Metal
    "金": "水", // Metal produces Water
    "水": "木"  // Water produces Wood
  };

  // Yong produces Ti (用生体) -> Extremely Auspicious
  if (produces[yong] === ti) {
    return {
      type: "Yong Produces Ti",
      conclusion: "用生体",
      auspiciousness: "Extremely Auspicious",
      chineseInterpretation: `${yong}生${ti}。环境/对方极力眷顾体卦，代表贵人相助、顺风顺水、谋求极易成功。`
    };
  }

  // Ti produces Yong (体生用) -> Leak/Inauspicious
  if (produces[ti] === yong) {
    return {
      type: "Ti Produces Yong",
      conclusion: "体生用",
      auspiciousness: "Leak",
      chineseInterpretation: `${ti}生${yong}。能量泄出于外，代表精力、财力或资源严重损耗，事倍功半。`
    };
  }

  // Controlling rules
  const controls: Record<string, string> = {
    "木": "土", // Wood controls Earth
    "土": "水", // Earth controls Water
    "水": "火", // Water controls Fire
    "火": "金", // Fire controls Metal
    "金": "木"  // Metal controls Wood
  };

  // Ti controls Yong (体克用) -> Success with massive effort
  if (controls[ti] === yong) {
    return {
      type: "Ti Controls Yong",
      conclusion: "体克用",
      auspiciousness: "Exhausting",
      chineseInterpretation: `${ti}克${yong}。虽有阻力，但最终可以通过艰苦努力克敌制胜，凡事需强力推进。`
    };
  }

  // Yong controls Ti (用克体) -> Highly Inauspicious
  if (controls[yong] === ti) {
    return {
      type: "Yong Controls Ti",
      conclusion: "用克体",
      auspiciousness: "Highly Inauspicious",
      chineseInterpretation: `${yong}克${ti}。面临严重压迫或不可抗外力打击，恐有官非口舌、诉讼风险或合作彻底破裂。`
    };
  }

  return {
    type: "Ti and Yong Balance",
    conclusion: "体用均衡",
    auspiciousness: "Neutral",
    chineseInterpretation: "五行能量处于势均力敌之态势，行事宜静观其变。"
  };
}

export function runMeihuaCalculation(
  timestamp: number,
  lat: number,
  lng: number,
  kineticSpeed: number
): DivinationPayload {
  // Truncate seeds to standard representations
  const T = timestamp;
  const S_lat = parseFloat(lat.toFixed(2));
  const S_lng = parseFloat(lng.toFixed(2));
  const K = kineticSpeed;

  // Upper Trigram: T mod 8
  let upperId = T % 8;
  if (upperId === 0) upperId = 8;

  // Lower Trigram: (|lat|*100 + |lng|*100 + K*100) mod 8
  const latInteger = Math.round(Math.abs(S_lat) * 100);
  const lngInteger = Math.round(Math.abs(S_lng) * 100);
  const kineticInteger = Math.round(K * 100);
  
  let lowerId = (latInteger + lngInteger + kineticInteger) % 8;
  if (lowerId === 0) lowerId = 8;

  // Changing line: (T + |lat|*100 + |lng|*100 + K*100) mod 6
  // Be precise and prevent javascript arithmetic overflow
  let changingLine = (T + latInteger + lngInteger + kineticInteger) % 6;
  if (changingLine === 0) changingLine = 6;

  // Trigrams
  const upperTrigram = TRIGRAMS[upperId];
  const lowerTrigram = TRIGRAMS[lowerId];

  // Original Chart (Ben Gua) Lines (1-6 from bottom to top)
  const originalLines = [...lowerTrigram.lines, ...upperTrigram.lines];

  // Nuclear Chart (Hu Gua):
  // Inner nuclear (lower of Hu Gua): lines 2, 3, 4 of Original Chart (0-indexed: 1, 2, 3)
  const innerNuclearLines = [originalLines[1], originalLines[2], originalLines[3]];
  // Outer nuclear (upper of Hu Gua): lines 3, 4, 5 of Original Chart (0-indexed: 2, 3, 4)
  const outerNuclearLines = [originalLines[2], originalLines[3], originalLines[4]];

  const nuclearLowerTrigram = lookupTrigramByLines(innerNuclearLines);
  const nuclearUpperTrigram = lookupTrigramByLines(outerNuclearLines);
  const nuclearLines = [...innerNuclearLines, ...outerNuclearLines];

  // Transformed Chart (Bian Gua):
  // Same as Original Chart, but flip the Changing Line
  const transformedLines = [...originalLines];
  const flipIndex = changingLine - 1; // 0-indexed
  transformedLines[flipIndex] = transformedLines[flipIndex] === 1 ? 0 : 1;

  const transformedLowerLines = [transformedLines[0], transformedLines[1], transformedLines[2]];
  const transformedUpperLines = [transformedLines[3], transformedLines[4], transformedLines[5]];

  const transformedLowerTrigram = lookupTrigramByLines(transformedLowerLines);
  const transformedUpperTrigram = lookupTrigramByLines(transformedUpperLines);

  // Core Relationship (Ti vs. Yong)
  // Ti Gua is the trigram without the changing line
  // Yong Gua is the trigram with the changing line
  let tiRole: "Upper" | "Lower";
  let yongRole: "Upper" | "Lower";
  let tiTrigram: Trigram;
  let yongTrigram: Trigram;

  if (changingLine <= 3) {
    // Changing line is in the lower trigram, so Lower is Yong, Upper is Ti
    tiRole = "Upper";
    yongRole = "Lower";
    tiTrigram = upperTrigram;
    yongTrigram = lowerTrigram;
  } else {
    // Changing line is in the upper trigram, so Upper is Yong, Lower is Ti
    tiRole = "Lower";
    yongRole = "Upper";
    tiTrigram = lowerTrigram;
    yongTrigram = upperTrigram;
  }

  const relationResult = getWuXingRelation(tiTrigram.element, yongTrigram.element);

  // Get Hexagram object from HEXAGRAMS
  const originalKey = `${upperId}_${lowerId}`;
  const nuclearKey = `${nuclearUpperTrigram.id}_${nuclearLowerTrigram.id}`;
  const transformedKey = `${transformedUpperTrigram.id}_${transformedLowerTrigram.id}`;

  const originalGua = HEXAGRAMS[originalKey] || {
    name: "未知", english: "Unknown", pinyin: "Wei Zhi", description: "Unknown Hexagram", judgement: ""
  };
  const nuclearGua = HEXAGRAMS[nuclearKey] || {
    name: "未知", english: "Unknown", pinyin: "Wei Zhi", description: "Unknown Hexagram", judgement: ""
  };
  const transformedGua = HEXAGRAMS[transformedKey] || {
    name: "未知", english: "Unknown", pinyin: "Wei Zhi", description: "Unknown Hexagram", judgement: ""
  };

  return {
    temporalSeed: {
      rawValue: timestamp,
      hex: "0x" + timestamp.toString(16).toUpperCase()
    },
    spatialSeed: {
      lat,
      lng,
      formatted: `${S_lat.toFixed(2)}°N, ${S_lng.toFixed(2)}°E`
    },
    kineticSeed: {
      rawValue: K
    },
    charts: {
      original: {
        name: originalGua.name,
        english: originalGua.english,
        symbol: `${upperTrigram.symbol}${lowerTrigram.symbol}`,
        lines: originalLines,
        upper: upperTrigram,
        lower: lowerTrigram
      },
      nuclear: {
        name: nuclearGua.name,
        english: nuclearGua.english,
        symbol: `${nuclearUpperTrigram.symbol}${nuclearLowerTrigram.symbol}`,
        lines: nuclearLines,
        upper: nuclearUpperTrigram,
        lower: nuclearLowerTrigram
      },
      transformed: {
        name: transformedGua.name,
        english: transformedGua.english,
        symbol: `${transformedUpperTrigram.symbol}${transformedLowerTrigram.symbol}`,
        lines: transformedLines,
        upper: transformedUpperTrigram,
        lower: transformedLowerTrigram
      }
    },
    changingLine,
    tiGua: {
      role: tiRole,
      trigram: tiTrigram
    },
    yongGua: {
      role: yongRole,
      trigram: yongTrigram
    },
    relationship: {
      type: relationResult.type,
      conclusion: relationResult.conclusion,
      auspiciousness: relationResult.auspiciousness,
      chineseInterpretation: relationResult.chineseInterpretation
    }
  };
}

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function getGanzhiTime(timeMs: number): string {
  const d = new Date(timeMs);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  const date = d.getDate();
  const hour = d.getHours();

  // Year Ganzhi
  let yearGanzhiIdx = (year - 4) % 60;
  if (yearGanzhiIdx < 0) yearGanzhiIdx += 60;
  const yearStem = STEMS[yearGanzhiIdx % 10];
  const yearBranch = BRANCHES[yearGanzhiIdx % 12];

  // Day Ganzhi
  const localTimeMs = timeMs - d.getTimezoneOffset() * 60000;
  const localDaysSinceEpoch = Math.floor(localTimeMs / (1000 * 60 * 60 * 24));
  let dayGanzhiIdx = (localDaysSinceEpoch + 29) % 60; // Jan 1, 1970 was 癸巳 (index 29)
  if (dayGanzhiIdx < 0) dayGanzhiIdx += 60;
  const dayStemIdx = dayGanzhiIdx % 10;
  const dayStem = STEMS[dayStemIdx];
  const dayBranch = BRANCHES[dayGanzhiIdx % 12];

  // Month Ganzhi
  let monthStemStart = 0;
  const yStemIdx = yearGanzhiIdx % 10;
  if (yStemIdx === 0 || yStemIdx === 5) monthStemStart = 2; // 丙
  else if (yStemIdx === 1 || yStemIdx === 6) monthStemStart = 4; // 戊
  else if (yStemIdx === 2 || yStemIdx === 7) monthStemStart = 6; // 庚
  else if (yStemIdx === 3 || yStemIdx === 8) monthStemStart = 8; // 壬
  else if (yStemIdx === 4 || yStemIdx === 9) monthStemStart = 0; // 甲

  const monthBranchIdx = (month === 12) ? 0 : (month === 1) ? 1 : month;
  const monthStemIdx = (monthStemStart + (monthBranchIdx >= 2 ? monthBranchIdx - 2 : monthBranchIdx + 10)) % 10;
  const monthStem = STEMS[monthStemIdx];
  const monthBranch = BRANCHES[monthBranchIdx];

  // Hour Branch
  const hourBranchIdx = Math.floor((hour + 1) % 24 / 2) % 12;
  const hourBranch = BRANCHES[hourBranchIdx];

  // Hour Stem using 五鼠遁
  let hourStemStart = 0;
  if (dayStemIdx === 0 || dayStemIdx === 5) hourStemStart = 0; // 甲
  else if (dayStemIdx === 1 || dayStemIdx === 6) hourStemStart = 2; // 丙
  else if (dayStemIdx === 2 || dayStemIdx === 7) hourStemStart = 4; // 戊
  else if (dayStemIdx === 3 || dayStemIdx === 8) hourStemStart = 6; // 庚
  else if (dayStemIdx === 4 || dayStemIdx === 9) hourStemStart = 8; // 壬

  const hourStemIdx = (hourStemStart + hourBranchIdx) % 10;
  const hourStem = STEMS[hourStemIdx];

  return `${yearStem}${yearBranch}年 ${monthStem}${monthBranch}月 ${dayStem}${dayBranch}日 ${hourStem}${hourBranch}时`;
}

export function getLocalMeihuaAnalysis(
  payload: DivinationPayload,
  lang: string,
  ganzhiTime: string
): string {
  const originalKey = `${payload.charts.original.upper.id}_${payload.charts.original.lower.id}`;
  const originalGuaDetails = HEXAGRAMS[originalKey];
  const transformedKey = `${payload.charts.transformed.upper.id}_${payload.charts.transformed.lower.id}`;
  const transformedGuaDetails = HEXAGRAMS[transformedKey];

  // Localization tables
  const linesNameMap: Record<string, string[]> = {
    "zh-CN": ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"],
    "zh-TW": ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"],
    "en": ["1st Line", "2nd Line", "3rd Line", "4th Line", "5th Line", "6th Line"],
    "ja": ["初爻（1爻）", "二爻（2爻）", "三爻（3爻）", "四爻（4爻）", "五爻（5爻）", "上爻（6爻）"],
    "ko": ["초효 (1효)", "이효 (2효)", "삼효 (3효)", "사효 (4효)", "오효 (5효)", "상효 (6효)"],
    "es": ["Primera línea (Yao 1)", "Segunda línea (Yao 2)", "Tercera línea (Yao 3)", "Cuarta línea (Yao 4)", "Quinta línea (Yao 5)", "Sexta línea (Yao 6)"],
    "id": ["Garis Pertama", "Garis Kedua", "Garis Ketiga", "Garis Keempat", "Garis Kelima", "Garis Keenam"],
    "ms": ["Garis Pertama", "Garis Kedua", "Garis Ketiga", "Garis Keempat", "Garis Kelima", "Garis Keenam"],
    "th": ["เส้นแรก (Yao 1)", "เส้นสอง (Yao 2)", "เส้นสาม (Yao 3)", "เส้นสี่ (Yao 4)", "เส้นห้า (Yao 5)", "เส้นบนสุด (Yao 6)"]
  };

  const trigramNamesMap: Record<string, Record<string, string>> = {
    "en": {"乾": "Qian (Heaven)", "兑": "Dui (Lake)", "离": "Li (Fire)", "震": "Zhen (Thunder)", "巽": "Xun (Wind)", "坎": "Kan (Water)", "艮": "Gen (Mountain)", "坤": "Kun (Earth)"},
    "zh-CN": {"乾": "乾卦", "兑": "兑卦", "离": "离卦", "震": "震卦", "巽": "巽卦", "坎": "坎卦", "艮": "艮卦", "坤": "坤卦"},
    "zh-TW": {"乾": "乾卦", "兑": "兌卦", "离": "離卦", "震": "震卦", "巽": "巽卦", "坎": "坎卦", "艮": "艮卦", "坤": "坤卦"},
    "ja": {"乾": "乾 (けん)", "兑": "兌 (だ)", "离": "離 (り)", "震": "震 (しん)", "巽": "巽 (そん)", "坎": "坎 (かん)", "艮": "艮 (ごん)", "坤": "坤 (こん)"},
    "ko": {"乾": "건 (천)", "兑": "태 (택)", "离": "리 (화)", "震": "진 (뢰)", "巽": "손 (풍)", "坎": "감 (수)", "艮": "간 (산)", "坤": "곤 (지)"},
    "es": {"乾": "Qian (Cielo)", "兑": "Dui (Lago)", "离": "Li (Fuego)", "震": "Zhen (Trueno)", "巽": "Xun (Viento)", "坎": "Kan (Agua)", "艮": "Gen (Montaña)", "坤": "Kun (Tierra)"},
    "id": {"乾": "Qian (Langit)", "兑": "Dui (Danau)", "离": "Li (Api)", "震": "Zhen (Guruh)", "巽": "Xun (Angin)", "坎": "Kan (Air)", "艮": "Gen (Gunung)", "坤": "Kun (Bumi)"},
    "ms": {"乾": "Qian (Langit)", "兑": "Dui (Tasik)", "离": "Li (Api)", "震": "Zhen (Guruh)", "巽": "Xun (Angin)", "坎": "Kan (Air)", "艮": "Gen (Gunung)", "坤": "Kun (Bumi)"},
    "th": {"乾": "เฉียน (ฟ้า)", "兑": "ตุ้ย (ทะเลสาบ)", "离": "หลี (ไฟ)", "震": "เจิ้น (สายฟ้า)", "巽": "ซวิ่น (ลม)", "坎": "ข่าน (น้ำ)", "艮": "เกิน (ภูเขา)", "坤": "คุน (ดิน)"}
  };

  const elementsMap: Record<string, Record<string, string>> = {
    "zh-CN": {"Metal": "契约条款与硬货币限制因子 (Metal)", "Wood": "账期授信与扩张规模因子 (Wood)", "Water": "现金流与供应链流转因子 (Water)", "Fire": "公关舆情与资产变现活性 (Fire)", "Earth": "固定资产与合规对冲要素 (Earth)"},
    "zh-TW": {"Metal": "契約條款與硬貨幣限制因子 (Metal)", "Wood": "帳期授信與擴張規模因子 (Wood)", "Water": "現金流與供應鏈流轉因子 (Water)", "Fire": "公關輿情與資產變現活性 (Fire)", "Earth": "固定資產與合規對沖要素 (Earth)"},
    "en": {"Metal": "Contractual Constraints & Hard Currency (Metal)", "Wood": "Term Credit & Growth Expansion (Wood)", "Water": "Cash Flow Liquidity & Supply Chain (Water)", "Fire": "Brand Reputation & Active Liquidation (Fire)", "Earth": "Fixed Assets & Compliance Anchoring (Earth)"},
    "ja": {"Metal": "契約条項と硬貨決済制約因子 (Metal)", "Wood": "売掛与信と事業拡大要素 (Wood)", "Water": "キャッシュフロー流動性とサプライチェーン伝導因子 (Water)", "Fire": "ブランド評判と短期資産流動性要素 (Fire)", "Earth": "固定資産とコンプライアンス等構造安定要素 (Earth)"},
    "ko": {"Metal": "계약 조항 및 결제 통화 기준 (Metal)", "Wood": "외상 신용 결제 및 시장 확장 (Wood)", "Water": "현금 흐름 유동성 및 실물 물류망 (Water)", "Fire": "PR 리스크 및 단기 자산 회수 (Fire)", "Earth": "고정 자산 및 컴플라이언스 완충 (Earth)"},
    "es": {"Metal": "Cláusulas de Contrato y Liquidez en Moneda (Metal)", "Wood": "Crédito Comercial y Expansión de Mercado (Wood)", "Water": "Flujo de Caja y Canales de Distribución (Water)", "Fire": "Opinión Pública y Liquidación Corto Plazo (Fire)", "Earth": "Activos Fijos y Cobertura de Cumplimiento (Earth)"},
    "id": {"Metal": "Ketentuan Kontrak & Istilah Mata Uang (Metal)", "Wood": "Kredit Atas Syarat & Faktor Ekspansi (Wood)", "Water": "Likuiditas Arus Kas & Rantai Distribusi (Water)", "Fire": "Hubungan Masyarakat & Likuidasi Pendek (Fire)", "Earth": "Aset Tetap & Lindung Nilai Kepatuhan (Earth)"},
    "ms": {"Metal": "Ketentuan Kontrak & Istilah Mata Uang (Metal)", "Wood": "Kredit Atas Syarat & Faktor Ekspansi (Wood)", "Water": "Likuiditas Arus Kas & Rantai Distribusi (Water)", "Fire": "Hubungan Masyarakat & Likuidasi Pendek (Fire)", "Earth": "Aset Tetap & Lindung Nilai Kepatuhan (Earth)"},
    "th": {"Metal": "ข้อตกลงสัญญาและการตัดจ่ายเงินตรา (Metal)", "Wood": "เทอมเครดิตขยายการค้าและการเติบโต (Wood)", "Water": "สภาพคล่องเงินสดและห่วงโซ่อุปทาน (Water)", "Fire": "การประชาสัมพันธ์และการระบายสินทรัพย์ (Fire)", "Earth": "สินทรัพย์ถาวรและการวางแผนประเมินความเสี่ยง (Earth)"}
  };

  const relationConclMap: Record<string, Record<string, string>> = {
    "zh-CN": {"体用比和": "体用结构自适应契合 / 战略方向比和", "用生体": "外部正向协同驱动 / 优势合力赋能", "体生用": "自有资本向外支出 / 主动承接消耗", "体克用": "自有利益强力推进 / 攻克阻力完成对冲", "用克体": "外部应力反向重创 / 核心资产契约承压", "体用均衡": "要素资本分布均衡 / 相持观望待变"},
    "zh-TW": {"体用比和": "體用結構自適應契合 / 戰略方向比和", "用生体": "外部正向協同驅動 / 優勢合力賦能", "体生用": "自有資本向外支出 / 主動承接消耗", "体克用": "自有利益強力推進 / 攻克阻力完成對沖", "用克体": "外部應力反向重創 / 核心資產契約承壓", "体用均衡": "要素資本分佈均衡 / 相持觀望待變"},
    "en": {"体用比和": "Dynamic Strategic Alignment & Harmony", "用生体": "Positive Synergy & Robust External Support", "体生用": "Capital Efflux & Supportive Resource Allocation", "体克用": "Overcoming Operational Drag & Active Hedging", "用克体": "External Stress Constraints & Risk Vulnerability", "体用均衡": "Bilateral Capital Equilibrium & Active Standoff"},
    "ja": {"体用比和": "双方の要因自律的調和と一致", "用生体": "外部要因による好転・発展促進相乗効果", "体生用": "自己資源・資本流出と推進消耗", "体克用": "難局克服と強気なリスクヘッジ達成", "用克体": "外部圧迫摩擦と信用評価下落警戒", "体用均衡": "市場対抗均衡と膠着観望状態"},
    "ko": {"体用比和": "상호 요인 보완 및 최적 정렬 (체용비화)", "用生体": "외부 우호 여건 조성을 통한 전방 성장 동력", "体生用": "자본 및 리소스 과소비 리스크 (체생용)", "体克用": "난관 돌파 및 독자적 위험 관리 (체극용)", "用克体": "심각한 외부 마찰 및 파트너 계약 리스크 (용극체)", "体用均衡": "행동 지연으로 인한 정체 및 대립 균형"},
    "es": {"体用比和": "Alineación y Sinergia Estratégica Completa", "用生体": "Soporte Externo Sólido y Tracción Operativa", "体生用": "Fuga de Capital y Desgaste por Inversión Activa", "体克用": "Superación de Resistencias y Cobertura Exitosa", "用克体": "Restricciones de Presión Externa y Riesgo Contractual", "体用均衡": "Equilibrio Energético de Caja y Compás de Espera"},
    "id": {"体用比和": "Penyelarasan Strategis & Kebersamaan Harmonis", "用生体": "Sinergi Positif & Dukungan Eksternal Solid", "体生用": "Dispersi Modal & Alokasi Sumber Daya Aktif", "体克用": "Mengatasi Hambatan Operasional & Lindung Nilai Aktif", "用克体": "Tekanan Risiko Kontrak & Kekuatan Luar Menghambat", "体用均衡": "Keseimbangan Modal Bilateral & Sikap Menunggu"},
    "ms": {"体用比和": "Penyelarasan Strategik & Kebersamaan Harmonis", "用生体": "Sinergi Positif & Sokongan Luar Solid", "体生用": "Dispersi Modal & Alokasi Sumber Daya Aktif", "体克用": "Mengatasi Maklumat Operasi & Lindung Nilai Aktif", "用克体": "Tekanan Risiko Kontrak & Kekuatan Luar Menghalang", "体用均衡": "Keseimbangan Modal Bilateral & Sikap Menunggu"},
    "th": {"体用比和": "การจัดตำแหน่งเชิงกลยุทธ์และความสามัคคีที่สมบูรณ์", "用生体": "แรงผลักดันและสนับสนุนโครงสร้างภายนอกเชิงบวก", "体生用": "ทุนสำรองรั่วไหลออกด้านนอกและการใช้จ่ายสุทธิ", "体克用": "การฝ่าฟันอุปสรรคเชิงรุกและการทำกำไรได้สำเร็จ", "用克体": "แรงกดดันทางกฎหมายและความตึงเครียดของสัญญาภายนอก", "体用均衡": "สมดุลของแผนงานและจังหวะนิ่งรอสถานการณ์เชิงบวก"}
  };

  const relationNameMap: Record<string, Record<string, string>> = {
    "zh-CN": {"体用比和": "体用比和", "用生体": "用生体", "体生用": "体生用", "体克用": "体克用", "用克体": "用克体", "体用均衡": "体用均衡"},
    "zh-TW": {"体用比和": "體用比和", "用生体": "用生體", "体生用": "體生用", "体克用": "體克用", "用克体": "用克體", "体用均衡": "體用均衡"},
    "en": {"体用比和": "Ti and Yong Harmony", "用生体": "Yong Produces Ti", "体生用": "Ti Produces Yong", "体克用": "Ti Controls Yong", "用克体": "Yong Controls Ti", "体用均衡": "Ti and Yong Balance"},
    "ja": {"体用比和": "体用比和", "用生体": "用生体", "体生用": "体生用", "体克用": "体克用", "用克体": "用克体", "体用均衡": "体用均衡"},
    "ko": {"体用比和": "체용비화", "用生体": "용생체", "体生用": "체생용", "体克用": "체극용", "用克体": "용극체", "体用均衡": "체용균형"},
    "es": {"体用比和": "Armonía de Ti y Yong", "用生体": "Yong beneficia a Ti", "体生用": "Ti desgasta en Yong", "体克用": "Ti domina a Yong", "用克体": "Yong domina a Ti", "体用均衡": "Equilibrio Ti-Yong"},
    "id": {"体用比和": "Ti dan Yong Harmonis", "Yong Menghidupkan Ti": "Yong Menghidupkan Ti", "Ti Menghidupkan Yong": "Ti Menghidupkan Yong", "体克用": "Ti Mengendalikan Yong", "Yong Mengendalikan Ti": "Yong Mengendalikan Ti", "体用均衡": "Ti dan Yong Seimbang"},
    "ms": {"体用比和": "Ti dan Yong Harmonis", "Yong Menghidupkan Ti": "Yong Menghidupkan Ti", "Ti Menghidupkan Yong": "Ti Menghidupkan Yong", "体克用": "Ti Mengawal Yong", "Yong Mengawal Ti": "Yong Mengawal Ti", "体用均衡": "Ti dan Yong Seimbang"},
    "th": {"体用比和": "ธาตุทวนเสมอเป็นหนึ่ง", "用生体": "ธาตุส่งเสริมเกื้อหนุน", "体生用": "ธาตุระบายกำลังออก", "体克用": "ธาตุควบคุมสยบเหตุ", "用克体": "ธาตุกระทบทำลายตน", "体用均衡": "ระดับธาตุทรงตัวเสมอกัน"}
  };

  const relationInterpMap: Record<string, Record<string, string>> = {
    "zh-CN": {
      "体用比和": "体用五行相同，代表同心协力、平稳和顺、谋事易成。",
      "用生体": "环境或对方极力眷顾体卦，代表贵人相助、顺风顺水、谋求极易成功。",
      "体生用": "能量泄出于外，代表精力、财力或资源严重损耗，事倍功半。",
      "体克用": "虽有阻力，但最终可以通过艰苦努力克敌制胜，凡事需强力推进。",
      "用克体": "面临严重压迫或不可抗外力打击，恐有官非口舌、诉讼风险或合作彻底破裂。",
      "体用均衡": "五行能量处于势均力敌之态势，行事宜静观其变。"
    },
    "zh-TW": {
      "体用比和": "體用五行相同，代表同心協力、平穩和順、謀事易成。",
      "用生体": "環境或對方極力眷顧體卦，代表貴人相助、順風順水、謀求極易成功。",
      "体生用": "能量洩出於外，代表精力、財力或資源嚴重損耗，事倍功半。",
      "体克用": "雖有阻力，但最終可以通過艱苦努力克敵制勝，凡事需強力推進。",
      "用克体": "面臨嚴重壓迫或不可抗外力打擊，恐有官非口舌、訴訟風險或合作徹底破裂。",
      "体用均衡": "五行能量處於勢均力敵之態勢，行事宜靜觀其變。"
    },
    "en": {
      "体用比和": "Both elements are identical. It represents mutual support, steady progress, and easy resolution.",
      "用生体": "The environment or other party supports you strongly. It represents noble help, smooth sailing, and highly elevated success rates.",
      "体生用": "You support the matter/other party, leading to a leakage of energy. It implies high expenditure of resources and striving with modest returns.",
      "体克用": "You subdue the matter with force. Although under resistance, hard work will eventually bring success.",
      "用克体": "The environment or other party suppresses you. It indicates major obstacles, conflict, litigation, or risk of breakage.",
      "体用均衡": "The energies are balanced. It's best to watch quietly and maintain steady operations."
    },
    "ja": {
      "体用比和": "体と用の五行が同一です。お互いの協力が得られ、安泰で順調に物事が運びます。",
      "用生体": "環境や相手が主体を強力に支えます。目上の引き立てや援助を得て、物事が極めて成就しやすい状態です。",
      "体生用": "主体が状況をサポートし、エネルギーが外に漏れ出します。多大な労力や資源を消耗する恐れがあります。",
      "体克用": "主体が困難を克服します。抵抗や負担は大きいですが、断固たる努力で最終的な勝利を収めることができます。",
      "用克体": "環境や相手から強い圧迫や攻撃を受けます。重大なトラブル、決裂、あるいは予期せぬリスクに警戒が必要です。",
      "体用均衡": "五行エネルギーが拮抗しています。今は静観し、着実な進展を待つのが賢明です。"
    },
    "ko": {
      "体用比和": "체와 용의 오행이 동일합니다. 뜻을 합쳐 평온하고 순조로워 도모하는 일이 쉽게 성사됩니다.",
      "用生体": "상황이나 타인이 나를 적극적으로 돕습니다. 귀인의 도움으로 순풍에 돛 단 듯 성공에 근접합니다.",
      "体生用": "에너지가 밖으로 방출되어 소모되는 상입니다. 자원과 정력이 지출되고 결과는 지연될 수 있습니다.",
      "体克用": "내가 장애를 제압하는 형세입니다. 다소 소모전이 따르겠으나, 끈기 있게 추진하면 관철됩니다.",
      "用克体": "외부의 강한 압박이나 통제를 받아 불리합니다. 갈등, 소송 기미, 혹은 파국 위험이 높으니 자제하십시오.",
      "体用均衡": "에너지의 대치가 이루어지고 있습니다. 섣부른 행동은 금물이며, 관망하는 편이 낫습니다."
    },
    "es": {
      "体用比和": "Los elementos de ambos son idénticos. Representa ayuda mutua, avance estable y resoluciones fáciles.",
      "用生体": "El ambiente o la otra parte apoya sólidamente al sujeto. Significa asistencia de aliados, marcha favorable y éxito altamente probable.",
      "体生用": "Se despliega fuerza hacia afuera, fugando energía. Indica gran consumo de recursos con dividendos lentos.",
      "体克用": "Someterá el contratiempo con fuerza. Aunque habrá oposición, el esfuerzo constante asegurará la victoria final.",
      "用克体": "Sufre el control o la opresión directa del entorno. Alerta de litigios, hostilidad manifiesta o ruptura de acuerdos.",
      "体用均衡": "La balanza energética está nivelada. Conviene observar con prudencia y no forzar los acontecimientos."
    },
    "id": {
      "体用比和": "Kedua elemen sama. Menunjukkan kerja sama, kestabilan, kemudahan berbisnis dan kemajuan bersama.",
      "Yong Menghidupkan Ti": "Lingkungan atau pihak lain condong membela Anda. Berarti bantuan dari pihak agung, kelancaran, dan peluang sukses tinggi.",
      "Ti Menghidupkan Yong": "Energi terbuang keluar. Menandakan pengeluaran sumber daya yang berlebih dengan balasan yang lambat.",
      "体克用": "Mengatasi masalah dengan upaya mandiri. Meskipun ada hambatan, usaha gigih akan membawa kesuksesan.",
      "Yong Mengendalikan Ti": "Mendapat tekanan keras dari luar. Waspadai perselisihan hukum, hambatan berat, atau potensi kegagalan.",
      "体用均衡": "Kelekatan energi berada pada level seimbang. Lebih baik menanti dengan tenang dan tidak gegabah."
    },
    "ms": {
      "体用比和": "Kedua-dua elemen sama. Menandakan kerjasama, kestabilan, kemudahan urusan dan kemajuan bersama.",
      "Yong Menghidupkan Ti": "Persekitaran atau pihak lain cenderung memihak kepada anda. Bermaddud bantuan daripada pihak atasan, kelancaran, dan peluang kejayaan tinggi.",
      "Ti Menghidupkan Yong": "Tenaga disalurkan keluar. Menunjukkan pembaziran sumber daya dengan pulangan yang tidak sepadan.",
      "体克用": "Mengatasi kesukaran dengan usaha sendiri. Walaupun ada tentangan, usaha bersungguh-sungguh akan membawa kejayaan.",
      "Yong Mengawal Ti": "Menerima tekanan kuat daripada luar. Berwaspada terhadap pertikaian, cabaran getir, atau potensi kegagalan perkongsian.",
      "体用均衡": "Arus tenaga berada dalam keadaan seimbang. Sebaik-baiknya tunggu dengan sabar dan elakkan tergesa-gesa."
    },
    "th": {
      "体用比和": "ธาตุของเจ้าการและเรื่องราวเสมอกัน แสดงถึงความร่วมมือร่วมใจ ราบรื่นดุจญาติมิตร มุ่งมาดภารกิจมักสำเร็จ",
      "用生体": "เรื่องราวภายนอกเกื้อหนุนตอบรับด้วยดี มีผู้ใหญ่อุปถัมภ์ช่วยเหลือ ทุกอย่างราบรื่นรวดเร็วและสำเร็จลุล่วงสมบูรณ์",
      "体生用": "ทุ่มพลังและทรัพยากรออกไปจนพลังธาตุล้นออก มีเกณฑ์สิ้นเปลืองแรงกายแรงใจแต่ผลสัมฤทธิ์ค่อนข้างเชื่องช้า",
      "体克用": "ต้องเอาชนะอุปสรรคมาด้วยกำลังและการฝ่าฟัน แม้มีแรงต้านสูงมาก แต่หากลงมือลงแรงต่อเนื่องจะสำเร็จปลายทาง",
      "用克体": "กำลังเผชิญกับการถูกบีบบังคับหรืออุปสรรคอันตรายจากภายนอก ระวังข้อพิพาท คดีความ หรือปัญหาฉีกสัญญากะทันหัน",
      "体用均衡": "พลังงานธาตุทั้งสองฝ่ายยันกันอยู่ในจุดกึ่งกลาง แนะนำให้รักษาความสงบและรอดูจังหวะดีกว่าขยับขยายกะทันหัน"
    }
  };

  const currentLang = linesNameMap[lang] ? lang : "en";
  const linesName = linesNameMap[currentLang];
  const activeYao = linesName[payload.changingLine - 1];

  const tiTrigName = payload.tiGua.trigram.name;
  const yongTrigName = payload.yongGua.trigram.name;

  const tiTrigDisp = trigramNamesMap[currentLang][tiTrigName] || tiTrigName;
  const yongTrigDisp = trigramNamesMap[currentLang][yongTrigName] || yongTrigName;

  const tiElementDisp = elementsMap[currentLang][payload.tiGua.trigram.element] || payload.tiGua.trigram.element;
  const yongElementDisp = elementsMap[currentLang][payload.yongGua.trigram.element] || payload.yongGua.trigram.element;

  const conclusionKey = payload.relationship.conclusion;
  const conclusionDisp = relationConclMap[currentLang][conclusionKey] || conclusionKey;
  const interpretationDisp = relationInterpMap[currentLang][conclusionKey] || payload.relationship.chineseInterpretation;

  if (currentLang === "zh-CN" || currentLang === "zh-TW") {
    const isCN = currentLang === "zh-CN";
    const head = isCN
      ? "【数智梅花易理判定 - 本地流控推演】"
      : "【數智梅花易理判定 - 本地流控推演】";

    return `${head}
起卦干支时间：${ganzhiTime}

1. 【体用生克分析】
本卦之体卦为【${tiTrigDisp}】（五行属：${tiElementDisp}），代表问卦主体身处于此特定时序坐标。
用卦为【${yongTrigDisp}】（五行属：${yongElementDisp}），代表着所问之事或外部环境。
体用生克对应关系为：【${conclusionDisp}】，五行关系提示：${interpretationDisp}

2. 【本卦与变卦断意】
本卦为：【${payload.charts.original.name}】。卦意：${originalGuaDetails?.description || ""}
卦辞/判词：${originalGuaDetails?.judgement || ""}
发动之爻为【${activeYao}】。变卦（化卦）为：【${payload.charts.transformed.name}】。卦意：${transformedGuaDetails?.description || ""}
变卦卦辞/判词：${transformedGuaDetails?.judgement || ""}

3. 【全面玄学综述】
结合起卦之【${ganzhiTime.split(" ")[2] || "日"}】五行旺衰，体用【${conclusionDisp}】之象昭示：事情在萌芽期有【${payload.charts.original.name}】之兆，经【${activeYao}】之激荡运动，最终归宿于【${payload.charts.transformed.name}】。
若逢生体（用生体、比和）则大有支持、谋事易成；若逢泄体（体生用）或克体（用克体）则阻力波澜频生，宜稳健固守。`;
  } else if (currentLang === "ja") {
    return `【梅花易数ローカル推論 - 判定サマリー】
推論時空干支カレンダー：${ganzhiTime}

1. 【体用五行相互作用】
体卦（本人自身）は【${tiTrigDisp}】（五行属性：${tiElementDisp}）であり、現在の意思決定主体の状況を示します。
用卦（関心事・目標）は【${yongTrigDisp}】（五行属性：${yongElementDisp}）であり、直面している課題または相手を表します。
体用の力学関係：【${conclusionDisp}】
属性의 相互関係指標：${interpretationDisp}

2. 【本卦と変卦の傾向解読】
当初の本卦は【${payload.charts.original.name}】です。
- 卦辞判決：${originalGuaDetails?.judgement || ""}
- 象徴する意味：${originalGuaDetails?.description || ""}
今回の変化点は【${activeYao}】が起動し、最終的に変卦【${payload.charts.transformed.name}】へ移行します。
- 変卦の卦辞：${transformedGuaDetails?.judgement || ""}
- 変卦の示す帰結：${transformedGuaDetails?.description || ""}

3. 【総合推論見解】
五行旺衰と体用の関係【${conclusionDisp}】に基づくと、物事は当初【${payload.charts.original.name}】の様相から始まり、${activeYao}の推移を経て、最終的に【${payload.charts.transformed.name}】に統合されます。この流れを貴殿の戦略に合わせ、慎重かつ大胆に進めてください。`;
  } else if (currentLang === "ko") {
    return `【매화역수 로컬 분석 - 판단 요약】
추론 간지 시간 좌표：${ganzhiTime}

1. 【체용 오행 작용 분석】
체괘(의사결정 주체/자아)는【${tiTrigDisp}】(오행: ${tiElementDisp})이며, 질문자가 처한 기운의 중심입니다.
용괘(대상의 사안/상황)는【${yongTrigDisp}】(오행: ${yongElementDisp})이며, 해결해야 할 과업의 흐름입니다.
체용 오행 대비 작용: 【${conclusionDisp}】
세부 해석 방향: ${interpretationDisp}

2. 【본괘 및 변괘 의미 풀이】
본괘(초기 국면)는 【${payload.charts.original.name}】입니다.
- 원문 판단: ${originalGuaDetails?.judgement || ""}
- 본괘 의미: ${originalGuaDetails?.description || ""}
이어서 【${activeYao}】이 발동되어 동적 상황을 야기하며 변괘인 【${payload.charts.transformed.name}】로 전환됩니다.
- 변괘 판단: ${transformedGuaDetails?.judgement || ""}
- 변괘 귀결: ${transformedGuaDetails?.description || ""}

3. 【종합적 역리 판단】
체용의 대비 방향【${conclusionDisp}】에 내포된 흐름에 의거할 때, 본 사안은 초기 【${payload.charts.original.name}】의 징조 가닥을 탄 후, ${activeYao}의 계기와 변화를 거치면서 최종적으로 【${payload.charts.transformed.name}】의 구도로 수렴될 것입니다. 귀인의 조력이 따르는 상생 국면일 경우 성사가 매우 빠르며, 상극 국면일 경우 지체가 예상되니 처신을 신중히 하십시오.`;
  } else if (currentLang === "es") {
    return `[Motor de Inferencia Local Meihua - Diagnóstico]
Calendario Relacional Temporal: ${ganzhiTime}

1. [Análisis de Interacción Ti-Yong]
- Trigrama Ti (El Sujeto / Yo): 【${tiTrigDisp}】 (Atributo Elemental: ${tiElementDisp})
- Trigrama Yong (El Asunto / Destino): 【${yongTrigDisp}】 (Atributo Elemental: ${yongElementDisp})
- Conclusión Estructural: 【${conclusionDisp}】
- Interpretación Metafísica: ${interpretationDisp}

2. [Evolución de los Hexagramas]
- Hexagrama Original (Ben Gua): 【${payload.charts.original.name}】
  - Veredicto Clásico: ${originalGuaDetails?.judgement || ""}
  - Significado General: ${originalGuaDetails?.description || ""}
- Modificador: La 【${activeYao}】 cataliza el cambio al hexagrama resultante.
- Hexagrama Futuro (Bian Gua): 【${payload.charts.transformed.name}】
  - Veredicto de Transición: ${transformedGuaDetails?.judgement || ""}
  - Significado Futuro: ${transformedGuaDetails?.description || ""}

3. [Síntesis Predictiva Global]
La iniciativa se desenvuelve bajo la influencia original de ${payload.charts.original.name}, cruza un umbral dinámico de actividad en la ${activeYao} y culmina resolviéndose en ${payload.charts.transformed.name}. Ajuste su estrategia conforme a estas predisposiciones elementales.`;
  } else if (currentLang === "id") {
    return `[Mesin Analitik Lokal Meihua Yishu - Prediksi]
Dimensi Waktu Batang Cabang: ${ganzhiTime}

1. [Interaksi Ti-Yong Menurut Lima Elemen]
- Trigrama Ti (Diri Sendiri): 【${tiTrigDisp}】 (Elemen: ${tiElementDisp})
- Trigrama Yong (Aspek Masalah): 【${yongTrigDisp}】 (Elemen: ${yongElementDisp})
- Hubungan Struktural: 【${conclusionDisp}】
- Tafsiran Solusi: ${interpretationDisp}

2. [Tinjauan Transmutasi Heksagram]
- Heksagram Awal (Ben Gua): 【${payload.charts.original.name}】
  - Keputusan Filosofis: ${originalGuaDetails?.judgement || ""}
  - Arti Struktural: ${originalGuaDetails?.description || ""}
- Pemicu Perubahan: Gerakan pada 【${activeYao}】 mengaktifkan transisi.
- Heksagram Transformatif (Bian Gua): 【${payload.charts.transformed.name}】
  - Keputusan Akhir: ${transformedGuaDetails?.judgement || ""}
  - Arti Hasil Akhir: ${transformedGuaDetails?.description || ""}

3. [Sintesis Dan Saran Tindakan]
Masalah ini dimulai di bawah pengaruh heksagram ${payload.charts.original.name}, mengalami titik balik operasional yang dipicu oleh ${activeYao}, dan pada akhirnya bermuara di heksagram ${payload.charts.transformed.name}. Hubungkan perkembangan alami ini dengan keputusan bisnis Anda secara matang.`;
  } else if (currentLang === "ms") {
    return `[Enjin Analitik Tempatan Meihua Yishu - Prediksi]
Sistem Masa Batang Cabang Tradisional: ${ganzhiTime}

1. [Interaksi Ti-Yong Mengikut Lima Elemen]
- Trigrama Ti (Subjek Utama / Diri): 【${tiTrigDisp}】 (Elemen: ${tiElementDisp})
- Trigrama Yong (Aspek Masalah / Sasaran): 【${yongTrigDisp}】 (Elemen: ${yongElementDisp})
- Hubungan Struktural: 【${conclusionDisp}】
- Huraian Strategi: ${interpretationDisp}

2. [Tujuan Evolusi Heksagram]
- Heksagram Asal (Ben Gua): 【${payload.charts.original.name}】
  - Keputusan Purba: ${originalGuaDetails?.judgement || ""}
  - Maksud Keadaan: ${originalGuaDetails?.description || ""}
- Titik Tolak Perubahan: Gerakan pada 【${activeYao}】 mencetuskan peralihan keadaan.
- Heksagram Transformatif (Bian Gua): 【${payload.charts.transformed.name}】
  - Keputusan Akhir: ${transformedGuaDetails?.judgement || ""}
  - Maksud Akhir: ${transformedGuaDetails?.description || ""}

3. [Rumusan Dan Cadangan Tindakan]
Perkara ini berjalan mengikut petunjuk keadaan asal ${payload.charts.original.name}, merentasi rintangan dinamik pada ${activeYao}, dan akhirnya berhimpun ke dalam heksagram ${payload.charts.transformed.name}. Selaraskan keputusan taktikal anda dengan keseimbangan elemen ini untuk kejayaan maksima.`;
  } else {
    // Thai (th)
    return `[ระบบประมวลผลโลคัล เมยฮวาอี้ซู่ - สรุปคำทำนาย]
พิกัดเวลาและกาลโยค干支: ${ganzhiTime}

1. [วิเคราะห์ปฏิกิริยาธาตุเจ้าการและเรื่องราว (Ti-Yong)]
- ธาตุเจ้าการ Ti (ตัวตนหลัก): 【${tiTrigDisp}】 (หมวดธาตุ: ${tiElementDisp})
- ธาตุเรื่องราว Yong (ประเด็นภายนอก): 【${yongTrigDisp}】 (หมวดธาตุ: ${yongElementDisp})
- ความสัมพันธ์เชิงธาตุรวม: 【${conclusionDisp}】
- ความหมายชี้นำกลยุทธ์: ${interpretationDisp}

2. [พยากรณ์โครงสร้างทวิลักษณ์และการแปรผัน]
- มณฑลตั้งต้น (Ben Gua): 【${payload.charts.original.name}】
  - คำพิพากษาโบราณ: ${originalGuaDetails?.judgement || ""}
  - รายละเอียดพื้นฐาน: ${originalGuaDetails?.description || ""}
- จุดเหนี่ยวนำขยับ: การเปลี่ยนแปลงในแถบ 【${activeYao}】 จะส่งผลกระทบนำทางไปสู่งมณฑลแปรผัน
- มณฑลแปรผันปลายทาง (Bian Gua): 【${payload.charts.transformed.name}】
  - คำพิพากษาเป้าหมาย: ${transformedGuaDetails?.judgement || ""}
  - รายละเอียดผลลัพธ์: ${transformedGuaDetails?.description || ""}

3. [สังเคราะห์ทิศทางการโคจรโดยรวม]
เรื่องราวที่เกิดจะเริ่มต้นตามสภาพธาตุและลักษณะของมณฑล ${payload.charts.original.name} จากนั้นจะเกิดแนวทางปรับแต่งหรือวิกฤตความเปลี่ยนแปลง ณ แถบจุดเปลี่ยน ${activeYao} ก่อนจะลงเอยสำเร็จลุล่วงในทิศทางของมณฑล ${payload.charts.transformed.name} ขอให้ใช้สติปัญญาปรับแผนพฤติกรรมสอดคล้องกับธรรมชาติเพื่อความโชคดี`;
  }
}

/**
 * Calculates dynamic divination confidence based on the San-Cai paradigm:
 * Heaven (Season) + Earth (GPS LBS Direction Alignment) + Human (Kinetic Intention).
 */
export function calculateSanCaiConfidence(
  tiElement: string,               // e.g. "Fire", "Wood", "Water", "Metal", "Earth"
  monthBranch: string,             // "子", "丑", "寅", etc.
  lat: number,
  lng: number,
  velocities: number[]             // User's scratch speeds array
): number {
  // WuXing Generative/Destructive Matrix
  // Elements: Wood (木), Fire (火), Earth (土), Metal (金), Water (水)
  const wuxingAffinity: Record<string, Record<string, number>> = {
    "Fire":  {"Wood": 1.0, "Fire": 1.0, "Earth": 0.6, "Metal": 0.3, "Water": 0.1},
    "Wood":  {"Water": 1.0, "Wood": 1.0, "Fire": 0.6, "Earth": 0.3, "Metal": 0.1},
    "Water": {"Metal": 1.0, "Water": 1.0, "Wood": 0.6, "Fire": 0.3, "Earth": 0.1},
    "Metal": {"Earth": 1.0, "Metal": 1.0, "Water": 0.6, "Wood": 0.3, "Fire": 0.1},
    "Earth": {"Fire": 1.0, "Earth": 1.0, "Metal": 0.6, "Water": 0.3, "Wood": 0.1}
  };

  const BRANCH_ELEMENTS: Record<string, string> = {
    "子": "Water",
    "亥": "Water",
    "寅": "Wood",
    "卯": "Wood",
    "巳": "Fire",
    "午": "Fire",
    "丑": "Earth",
    "辰": "Earth",
    "未": "Earth",
    "戌": "Earth"
  };

  // 1. Tian (Season) Factor
  const month_element = BRANCH_ELEMENTS[monthBranch] || "Earth";
  const season_factor = wuxingAffinity[month_element]?.[tiElement] ?? 0.5;

  // 2. Di (Spatial/LBS) Factor
  // Map standard coordinates relative to Shanghai center (31.23, 121.47)
  const originLat = 31.23;
  const originLng = 121.47;
  const dy = lat - originLat;
  const dx = lng - originLng;

  let angleDeg = 90; // Default to East
  if (dx !== 0 || dy !== 0) {
    const angleRad = Math.atan2(dx, dy); // radians: -PI to PI
    angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
  }

  // 8 Cardinal/Ordinal Feng Shui Directions
  let geo_direction = "East";
  if (angleDeg >= 337.5 || angleDeg < 22.5) geo_direction = "North";
  else if (angleDeg >= 22.5 && angleDeg < 67.5) geo_direction = "NorthEast";
  else if (angleDeg >= 67.5 && angleDeg < 112.5) geo_direction = "East";
  else if (angleDeg >= 112.5 && angleDeg < 157.5) geo_direction = "SouthEast";
  else if (angleDeg >= 157.5 && angleDeg < 202.5) geo_direction = "South";
  else if (angleDeg >= 202.5 && angleDeg < 247.5) geo_direction = "SouthWest";
  else if (angleDeg >= 247.5 && angleDeg < 292.5) geo_direction = "West";
  else if (angleDeg >= 292.5 && angleDeg < 337.5) geo_direction = "NorthWest";

  const DIRECTION_ELEMENTS: Record<string, string> = {
    "North": "Water",
    "NorthEast": "Earth",
    "East": "Wood",
    "SouthEast": "Wood",
    "South": "Fire",
    "SouthWest": "Earth",
    "West": "Metal",
    "NorthWest": "Metal"
  };

  const geo_element = DIRECTION_ELEMENTS[geo_direction] || "Earth";

  const produces: Record<string, string> = {
    "Wood": "Fire",
    "Fire": "Earth",
    "Earth": "Metal",
    "Metal": "Water",
    "Water": "Wood"
  };
  const controls: Record<string, string> = {
    "Wood": "Earth",
    "Earth": "Water",
    "Water": "Fire",
    "Fire": "Metal",
    "Metal": "Wood"
  };

  let G = 0.5;
  if (geo_element === tiElement || produces[geo_element] === tiElement) {
    G = 1.0;
  } else if (controls[geo_element] === tiElement) {
    G = 0.15;
  } else if (produces[tiElement] === geo_element) {
    G = 0.3;
  } else if (controls[tiElement] === geo_element) {
    G = 0.5;
  }

  // 3. Ren (Kinetic) Factor (Stability Index S in [0.5, 1.0])
  let S = 0.85; // Solid baseline fallback
  if (velocities.length > 5) {
    const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0; // coefficient of variation
    S = Math.max(0.5, Math.min(1.0, 1.0 - (cv * 0.35)));
  } else {
    // Semi-deterministic seed based on lengths
    const sumVel = velocities.reduce((sum, v) => sum + v, 0);
    S = Math.max(0.65, Math.min(0.98, 0.75 + (sumVel % 0.23)));
  }

  // Composite multi-weighted formula
  // Confidence Score = 60.00 + (M * 10.00) + (G * 10.00) + (S * 19.99)
  const confidence = 60.00 + (season_factor * 10.00) + (G * 10.00) + (S * 19.99);

  return parseFloat(confidence.toFixed(2));
}

export function getWuXingRelationshipInterpretation(
  conclusionKey: string,
  tiElement: string,
  yongElement: string,
  lang: string
): string {
  const elementsMap: Record<string, Record<string, string>> = {
    "en": {"Metal": "Metal", "Wood": "Wood", "Water": "Water", "Fire": "Fire", "Earth": "Earth"},
    "zh-CN": {"Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土"},
    "zh-TW": {"Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土"},
    "ja": {"Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土"},
    "ko": {"Metal": "금", "Wood": "목", "Water": "수", "Fire": "화", "Earth": "토"},
    "es": {"Metal": "Metal", "Wood": "Madera", "Water": "Agua", "Fire": "Fuego", "Earth": "Tierra"},
    "id": {"Metal": "Logam", "Wood": "Kayu", "Water": "Air", "Fire": "Api", "Earth": "Tanah"},
    "ms": {"Metal": "Logam", "Wood": "Kayu", "Water": "Air", "Fire": "Api", "Earth": "Tanah"},
    "th": {"Metal": "ทองคำ", "Wood": "ไม้", "Water": "น้ำ", "Fire": "ไฟ", "Earth": "ดิน"}
  };

  const currentLang = elementsMap[lang] ? lang : "en";
  const ti = elementsMap[currentLang][tiElement] || tiElement;
  const yong = elementsMap[currentLang][yongElement] || yongElement;

  const templates: Record<string, Record<string, string>> = {
    "zh-CN": {
      "体用比和": `体用五行均为 ${ti}，代表同心协力、平稳和顺、谋事易成。`,
      "用生体": `${yong}生${ti}。环境或对方极力眷顾体卦，代表贵人相助、顺风顺水、谋求极易成功。`,
      "体生用": `${ti}生${yong}。能量泄出于外，代表精力、财力或资源严重损耗，事倍功半。`,
      "体克用": `${ti}克${yong}。虽有阻力，但最终可以通过艰苦努力克敌制胜，凡事需强力推进。`,
      "用克体": `${yong}克${ti}。面临严重压迫或不可抗外力打击，恐有官非口舌、诉讼风险或合作彻底破裂。`,
      "体用均衡": "五行能量处于势均力敌之态势，行事宜静观其变。"
    },
    "zh-TW": {
      "体用比和": `體用五行均為 ${ti}，代表同心協力、平穩和順、謀事易成。`,
      "用生体": `${yong}生${ti}。環境或對方極力眷顧體卦，代表貴人相助、順風順水、謀求極易成功。`,
      "体生用": `${ti}生${yong}。能量洩出於外，代表精力、財力或資源嚴重損耗，事倍功半。`,
      "体克用": `${ti}克${yong}。雖有阻力，但最終可以通過艱苦努力克敵制勝，凡事需強力推進。`,
      "用克体": `${yong}克${ti}。面臨嚴重壓迫或不可抗外力打擊，恐有官非口舌、訴訟風險或合作徹底破裂。`,
      "体用均衡": "五行能量處於勢均力敵之態勢，行事宜靜觀其變。"
    },
    "en": {
      "体用比和": `Both Ti and Yong elements are ${ti}. It represents mutual support, steady progress, and easy resolution.`,
      "用生体": `${yong} produces ${ti}. The environment or other party supports you strongly. It represents noble help, smooth sailing, and highly elevated success rates.`,
      "体生用": `${ti} produces ${yong}. You support the matter/other party, leading to a leakage of energy. It implies high expenditure of resources and striving with modest returns.`,
      "体克用": `${ti} controls ${yong}. You subdue the matter with force. Although under resistance, hard work will eventually bring success.`,
      "用克体": `${yong} controls ${ti}. The environment or other party suppresses you. It indicates major obstacles, conflict, litigation, or risk of breakage.`,
      "体用均衡": "The energies are balanced. It's best to watch quietly and maintain steady operations."
    },
    "ja": {
      "体用比和": `体用の五行は共に ${ti} です。お互いの協力が得られ、安泰で順調に物事が運びます。`,
      "用生体": `${yong}が${ti}を生じます。環境や相手が主体を強力に支えます。目上の引き立てや援助を得て、物事が極めて成就しやすい状態です。`,
      "体生用": `${ti}が${yong}を生じます。主体が状況をサポートし、エネルギーが外に漏れ出します。多大な労力や資源を消耗する恐れがあります。`,
      "体克用": `${ti}が${yong}を克します。主体が困難を克服します。抵抗や負担は大きいですが、断固たる努力で最終的な勝利を収めることができます。`,
      "用克体": `${yong}が${ti}を克します。環境や相手から強い圧迫や攻撃を受けます。重大なトラブル、決裂、あるいは予期せぬリスクに警戒が必要です。`,
      "体用均衡": "五行エネルギーが拮抗しています。今は静観し、着実な進展を待つのが賢明です。"
    },
    "ko": {
      "体用比和": `체와 용의 오행이 모두 ${ti} 입니다. 뜻을 합쳐 평온하고 순조워 도모하는 일이 쉽게 성사됩니다.`,
      "用生体": `${yong}이(가) ${ti}을(를) 생합니다. 상황이나 타인이 나를 적극적으로 돕습니다. 귀인의 도움으로 순풍에 돛 단 듯 성공에 근접합니다.`,
      "体生用": `${ti}이(g) ${yong}을(를) 생합니다. 에너지가 밖으로 방출되어 소모되는 상입니다. 자원과 정력이 지출되고 결과는 지연될 수 있습니다.`,
      "体克用": `${ti}이(가) ${yong}을(를) 극합니다. 내가 장애를 제압하는 형세입니다. 다소 소모전이 따르겠으나, 끈기 있게 추진하면 관철됩니다.`,
      "用克体": `${yong}이(가) ${ti}을(를) 극합니다. 외부의 강한 압박이나 통제를 받아 불리합니다. 갈등, 소송 기미, 혹은 파국 위험이 높으니 자제하십시오.`,
      "体用均衡": "오행의 에너지가 대치 상태로 균형을 이루고 있습니다. 섣부른 행동은 금물이며, 관망하는 편이 낫습니다."
    },
    "es": {
      "体用比和": `Los elementos de Ti y Yong son ambos ${ti}. Representa ayuda mutua, avance estable y resoluciones fáciles.`,
      "用生体": `${yong} genera a ${ti}. El ambiente o la otra parte apoya sólidamente al sujeto. Significa asistencia de aliados, marcha favorable y éxito altamente probable.`,
      "体生用": `${ti} genera a ${yong}. Se despliega fuerza hacia afuera, fugando energía. Indica gran consumo de recursos con dividendos lentos.`,
      "体克用": `${ti} controla a ${yong}. Someterá el contratiempo con fuerza. Aunque habrá oposición, el esfuerzo constante asegurará la victoria final.`,
      "用克体": `${yong} controla a ${ti}. Sufre el control o la opresión directa del entorno. Alerta de litigios, hostilidad manifiesta o ruptura de acuerdos.`,
      "体用均衡": "La balanza energética está nivelada. Conviene observar con prudencia y no forzar los acontecimientos."
    },
    "id": {
      "体用比和": `Kedua elemen Ti dan Yong adalah ${ti}. Menunjukkan kerja sama, kestabilan, kemudahan berbisnis dan kemajuan bersama.`,
      "用生体": `${yong} menghidupkan ${ti}. Lingkungan atau pihak lain condong membela Anda. Berarti bantuan dari pihak agung, kelancaran, dan peluang sukses tinggi.`,
      "体生用": `${ti} menghidupkan ${yong}. Energi terbuang keluar. Menandakan pengeluaran sumber daya yang berlebih dengan balasan yang lambat.`,
      "体克用": `${ti} mengendalikan ${yong}. Mengatasi masalah dengan upaya mandiri. Meskipun ada hambatan, usaha gigih akan membawa kesuksesan.`,
      "用克体": `${yong} mengendalikan ${ti}. Mendapat tekanan keras dari luar. Waspadai perselisihan hukum, hambatan berat, atau potensi kegagalan.`,
      "体用均衡": "Kelekatan energi berada pada level seimbang. Lebih baik menanti dengan tenang dan tidak gegabah."
    },
    "ms": {
      "体用比和": `Kedua-dua elemen Ti dan Yong adalah ${ti}. Menandakan kerjasama, kestabilan, kemudahan urusan dan kemajuan bersama.`,
      "用生体": `${yong} menghidupkan ${ti}. Persekitaran atau pihak lain cenderung memihak kepada anda. Bermakna bantuan daripada pihak atasan, kelancaran, dan peluang kejayaan tinggi.`,
      "体生用": `${ti} menghidupkan ${yong}. Tenaga disalurkan keluar. Menunjukkan pembaziran sumber daya dengan pulangan yang tidak sepadan.`,
      "体克用": `${ti} mengawal ${yong}. Mengatasi kesukaran dengan usaha sendiri. Walaupun ada tentangan, usaha bersungguh-sungguh akan membawa kejayaan.`,
      "用克体": `${yong} mengawal ${ti}. Menerima tekanan kuat daripada luar. Berwaspada terhadap pertikaian, cabaran getir, atau potensi kegagalan perkongsian.`,
      "体用均衡": "Arus tenaga berada dalam keadaan seimbang. Sebaik-baiknya tunggu dengan sabar dan elakkan tergesa-gesa."
    },
    "th": {
      "体用比和": `ธาตุของ Ti และ Yong เป็นธาตุ ${ti} เช่นเดียวกัน แสดงถึงความร่วมมือร่วมใจ ราบรื่นดุจญาติมิตร มุ่งมาดภารกิจมักสำเร็จ`,
      "用生体": `ธาตุ ${yong} ส่งเสริมธาตุ ${ti} เรื่องราวภายนอกเกื้อหนุนตอบรับด้วยดี มีผู้ใหญ่อุปถัมภ์ช่วยเหลือ ทุกอย่างราบรื่นรวดเร็วและสำเร็จลุล่วงสมบูรณ์`,
      "体生用": `ธาตุ ${ti} ส่งเสริมธาตุ ${yong} ทุ่มพลังและทรัพยากรออกไปจนพลังธาตุล้นออก มีเกณฑ์สิ้นเปลืองแรงกายแรงใจแต่ผลสัมฤทธิ์ค่อนข้างเชื่องช้า`,
      "体克用": `ธาตุ ${ti} ควบคุมธาตุ ${yong} ต้องเอาชนะอุปสรรคมาด้วยกำลังและการฝ่าฟัน แม้มีแรงต้านสูงมาก แต่หากลงมือลงแรงต่อเนื่องจะสำเร็จปลายทาง`,
      "用克体": `ธาตุ ${yong} ควบคุมธาตุ ${ti} กำลังเผชิญกับการถูกบีบบังคับหรืออุปสรรคอันตรายจากภายนอก ระวังข้อพิพาท คดีความ หรือปัญหาฉีกสัญญากะทันหัน`,
      "体用均衡": "พลังงานธาตุทั้งสองฝ่ายยันกันอยู่ในจุดกึ่งกลาง แนะนำให้รักษาความสงบและรอดูจังหวะดีกว่าขยับขยายกะทันหัน"
    }
  };

  return templates[currentLang]?.[conclusionKey] || templates["en"]?.[conclusionKey] || conclusionKey;
}


