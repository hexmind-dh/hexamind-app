import { TRIGRAMS, HEXAGRAMS, lookupTrigramByLines } from '@/data/guas'
import type { DivinationPayload } from '@/types'

/**
 * 五行生克判定
 */
export function getWuXingRelation(
  tiElement: string,
  yongElement: string,
): {
  type: string
  conclusion: string
  auspiciousness: string
  chineseInterpretation: string
} {
  const elementsMap: Record<string, string> = {
    Metal: '金', Wood: '木', Water: '水', Fire: '火', Earth: '土',
  }

  const ti = elementsMap[tiElement] || '土'
  const yong = elementsMap[yongElement] || '土'

  if (ti === yong) {
    return {
      type: 'Ti and Yong Harmonize',
      conclusion: '体用比和',
      auspiciousness: 'Auspicious',
      chineseInterpretation: `体用五行均为 ${ti}，代表同心协力、平稳和顺、谋事易成。`,
    }
  }

  const produces: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
  const controls: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

  if (produces[yong] === ti) {
    return {
      type: 'Yong Produces Ti',
      conclusion: '用生体',
      auspiciousness: 'Extremely Auspicious',
      chineseInterpretation: `${yong}生${ti}。环境/对方极力眷顾体卦，代表贵人相助、顺风顺水。`,
    }
  }

  if (produces[ti] === yong) {
    return {
      type: 'Ti Produces Yong',
      conclusion: '体生用',
      auspiciousness: 'Leak',
      chineseInterpretation: `${ti}生${yong}。能量泄出于外，代表精力、财力或资源严重损耗。`,
    }
  }

  if (controls[ti] === yong) {
    return {
      type: 'Ti Controls Yong',
      conclusion: '体克用',
      auspiciousness: 'Exhausting',
      chineseInterpretation: `${ti}克${yong}。虽有阻力，但最终可以通过艰苦努力克敌制胜。`,
    }
  }

  if (controls[yong] === ti) {
    return {
      type: 'Yong Controls Ti',
      conclusion: '用克体',
      auspiciousness: 'Highly Inauspicious',
      chineseInterpretation: `${yong}克${ti}。面临严重压迫或不可抗外力打击。`,
    }
  }

  return {
    type: 'Ti and Yong Balance',
    conclusion: '体用均衡',
    auspiciousness: 'Neutral',
    chineseInterpretation: '五行能量处于势均力敌之态势，行事宜静观其变。',
  }
}

/**
 * 核心梅花易数计算
 */
export function runMeihuaCalculation(
  timestamp: number,
  lat: number,
  lng: number,
  kineticSpeed: number,
): DivinationPayload {
  const T = timestamp
  const S_lat = parseFloat(lat.toFixed(2))
  const S_lng = parseFloat(lng.toFixed(2))
  const K = kineticSpeed

  // 上卦: T mod 8
  let upperId = T % 8
  if (upperId === 0) upperId = 8

  const latInteger = Math.round(Math.abs(S_lat) * 100)
  const lngInteger = Math.round(Math.abs(S_lng) * 100)
  const kineticInteger = Math.round(K * 100)

  // 下卦: (|lat|*100 + |lng|*100 + K*100) mod 8
  let lowerId = (latInteger + lngInteger + kineticInteger) % 8
  if (lowerId === 0) lowerId = 8

  // 动爻: (T + |lat|*100 + |lng|*100 + K*100) mod 6
  let changingLine = (T + latInteger + lngInteger + kineticInteger) % 6
  if (changingLine === 0) changingLine = 6

  const upperTrigram = TRIGRAMS[upperId]
  const lowerTrigram = TRIGRAMS[lowerId]

  // 本卦
  const originalLines = [...lowerTrigram.lines, ...upperTrigram.lines]

  // 互卦
  const innerNuclearLines = [originalLines[1], originalLines[2], originalLines[3]]
  const outerNuclearLines = [originalLines[2], originalLines[3], originalLines[4]]
  const nuclearLowerTrigram = lookupTrigramByLines(innerNuclearLines)
  const nuclearUpperTrigram = lookupTrigramByLines(outerNuclearLines)
  const nuclearLines = [...innerNuclearLines, ...outerNuclearLines]

  // 变卦
  const transformedLines = [...originalLines]
  transformedLines[changingLine - 1] = transformedLines[changingLine - 1] === 1 ? 0 : 1
  const transformedLowerTrigram = lookupTrigramByLines([transformedLines[0], transformedLines[1], transformedLines[2]])
  const transformedUpperTrigram = lookupTrigramByLines([transformedLines[3], transformedLines[4], transformedLines[5]])

  // 体用
  const tiChanging = changingLine <= 3
  const tiRole = tiChanging ? 'Upper' as const : 'Lower' as const
  const yongRole = tiChanging ? 'Lower' as const : 'Upper' as const
  const tiTrigram = tiChanging ? upperTrigram : lowerTrigram
  const yongTrigram = tiChanging ? lowerTrigram : upperTrigram

  const relationResult = getWuXingRelation(tiTrigram.element, yongTrigram.element)

  const originalKey = `${upperId}_${lowerId}`
  const nuclearKey = `${nuclearUpperTrigram.id}_${nuclearLowerTrigram.id}`
  const transformedKey = `${transformedUpperTrigram.id}_${transformedLowerTrigram.id}`

  const originalGua = HEXAGRAMS[originalKey] || {
    name: '未知', english: 'Unknown', pinyin: '', description: '', judgement: '',
  }
  const nuclearGua = HEXAGRAMS[nuclearKey] || {
    name: '未知', english: 'Unknown', pinyin: '', description: '', judgement: '',
  }
  const transformedGua = HEXAGRAMS[transformedKey] || {
    name: '未知', english: 'Unknown', pinyin: '', description: '', judgement: '',
  }

  return {
    temporalSeed: { rawValue: timestamp, hex: '0x' + timestamp.toString(16).toUpperCase() },
    spatialSeed: { lat, lng, formatted: `${S_lat.toFixed(2)}°N, ${S_lng.toFixed(2)}°E` },
    kineticSeed: { rawValue: K },
    charts: {
      original: {
        name: originalGua.name,
        english: originalGua.english,
        symbol: `${upperTrigram.symbol}${lowerTrigram.symbol}`,
        lines: originalLines,
        upper: upperTrigram,
        lower: lowerTrigram,
      },
      nuclear: {
        name: nuclearGua.name,
        english: nuclearGua.english,
        symbol: `${nuclearUpperTrigram.symbol}${nuclearLowerTrigram.symbol}`,
        lines: nuclearLines,
        upper: nuclearUpperTrigram,
        lower: nuclearLowerTrigram,
      },
      transformed: {
        name: transformedGua.name,
        english: transformedGua.english,
        symbol: `${transformedUpperTrigram.symbol}${transformedLowerTrigram.symbol}`,
        lines: transformedLines,
        upper: transformedUpperTrigram,
        lower: transformedLowerTrigram,
      },
    },
    changingLine,
    tiGua: { role: tiRole, trigram: tiTrigram },
    yongGua: { role: yongRole, trigram: yongTrigram },
    relationship: {
      type: relationResult.type,
      conclusion: relationResult.conclusion,
      auspiciousness: relationResult.auspiciousness,
      chineseInterpretation: relationResult.chineseInterpretation,
    },
  }
}

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/**
 * 获取干支时间
 */
export function getGanzhiTime(timeMs: number): string {
  const d = new Date(timeMs)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const date = d.getDate()

  let yearGanzhiIdx = (year - 4) % 60
  if (yearGanzhiIdx < 0) yearGanzhiIdx += 60
  const yearStem = STEMS[yearGanzhiIdx % 10]
  const yearBranch = BRANCHES[yearGanzhiIdx % 12]

  const localTimeMs = timeMs - d.getTimezoneOffset() * 60000
  const localDaysSinceEpoch = Math.floor(localTimeMs / (1000 * 60 * 60 * 24))
  let dayGanzhiIdx = (localDaysSinceEpoch + 29) % 60
  if (dayGanzhiIdx < 0) dayGanzhiIdx += 60
  const dayStem = STEMS[dayGanzhiIdx % 10]
  const dayBranch = BRANCHES[dayGanzhiIdx % 12]

  let monthStemStart = 0
  const yStemIdx = yearGanzhiIdx % 10
  if (yStemIdx === 0 || yStemIdx === 5) monthStemStart = 2
  else if (yStemIdx === 1 || yStemIdx === 6) monthStemStart = 4
  else if (yStemIdx === 2 || yStemIdx === 7) monthStemStart = 6
  else if (yStemIdx === 3 || yStemIdx === 8) monthStemStart = 8
  else if (yStemIdx === 4 || yStemIdx === 9) monthStemStart = 0

  const monthBranchIdx = (month === 12) ? 0 : (month === 1) ? 1 : month
  const monthStemIdx = (monthStemStart + (monthBranchIdx >= 2 ? monthBranchIdx - 2 : monthBranchIdx + 10)) % 10

  return `${yearStem}${yearBranch}年 ${STEMS[monthStemIdx]}${BRANCHES[monthBranchIdx]}月 ${dayStem}${dayBranch}日`
}

/**
 * San-Cai 置信度计算
 */
export function calculateSanCaiConfidence(
  tiElement: string,
  monthBranch: string,
  lat: number,
  lng: number,
  velocities: number[],
): number {
  const BRANCH_ELEMENTS: Record<string, string> = {
    子: 'Water', 亥: 'Water', 寅: 'Wood', 卯: 'Wood',
    巳: 'Fire', 午: 'Fire', 丑: 'Earth', 辰: 'Earth', 未: 'Earth', 戌: 'Earth',
  }

  const wuxingAffinity: Record<string, Record<string, number>> = {
    Fire:  { Wood: 1.0, Fire: 1.0, Earth: 0.6, Metal: 0.3, Water: 0.1 },
    Wood:  { Water: 1.0, Wood: 1.0, Fire: 0.6, Earth: 0.3, Metal: 0.1 },
    Water: { Metal: 1.0, Water: 1.0, Wood: 0.6, Fire: 0.3, Earth: 0.1 },
    Metal: { Earth: 1.0, Metal: 1.0, Water: 0.6, Wood: 0.3, Fire: 0.1 },
    Earth: { Fire: 1.0, Earth: 1.0, Metal: 0.6, Water: 0.3, Wood: 0.1 },
  }

  const month_element = BRANCH_ELEMENTS[monthBranch] || 'Earth'
  const season_factor = wuxingAffinity[month_element]?.[tiElement] ?? 0.5

  const originLat = 31.23
  const originLng = 121.47
  const dy = lat - originLat
  const dx = lng - originLng

  let angleDeg = 90
  if (dx !== 0 || dy !== 0) {
    angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI
    if (angleDeg < 0) angleDeg += 360
  }

  let geo_direction = 'East'
  if (angleDeg >= 337.5 || angleDeg < 22.5) geo_direction = 'North'
  else if (angleDeg >= 22.5 && angleDeg < 67.5) geo_direction = 'NorthEast'
  else if (angleDeg >= 67.5 && angleDeg < 112.5) geo_direction = 'East'
  else if (angleDeg >= 112.5 && angleDeg < 157.5) geo_direction = 'SouthEast'
  else if (angleDeg >= 157.5 && angleDeg < 202.5) geo_direction = 'South'
  else if (angleDeg >= 202.5 && angleDeg < 247.5) geo_direction = 'SouthWest'
  else if (angleDeg >= 247.5 && angleDeg < 292.5) geo_direction = 'West'
  else if (angleDeg >= 292.5 && angleDeg < 337.5) geo_direction = 'NorthWest'

  const DIRECTION_ELEMENTS: Record<string, string> = {
    North: 'Water', NorthEast: 'Earth', East: 'Wood', SouthEast: 'Wood',
    South: 'Fire', SouthWest: 'Earth', West: 'Metal', NorthWest: 'Metal',
  }

  const geo_element = DIRECTION_ELEMENTS[geo_direction] || 'Earth'
  const produces: Record<string, string> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' }
  const controls: Record<string, string> = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' }

  let G = 0.5
  if (geo_element === tiElement || produces[geo_element] === tiElement) G = 1.0
  else if (controls[geo_element] === tiElement) G = 0.15
  else if (produces[tiElement] === geo_element) G = 0.3
  else if (controls[tiElement] === geo_element) G = 0.5

  let S = 0.85
  if (velocities.length > 5) {
    const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
    S = Math.max(0.5, Math.min(1.0, 1.0 - cv * 0.35))
  } else {
    const sumVel = velocities.reduce((sum, v) => sum + v, 0)
    S = Math.max(0.65, Math.min(0.98, 0.75 + (sumVel % 0.23)))
  }

  return parseFloat((60.0 + season_factor * 10.0 + G * 10.0 + S * 19.99).toFixed(2))
}
