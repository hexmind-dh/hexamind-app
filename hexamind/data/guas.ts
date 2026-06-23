import type { Trigram, Hexagram } from '@/types'

export const TRIGRAMS: Record<number, Trigram> = {
  1: { id: 1, name: '乾', pinyin: 'Qian', english: 'Heaven', element: 'Metal', symbol: '☰', lines: [1, 1, 1] },
  2: { id: 2, name: '兑', pinyin: 'Dui', english: 'Lake', element: 'Metal', symbol: '☱', lines: [1, 1, 0] },
  3: { id: 3, name: '离', pinyin: 'Li', english: 'Fire', element: 'Fire', symbol: '☲', lines: [1, 0, 1] },
  4: { id: 4, name: '震', pinyin: 'Zhen', english: 'Thunder', element: 'Wood', symbol: '☳', lines: [1, 0, 0] },
  5: { id: 5, name: '巽', pinyin: 'Xun', english: 'Wind', element: 'Wood', symbol: '☴', lines: [0, 1, 1] },
  6: { id: 6, name: '坎', pinyin: 'Kan', english: 'Water', element: 'Water', symbol: '☵', lines: [0, 1, 0] },
  7: { id: 7, name: '艮', pinyin: 'Gen', english: 'Mountain', element: 'Earth', symbol: '☶', lines: [0, 0, 1] },
  8: { id: 8, name: '坤', pinyin: 'Kun', english: 'Earth', element: 'Earth', symbol: '☷', lines: [0, 0, 0] },
}

export function lookupTrigramByLines(lines: number[]): Trigram {
  const binaryKey = lines[0] * 1 + lines[1] * 2 + lines[2] * 4
  const found = Object.values(TRIGRAMS).find(
    (t) => t.lines[0] * 1 + t.lines[1] * 2 + t.lines[2] * 4 === binaryKey,
  )
  return found || TRIGRAMS[8]
}

export const HEXAGRAMS: Record<string, Hexagram> = {
  '1_1': {
    upper: 1, lower: 1, name: '乾为天', english: 'The Creative Heaven', pinyin: 'Qian Wei Tian',
    description: 'Great success, perseverance brings progress and power.',
    judgement: '元，亨，利，贞。The Creative brings about sublime success.',
  },
  '1_2': {
    upper: 1, lower: 2, name: '天泽履', english: 'Treading Conduct', pinyin: 'Tian Ze Lv',
    description: 'Treading upon the tail of the tiger. Progress with careful attention.',
    judgement: '履虎尾，不咥人，亨。',
  },
  '1_3': {
    upper: 1, lower: 3, name: '天火同人', english: 'Fellowship with Men', pinyin: 'Tian Huo Tong Ren',
    description: 'Unity and broad collaboration. Fellowship brings supreme success.',
    judgement: '同人于野，亨。利涉大川，利君子贞。',
  },
  '1_4': {
    upper: 1, lower: 4, name: '天雷无妄', english: 'Innocence / Unexpectancy', pinyin: 'Tian Lei Wu Wang',
    description: 'Act from truth, maintain simplicity.',
    judgement: '无妄，元，亨，利，贞。',
  },
  '1_5': {
    upper: 1, lower: 5, name: '天风姤', english: 'Coming to Meet', pinyin: 'Tian Feng Gou',
    description: 'A sudden rise of a powerful undercurrent.',
    judgement: '姤，女壮，勿用取女。',
  },
  '1_6': {
    upper: 1, lower: 6, name: '天水讼', english: 'Conflict', pinyin: 'Tian Shui Song',
    description: 'Beware of disputes. Seek mediation.',
    judgement: '讼，有孚窒惕，中吉。终凶。',
  },
  '1_7': {
    upper: 1, lower: 7, name: '天山遁', english: 'Retreat', pinyin: 'Tian Shan Dun',
    description: 'A strategic retreat.',
    judgement: '遁，亨，小利贞。',
  },
  '1_8': {
    upper: 1, lower: 8, name: '天地否', english: 'Standstill', pinyin: 'Tian Di Pi',
    description: 'Stagnant energy. Hold ground patiently.',
    judgement: '否之匪人，不利君子贞，大往小来。',
  },
  '2_1': {
    upper: 2, lower: 1, name: '泽天夬', english: 'Breakthrough', pinyin: 'Ze Tian Guai',
    description: 'Resoluteness, sweeping away obstacles.',
    judgement: '夬，扬于王庭，孚号，有厉。',
  },
  '2_2': {
    upper: 2, lower: 2, name: '兑为泽', english: 'The Joyous Lake', pinyin: 'Dui Wei Ze',
    description: 'Shared pleasure, rich interaction.',
    judgement: '兑，亨，利贞。',
  },
  '2_3': {
    upper: 2, lower: 3, name: '泽火革', english: 'Revolution', pinyin: 'Ze Huo Ge',
    description: 'Transformation and structural overhaul.',
    judgement: '革，己日乃孚，元亨利贞，悔亡。',
  },
  '2_4': {
    upper: 2, lower: 4, name: '泽雷随', english: 'Following', pinyin: 'Ze Lei Sui',
    description: 'Adaptation to flow.',
    judgement: '随，元亨利贞，无咎。',
  },
  '2_5': {
    upper: 2, lower: 5, name: '泽风大过', english: 'Excess', pinyin: 'Ze Feng Da Guo',
    description: 'Heavy pressure, structural overload.',
    judgement: '大过，栋桡，利有攸往，亨。',
  },
  '2_6': {
    upper: 2, lower: 6, name: '泽水困', english: 'Oppression', pinyin: 'Ze Shui Kun',
    description: 'Entrapment, resource dry-up.',
    judgement: '困，亨，贞，大人吉，无咎。',
  },
  '2_7': {
    upper: 2, lower: 7, name: '泽山咸', english: 'Influence', pinyin: 'Ze Shan Xian',
    description: 'Spontaneous resonance.',
    judgement: '咸，亨，利贞，取女吉。',
  },
  '2_8': {
    upper: 2, lower: 8, name: '泽地萃', english: 'Gathering Together', pinyin: 'Ze Di Cui',
    description: 'Gathering of experts, capital.',
    judgement: '萃，亨。王假有庙，利见大人。',
  },
  '3_1': {
    upper: 3, lower: 1, name: '火天大有', english: 'Possession in Great Measure', pinyin: 'Huo Tian Da You',
    description: 'Supreme wealth and influence.',
    judgement: '大有，元亨。',
  },
  '3_2': {
    upper: 3, lower: 2, name: '火泽睽', english: 'Opposition', pinyin: 'Huo Ze Kui',
    description: 'Divergence of opinions.',
    judgement: '睽，小事吉。',
  },
  '3_3': {
    upper: 3, lower: 3, name: '离为火', english: 'The Clinging Fire', pinyin: 'Li Wei Huo',
    description: 'Dynamic illumination and networks.',
    judgement: '离，利贞，亨。畜牝牛，吉。',
  },
  '3_4': {
    upper: 3, lower: 4, name: '火雷噬嗑', english: 'Biting Through', pinyin: 'Huo Lei Shi He',
    description: 'Direct obstacles must be forcibly removed.',
    judgement: '噬嗑，亨。利用狱。',
  },
  '3_5': {
    upper: 3, lower: 5, name: '火风鼎', english: 'The Cauldron', pinyin: 'Huo Feng Ding',
    description: 'Innovation and creation.',
    judgement: '鼎，元吉，亨。',
  },
  '3_6': {
    upper: 3, lower: 6, name: '火水未济', english: 'Before Completion', pinyin: 'Huo Shui Wei Ji',
    description: 'Transition is near but incomplete.',
    judgement: '未济，亨，小狐汔济，濡其尾，无攸利。',
  },
  '3_7': {
    upper: 3, lower: 7, name: '火山旅', english: 'The Wanderer', pinyin: 'Huo Shan Lv',
    description: 'Transitory status, high volatility.',
    judgement: '旅，小亨，旅贞吉。',
  },
  '3_8': {
    upper: 3, lower: 8, name: '火地晋', english: 'Progress', pinyin: 'Huo Di Jin',
    description: 'Quick advancement and promotion.',
    judgement: '晋，康侯用锡马蕃庶，昼日三接。',
  },
  '4_1': {
    upper: 4, lower: 1, name: '雷天大壮', english: 'Power of the Great', pinyin: 'Lei Tian Da Zhuang',
    description: 'High force and heavy momentum.',
    judgement: '大壮，利贞。',
  },
  '4_2': {
    upper: 4, lower: 2, name: '雷泽归妹', english: 'The Marrying Maiden', pinyin: 'Lei Ze Gui Mei',
    description: 'Transient role, hasty engagement.',
    judgement: '归妹，征凶，无攸利。',
  },
  '4_3': {
    upper: 4, lower: 3, name: '雷火丰', english: 'Abundance', pinyin: 'Lei Huo Feng',
    description: 'Absolute peak, maximum prosperity.',
    judgement: '丰，亨，王假之，勿忧，宜日中。',
  },
  '4_4': {
    upper: 4, lower: 4, name: '震为雷', english: 'The Arousing Thunder', pinyin: 'Zhen Wei Lei',
    description: 'Shock, sudden alarm, shake-ups.',
    judgement: '震，亨。震来虩虩，笑言哑哑。',
  },
  '4_5': {
    upper: 4, lower: 5, name: '雷风恒', english: 'Duration', pinyin: 'Lei Feng Heng',
    description: 'Continuous cycles of natural harmony.',
    judgement: '恒，亨，无咎，利贞，利有攸往。',
  },
  '4_6': {
    upper: 4, lower: 6, name: '雷水解', english: 'Deliverance', pinyin: 'Lei Shui Xie',
    description: 'Release of tension, solving obstacles.',
    judgement: '解，利西南，无所往，其来复吉。',
  },
  '4_7': {
    upper: 4, lower: 7, name: '雷山小过', english: 'Preponderance of the Small', pinyin: 'Lei Shan Xiao Guo',
    description: 'Focus on details.',
    judgement: '小过，亨，利贞。可小事，不可大事。',
  },
  '4_8': {
    upper: 4, lower: 8, name: '雷地豫', english: 'Enthusiasm', pinyin: 'Lei Di Yu',
    description: 'Joy, foresight, proper preparation.',
    judgement: '豫，利建侯行师。',
  },
  '5_1': {
    upper: 5, lower: 1, name: '风天小畜', english: 'Small Taming', pinyin: 'Feng Tian Xiao Xu',
    description: 'Small accumulation, soft power.',
    judgement: '小畜，亨。密云不雨，自我西郊。',
  },
  '5_2': {
    upper: 5, lower: 2, name: '风泽中孚', english: 'Inner Truth', pinyin: 'Feng Ze Zhong Fu',
    description: 'Inner truth, perfect sincerity.',
    judgement: '中孚，豚鱼吉，利涉大川，利贞。',
  },
  '5_3': {
    upper: 5, lower: 3, name: '风火家人', english: 'The Family', pinyin: 'Feng Huo Jia Ren',
    description: 'Internal structural alignment.',
    judgement: '家人，利女贞。',
  },
  '5_4': {
    upper: 5, lower: 4, name: '风雷益', english: 'Increase', pinyin: 'Feng Lei Yi',
    description: 'Accelerated expansion.',
    judgement: '益，利有攸往，利涉大川。',
  },
  '5_5': {
    upper: 5, lower: 5, name: '巽为风', english: 'The Gentle Wind', pinyin: 'Xun Wei Feng',
    description: 'Penetrating action, gentle persistence.',
    judgement: '巽，小亨，利有攸往，利见大人。',
  },
  '5_6': {
    upper: 5, lower: 6, name: '风水涣', english: 'Dispersion', pinyin: 'Feng Shui Huan',
    description: 'Breaking down blockages.',
    judgement: '涣，亨。王假有庙，利涉大川，利贞。',
  },
  '5_7': {
    upper: 5, lower: 7, name: '风山渐', english: 'Development', pinyin: 'Feng Shan Jian',
    description: 'Gradual, organic development.',
    judgement: '渐，女归吉，利贞。',
  },
  '5_8': {
    upper: 5, lower: 8, name: '风地观', english: 'Contemplation', pinyin: 'Feng Di Guan',
    description: 'Inspection, research, high-level analysis.',
    judgement: '观，盥而不荐，有孚顒若。',
  },
  '6_1': {
    upper: 6, lower: 1, name: '水天需', english: 'Waiting', pinyin: 'Shui Tian Xu',
    description: 'Strategic waiting.',
    judgement: '需，有孚，光亨，贞吉。利涉大川。',
  },
  '6_2': {
    upper: 6, lower: 2, name: '水泽节', english: 'Limitation', pinyin: 'Shui Ze Jie',
    description: 'Containment, regular budgeting.',
    judgement: '节，亨。苦节不可贞。',
  },
  '6_3': {
    upper: 6, lower: 3, name: '水火既济', english: 'After Completion', pinyin: 'Shui Huo Ji Ji',
    description: 'Perfectly balanced but watch for decline.',
    judgement: '既济，亨，小利贞。初吉，终乱。',
  },
  '6_4': {
    upper: 6, lower: 4, name: '水雷屯', english: 'Difficulty at the Beginning', pinyin: 'Shui Lei Tun',
    description: 'Growth is hard in early formation.',
    judgement: '屯，元亨利贞，勿用有攸往，利建侯。',
  },
  '6_5': {
    upper: 6, lower: 5, name: '水风井', english: 'The Well', pinyin: 'Shui Feng Jing',
    description: 'Core value assets, vital knowledge.',
    judgement: '井，改邑不改井，无丧无得。',
  },
  '6_6': {
    upper: 6, lower: 6, name: '坎为水', english: 'The Abyssal Water', pinyin: 'Kan Wei Shui',
    description: 'High risk, extreme volatility.',
    judgement: '坎，维心亨，行有尚。',
  },
  '6_7': {
    upper: 6, lower: 7, name: '水山蹇', english: 'Obstruction', pinyin: 'Shui Shan Jian',
    description: 'Forward path blocked.',
    judgement: '蹇，利西南，不利东北。',
  },
  '6_8': {
    upper: 6, lower: 8, name: '水地比', english: 'Holding Together', pinyin: 'Shui Di Bi',
    description: 'Close alliance, mutual trust.',
    judgement: '比，吉。原筮元永贞，无咎。',
  },
  '7_1': {
    upper: 7, lower: 1, name: '山天大畜', english: 'Great Taming', pinyin: 'Shan Tian Da Xu',
    description: 'Huge storage of resource.',
    judgement: '大畜，利贞。不家食吉，利涉大川。',
  },
  '7_2': {
    upper: 7, lower: 2, name: '山泽损', english: 'Decrease', pinyin: 'Shan Ze Sun',
    description: 'Initial investment cost.',
    judgement: '损，有孚，元吉，无咎，可贞。',
  },
  '7_3': {
    upper: 7, lower: 3, name: '山火贲', english: 'Grace', pinyin: 'Shan Huo Bi',
    description: 'Aesthetic form, branding.',
    judgement: '贲，亨。小利有攸往。',
  },
  '7_4': {
    upper: 7, lower: 4, name: '山雷颐', english: 'Nourishment', pinyin: 'Shan Lei Yi',
    description: 'Focus on nourishment of talent.',
    judgement: '颐，贞吉。观颐，自求口实。',
  },
  '7_5': {
    upper: 7, lower: 5, name: '山风蛊', english: 'Decay', pinyin: 'Shan Feng Gu',
    description: 'Internal decay, time to cleanse.',
    judgement: '蛊，元亨，利涉大川。先甲三日，后甲三日。',
  },
  '7_6': {
    upper: 7, lower: 6, name: '山水蒙', english: 'Youthful Folly', pinyin: 'Shan Shui Meng',
    description: 'Immature stage, requiring training.',
    judgement: '蒙，亨。匪我求童蒙，童蒙求我。',
  },
  '7_7': {
    upper: 7, lower: 7, name: '艮为山', english: 'Keeping Still', pinyin: 'Gen Wei Shan',
    description: 'Stop, keep still. Restrict actions.',
    judgement: '艮，其背不获其身，行其庭不见其人，无咎。',
  },
  '7_8': {
    upper: 7, lower: 8, name: '山地剥', english: 'Splitting Apart', pinyin: 'Shan Di Bo',
    description: 'Strip-down, systematic collapse.',
    judgement: '剥，不利有攸往。',
  },
  '8_1': {
    upper: 8, lower: 1, name: '地天泰', english: 'Peace', pinyin: 'Di Tian Tai',
    description: 'Splendid communication, massive luck.',
    judgement: '泰，小往大来，吉，亨。',
  },
  '8_2': {
    upper: 8, lower: 2, name: '地泽临', english: 'Approach', pinyin: 'Di Ze Lin',
    description: 'Approach of luck, scaling up.',
    judgement: '临，元亨利贞。至于八月有凶。',
  },
  '8_3': {
    upper: 8, lower: 3, name: '地火明夷', english: 'Darkening of the Light', pinyin: 'Di Huo Ming Yi',
    description: 'Obscurity, intelligence hiding.',
    judgement: '明夷，利艰贞。',
  },
  '8_4': {
    upper: 8, lower: 4, name: '地雷复', english: 'Return', pinyin: 'Di Lei Fu',
    description: 'Rebirth of fire, pivot point.',
    judgement: '复，亨。出入无疾，朋来无咎。',
  },
  '8_5': {
    upper: 8, lower: 5, name: '地风升', english: 'Ascending', pinyin: 'Di Feng Sheng',
    description: 'Gradual, unstoppable upward evolution.',
    judgement: '升，元亨，用见大人，勿忧，南征吉。',
  },
  '8_6': {
    upper: 8, lower: 6, name: '地水师', english: 'The Army', pinyin: 'Di Shui Shi',
    description: 'Mobilizing resources, team discipline.',
    judgement: '师，贞，丈人吉，无咎。',
  },
  '8_7': {
    upper: 8, lower: 7, name: '地山谦', english: 'Modesty', pinyin: 'Di Shan Qian',
    description: 'Modesty shines bright.',
    judgement: '谦，亨，君子有终。',
  },
  '8_8': {
    upper: 8, lower: 8, name: '坤为地', english: 'The Receptive Earth', pinyin: 'Kun Wei Di',
    description: 'Receptivity, supportiveness.',
    judgement: '坤，元亨，利牝马之贞。',
  },
}
