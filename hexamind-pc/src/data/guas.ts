import { Trigram, Hexagram } from "../types";

export const TRIGRAMS: Record<number, Trigram> = {
  1: { id: 1, name: "乾", pinyin: "Qian", english: "Heaven", element: "Metal", symbol: "☰", lines: [1, 1, 1] },
  2: { id: 2, name: "兑", pinyin: "Dui", english: "Lake", element: "Metal", symbol: "☱", lines: [1, 1, 0] },
  3: { id: 3, name: "离", pinyin: "Li", english: "Fire", element: "Fire", symbol: "☲", lines: [1, 0, 1] },
  4: { id: 4, name: "震", pinyin: "Zhen", english: "Thunder", element: "Wood", symbol: "☳", lines: [1, 0, 0] },
  5: { id: 5, name: "巽", pinyin: "Xun", english: "Wind", element: "Wood", symbol: "☴", lines: [0, 1, 1] },
  6: { id: 6, name: "坎", pinyin: "Kan", english: "Water", element: "Water", symbol: "☵", lines: [0, 1, 0] },
  7: { id: 7, name: "艮", pinyin: "Gen", english: "Mountain", element: "Earth", symbol: "☶", lines: [0, 0, 1] },
  8: { id: 8, name: "坤", pinyin: "Kun", english: "Earth", element: "Earth", symbol: "☷", lines: [0, 0, 0] }
};

// Help map lines back to trigram id
export function lookupTrigramByLines(lines: number[]): Trigram {
  const binaryKey = lines[0] * 1 + lines[1] * 2 + lines[2] * 4;
  const found = Object.values(TRIGRAMS).find(
    t => (t.lines[0] * 1 + t.lines[1] * 2 + t.lines[2] * 4) === binaryKey
  );
  return found || TRIGRAMS[8]; // Fallback to Kun (Earth)
}

// Map of "${upper}_${lower}" to the 64 classical Gua names and short properties
export const HEXAGRAMS: Record<string, Hexagram> = {
  "1_1": {
    upper: 1, lower: 1, name: "乾为天", english: "The Creative Heaven", pinyin: "Qian Wei Tian",
    description: "Great success, perseverance brings progress and power. Sublime, central, and active cosmic energy.",
    judgement: "元，亨，利，贞。The Creative brings about sublime success, furthering through perseverance."
  },
  "1_2": {
    upper: 1, lower: 2, name: "天泽履", english: "Treading Conduct", pinyin: "Tian Ze Lv",
    description: "Treading upon the tail of the tiger. It does not bite the man. Progress with careful attention and proper conduct.",
    judgement: "履虎尾，不咥人，亨。Treading on the tail of the tiger. Great care is required."
  },
  "1_3": {
    upper: 1, lower: 3, name: "天火同人", english: "Fellowship with Men", pinyin: "Tian Huo Tong Ren",
    description: "Unity and broad collaboration. Fellowship in the open brings supreme success and smooth transit across obstacles.",
    judgement: "同人于野，亨。利涉大川，利君子贞。Fellowship with men in the open. Sublime success."
  },
  "1_4": {
    upper: 1, lower: 4, name: "天雷无妄", english: "Innocence / Unexpectancy", pinyin: "Tian Lei Wu Wang",
    description: "Act from truth, maintain simplicity. Unexpected turns might happen, but remaining innocent protects from blame.",
    judgement: "无妄，元，亨，利，贞。其匪正有眚，不利有攸往。Innocence leads to supreme success if right action is kept."
  },
  "1_5": {
    upper: 1, lower: 5, name: "天风姤", english: "Coming to Meet / Encounter", pinyin: "Tian Feng Gou",
    description: "A sudden rise of a powerful undercurrent. Do not underestimate low-level shifts or dynamic partnerships.",
    judgement: "姤，女壮，勿用取女。Encounter. One should not marry a bold and dominating partner."
  },
  "1_6": {
    upper: 1, lower: 6, name: "天水讼", english: "Conflict / Argument", pinyin: "Tian Shui Song",
    description: "Beware of disputes. Obstruction mid-way. Seek mediation and stop early, do not push conflict to the absolute end.",
    judgement: "讼，有孚窒惕，中吉。终凶。利见大人，不利涉大川。Conflict. Obstruction midway. Seek wise counsel."
  },
  "1_7": {
    upper: 1, lower: 7, name: "天山遁", english: "Retreat / Withdrawal", pinyin: "Tian Shan Dun",
    description: "A strategic retreat. Small people are rising, so outstanding projects or actions must be protected in seclusion.",
    judgement: "遁，亨，小利贞。Retreat. Success lies in proper withdrawal and reserving forces."
  },
  "1_8": {
    upper: 1, lower: 8, name: "天地否", english: "Standstill / Obstruction", pinyin: "Tian Di Pi",
    description: "Stagnant energy. Heaven moves up, Earth sinks down; they do not meet. Communication blocks, hold ground patiently.",
    judgement: "否之匪人，不利君子贞，大往小来。Standstill. Misfortune for the superior person, but maintain outer alignment."
  },
  "2_1": {
    upper: 2, lower: 1, name: "泽天夬", english: "Breakthrough / Resoluteness", pinyin: "Ze Tian Guai",
    description: "Resoluteness, sweeping away obstacles. One must make the facts known with resolution and absolute trust.",
    judgement: "夬，扬于王庭，孚号，有厉。告自邑，不利即戎，利有攸往。Breakthrough! Proclaim resolution with calm wisdom."
  },
  "2_2": {
    upper: 2, lower: 2, name: "兑为泽", english: "The Joyous Lake", pinyin: "Dui Wei Ze",
    description: "Double lake. Shared pleasure, rich interaction. True joy originates from inner integrity and smooth communication.",
    judgement: "兑，亨，利贞。Joyous interaction brings success, benefit in steadfastness."
  },
  "2_3": {
    upper: 2, lower: 3, name: "泽火革", english: "Revolution / Change", pinyin: "Ze Huo Ge",
    description: "Transformation and structural overhaul. Once the cycle matures, confidence is established, and reform succeeds.",
    judgement: "革，己日乃孚，元亨利贞，悔亡。Revolution. When the proper time comes, full belief is won."
  },
  "2_4": {
    upper: 2, lower: 4, name: "泽雷随", english: "Following/Adaptation", pinyin: "Ze Lei Sui",
    description: "Adaptation to flow. In order to lead, one must first follow the natural rhythmic cycle of external factors.",
    judgement: "随，元亨利贞，无咎。Following has supreme success. Perseverance brings no blame."
  },
  "2_5": {
    upper: 2, lower: 5, name: "泽风大过", english: "Excess / Preponderance of the Great", pinyin: "Ze Feng Da Guo",
    description: "The ridgepole sags under massive weight. Heavy pressure, structural overload. Bold, decisive action is needed.",
    judgement: "大过，栋桡，利有攸往，亨。Preponderance of the Great. Ridgepole sags. Desirable to go anywhere."
  },
  "2_6": {
    upper: 2, lower: 6, name: "泽水困", english: "Oppression / Exhaustion", pinyin: "Ze Shui Kun",
    description: "Water has drained from the lake. Entrapment, resource dry-up. Silent endurance and preserving words are required.",
    judgement: "困，亨，贞，大人吉，无咎。有言不信。Oppression. Success is forged through pure inner character and patience."
  },
  "2_7": {
    upper: 2, lower: 7, name: "泽山咸", english: "Influence / Mutual Attraction", pinyin: "Ze Shan Xian",
    description: "Young mountain below quiet lake. Spontaneous resonance, attractive marketing partnerships, or deep empathy.",
    judgement: "咸，亨，利贞，取女吉。Influence. Resonance and open minds yield stellar results."
  },
  "2_8": {
    upper: 2, lower: 8, name: "泽地萃", english: "Gathering Together", pinyin: "Ze Di Cui",
    description: "Lake over Earth. Gathering of experts, capital, or materials. Success in collective efforts and major sacrifices.",
    judgement: "萃，亨。王假有庙，利见大人，亨，利贞。Gathering. Leaders direct capital and human alignment."
  },
  "3_1": {
    upper: 3, lower: 1, name: "火天大有", english: "Possession in Great Measure", pinyin: "Huo Tian Da You",
    description: "Sun high in the sky. Supreme wealth, influence, and widespread command. Share success generously to maintain luck.",
    judgement: "大有，元亨。Possession of substantial abundance. Creative light shines over all sectors."
  },
  "3_2": {
    upper: 3, lower: 2, name: "火泽睽", english: "Opposition / Polarization", pinyin: "Huo Ze Kui",
    description: "Fire burns upward, Lake flows downward. Divergence of opinions, polarization. Seek harmony on small matters.",
    judgement: "睽，小事吉。Opposition. Small matters can still succeed through dynamic flexibility."
  },
  "3_3": {
    upper: 3, lower: 3, name: "离为火", english: "The Clinging Fire", pinyin: "Li Wei Huo",
    description: "Double fire. Dynamic illumination, networks, clarity, or rapid burn-rate. Rely on internal support to stay bright.",
    judgement: "离，利贞，亨。畜牝牛，吉。Clinging brilliance. Success relies on solid dependency and balance."
  },
  "3_4": {
    upper: 3, lower: 4, name: "火雷噬嗑", english: "Biting Through / Prosecution", pinyin: "Huo Lei Shi He",
    description: "Energy blocked. Direct obstacles must be forcibly encountered and bitten through with strict regulations.",
    judgement: "噬嗑，亨。利用狱。Obstacles in communication. Decisive legal or administrative split is beneficial."
  },
  "3_5": {
    upper: 3, lower: 5, name: "火风鼎", english: "The Caluldron / Cooking Vessel", pinyin: "Huo Feng Ding",
    description: "Wind feeds fire. Innovation, creation, nurturing resources, and deep paradigm shifts. High success for creators.",
    judgement: "鼎，元吉，亨。The Caldron. Supreme good fortune, cooking new solutions."
  },
  "3_6": {
    upper: 3, lower: 6, name: "火水未济", english: "Before Completion", pinyin: "Huo Shui Wei Ji",
    description: "Fire over water. Elements polar; transition is near but incomplete. Walk carefully in the final stage to avoid slips.",
    judgement: "未济，亨，小狐汔济，濡其尾，无攸利。Before completion. Walk with caution like a fox crossing ice."
  },
  "3_7": {
    upper: 3, lower: 7, name: "火山旅", english: "The Wanderer", pinyin: "Huo Shan Lv",
    description: "Fire on mountain. Transitory status, moving quickly, traveling, or high volatility. Remain adaptable and reserved.",
    judgement: "旅，小亨，旅贞吉。The Wanderer. Success in dynamic movement and maintaining travel safety."
  },
  "3_8": {
    upper: 3, lower: 8, name: "火地晋", english: "Progress / Advancement", pinyin: "Huo Di Jin",
    description: "Sun rising above Earth. Quick advancement, promotion, clear vision, and warm reception of resources.",
    judgement: "晋，康侯用锡马蕃庶，昼日三接。Rapid progress. Excellent alignment with decision makers."
  },
  "4_1": {
    upper: 4, lower: 1, name: "雷天大壮", english: "Power of the Great / Momentum", pinyin: "Lei Tian Da Zhuang",
    description: "Thunder in the heavens. High force and heavy momentum. Don't push aggressively to avoid getting horns entangled.",
    judgement: "大壮，利贞。Great strength. Beware of blind pushing; success relies on inner timing."
  },
  "4_2": {
    upper: 4, lower: 2, name: "雷泽归妹", english: "The Marrying Maiden", pinyin: "Lei Ze Gui Mei",
    description: "Thunder over lake. Transient role, hasty engagement, or premature contract launch. Deep risks if principles ignored.",
    judgement: "归妹，征凶，无攸利。Premature structural entry. Pushing forward boldly yields dispute."
  },
  "4_3": {
    upper: 4, lower: 3, name: "雷火丰", english: "Abundance / Full Peak", pinyin: "Lei Huo Feng",
    description: "Midday sun with lightning. Absolute peak, maximum prosperity. Prepare for eventual changes with generosity.",
    judgement: "丰，亨，王假之，勿忧，宜日中。Massive material zoom-in. Do not let peak cause subsequent negligence."
  },
  "4_4": {
    upper: 4, lower: 4, name: "震为雷", english: "The Arousing Thunder", pinyin: "Zhen Wei Lei",
    description: "Shock, sudden alarm, shake-ups. The shock terrifies, but remaining collected ensures no loss of treasure.",
    judgement: "震，亨。震来虩虩，笑言哑哑。Shock and sudden alarms. Maintain cool discipline and composure."
  },
  "4_5": {
    upper: 4, lower: 5, name: "雷风恒", english: "Duration / Persistence", pinyin: "Lei Feng Heng",
    description: "Thunder and wind. Continuous cycles of natural harmony. Endurance, maintaining reliable protocols yields growth.",
    judgement: "恒，亨，无咎，利贞，利有攸往。Duration and stable rhythm. Steady persistent direction wins out."
  },
  "4_6": {
    upper: 4, lower: 6, name: "雷水解", english: "Deliverance / Relief", pinyin: "Lei Shui Xie",
    description: "Thunder clears rain. Release of tension, solving obstacles. Act quickly to resume normalcy and forgive debts.",
    judgement: "解，利西南，无所往，其来复吉。有攸往，夙吉。Deliverance. Quick movement restores status."
  },
  "4_7": {
    upper: 4, lower: 7, name: "雷山小过", english: "Preponderance of the Small", pinyin: "Lei Shan Xiao Guo",
    description: "Thunder on mountain. Focus on details, fly low like a bird. Do not attempt giant high-altitude launches right now.",
    judgement: "小过，亨，利贞。可小事，不可大事。Small items succeed. Fly low and handle tiny details carefully."
  },
  "4_8": {
    upper: 4, lower: 8, name: "雷地豫", english: "Enthusiasm / Preparation", pinyin: "Lei Di Yu",
    description: "Thunder emerging from Earth. Joy, foresight, proper preparation, and cultural inspiration. Perfect for campaign launches.",
    judgement: "豫，利建侯行师。Enthusiasm. Direct the momentum to set up key milestones and execute campaigns."
  },
  "5_1": {
    upper: 5, lower: 1, name: "风天小畜", english: "Small Taming / Accumulation", pinyin: "Feng Tian Xiao Xu",
    description: "Wind sweeping clouds but no rain yet. Small accumulation, soft power. Focus on gentle persuasiveness.",
    judgement: "小畜，亨。密云不雨，自我西郊。Dense clouds, no rain yet. Slowly refine parameters and build cache."
  },
  "5_2": {
    upper: 5, lower: 2, name: "风泽中孚", english: "Inner Truth / Integrity", pinyin: "Feng Ze Zhong Fu",
    description: "Wind on lake. Inner truth, perfect sincerity. Highly beneficial to establish alignment with customers & partners.",
    judgement: "中孚，豚鱼吉，利涉大川，利贞。Inner sincerity influences even stubborn markets. Proceed across gaps."
  },
  "5_3": {
    upper: 5, lower: 3, name: "风火家人", english: "The Family / Team Alignment", pinyin: "Feng Huo Jia Ren",
    description: "Fire feeds wind. Internal structural alignment, clean corporate governance, solid back office. Consolidate base.",
    judgement: "家人，利女贞。Home base stability. Keep inside communications clear and supportive."
  },
  "5_4": {
    upper: 5, lower: 4, name: "风雷益", english: "Increase / Growth", pinyin: "Feng Lei Yi",
    description: "Wind and thunder. Accelerated expand-up, structural optimization. Time to invest, donate, or scale aggressively.",
    judgement: "益，利有攸往，利涉大川。Increase. Dynamic wind-boost. High advantage in aggressive launches."
  },
  "5_5": {
    upper: 5, lower: 5, name: "巽为风", english: "The Gentle Wind", pinyin: "Xun Wei Feng",
    description: "Double wind. Penetrating action, gentle persistence, constant communication or marketing outreach. Seek advice.",
    judgement: "巽，小亨，利有攸往，利见大人。Gentle penetration. Constant iterations yield small but steady success."
  },
  "5_6": {
    upper: 5, lower: 6, name: "风水涣", english: "Dispersion / Expansion", pinyin: "Feng Shui Huan",
    description: "Wind over water. Breaking down blockages, dissolving rigid systems, international expansion. Set clear visions.",
    judgement: "涣，亨。王假有庙，利涉大川，利贞。Dispersion of barriers. Excellent for cross-border and team pivot."
  },
  "5_7": {
    upper: 5, lower: 7, name: "风山渐", english: "Development / Gradual Progress", pinyin: "Feng Shan Jian",
    description: "Tree growing on mountain. Gradual, organic development. Do not rush the steps to construct an iron-hard position.",
    judgement: "渐，女归吉，利贞。Gradual progress. Growth is slow but incredibly durable."
  },
  "5_8": {
    upper: 5, lower: 8, name: "风地观", english: "Contemplation / Observation", pinyin: "Feng Di Guan",
    description: "Wind over earth. Inspection, research, high-level analysis, or broad visibility. Check standard quality before firing.",
    judgement: "观，盥而不荐，有孚顒若。Contemplation. Absorb the big picture and display high moral standard."
  },
  "6_1": {
    upper: 6, lower: 1, name: "水天需", english: "Waiting / Strategy", pinyin: "Shui Tian Xu",
    description: "Water blocking path. Strategic waiting, refraining from early triggers. Replenish resources; wait for clouds to rain.",
    judgement: "需，有孚，光亨，贞吉。利涉大川。Waiting. Maintain confidence and nourish energy. Action pays later."
  },
  "6_2": {
    upper: 6, lower: 2, name: "水泽节", english: "Limitation / Regulation", pinyin: "Shui Ze Jie",
    description: "Water over lake. Containment, regular budgeting, setting limits. Rigid limits are hard to bear, so keep them practical.",
    judgement: "节，亨。苦节不可贞。Limitation brings success, but do not make restrictions toxic."
  },
  "6_3": {
    upper: 6, lower: 3, name: "水火既济", english: "After Completion", pinyin: "Shui Huo Ji Ji",
    description: "Water over fire. Perfectly balanced but danger of sliding down starts. Maintain structure carefully; keep alert of issues.",
    judgement: "既济，亨，小利贞。初吉，终乱。Perfect stability reached. Watch out for relaxation or subsequent chaos."
  },
  "6_4": {
    upper: 6, lower: 4, name: "水雷屯", english: "Difficulty at the Beginning", pinyin: "Shui Lei Tun",
    description: "Thunder in water. Growth is hard, chaos in early formation. Do not act blindly; establish helpers, map out roles.",
    judgement: "屯，元亨利贞，勿用有攸往，利建侯。Initial struggles. Appoint managers and organize foundational blocks."
  },
  "6_5": {
    upper: 6, lower: 5, name: "水风井", english: "The Well / Source", pinyin: "Shui Feng Jing",
    description: "Water over wind. Core value assets, unchanging supply, vital knowledge base. Maintain the pipes and system integrity.",
    judgement: "井，改邑不改井，无丧无得。The source is reliable. Ensure final delivery rope is undamaged."
  },
  "6_6": {
    upper: 6, lower: 6, name: "坎为水", english: "The Abyssal Water", pinyin: "Kan Wei Shui",
    description: "Double water. Flowing through dangerous abysses. High risk, extreme volatility, deep emotion. Trust internal vision.",
    judgement: "坎，维心亨，行有尚。Abyssal danger. Remain sincere in heart and move with absolute agility."
  },
  "6_7": {
    upper: 6, lower: 7, name: "水山蹇", english: "Obstruction / Hardship", pinyin: "Shui Shan Jian",
    description: "Water on mountain. Ice blocks progress. Forward path blocked; retreat and align with supportive partners.",
    judgement: "蹇，利西南，不利东北。利见大人，贞吉。Hardships. Pivot the orientation or seek coaching."
  },
  "6_8": {
    upper: 6, lower: 8, name: "水地比", english: "Holding Together / Alliance", pinyin: "Shui Di Bi",
    description: "Water on Earth. Close alliance, mutual trust, customer retention. Late arrivals might face difficult terms.",
    judgement: "比，吉。原筮元永贞，无咎。不宁方来，后夫凶。Alliance brings power. Sincerity and speed."
  },
  "7_1": {
    upper: 7, lower: 1, name: "山天大畜", english: "Great Taming / Storage", pinyin: "Shan Tian Da Xu",
    description: "Mountain hides heaven. Huge storage of resource, deep research, massive assets, or holding back action for massive impact.",
    judgement: "大畜，利贞。不家食吉，利涉大川。Great storage. Feed key players, prepare major leaps."
  },
  "7_2": {
    upper: 7, lower: 2, name: "山泽损", english: "Decrease / Investment", pinyin: "Shan Ze Sun",
    description: "Mountain over lake. Decrease bottom to feed top. Initial investment cost, cutting waste, sacrifice brings reward.",
    judgement: "损，有孚，元吉，无咎，可贞。利有攸往。Decrease. Even simple digital offerings made sincerely bring luck."
  },
  "7_3": {
    upper: 7, lower: 3, name: "山火贲", english: "Grace / Branding", pinyin: "Shan Huo Bi",
    description: "Fire on mountain. Aesthetic form, marketing wrap, user interface design. Pure branding is great but ensure inner substance.",
    judgement: "贲，亨。小利有攸往。Branding/Grace. Beautiful wrapping is valuable for intermediate projects."
  },
  "7_4": {
    upper: 7, lower: 4, name: "山雷颐", english: "Nourishment", pinyin: "Shan Lei Yi",
    description: "Mountain over thunder. The shape of an open mouth. Focus on diet, nourishment of talent, and speech regulations.",
    judgement: "颐，贞吉。观颐，自求口实。Nourishment checklist. Pay attention to what you digest and communicate."
  },
  "7_5": {
    upper: 7, lower: 5, name: "山风蛊", english: "Decay / Correction", pinyin: "Shan Feng Gu",
    description: "Wind inside mountain. Internal decay, structural issues. Time to cleanse, debug, and rebuild. 3 days before, 3 days after.",
    judgement: "蛊，元亨，利涉大川。先甲三日，后甲三日。Cleanse the rot. Map out strict fixes and rebuild templates."
  },
  "7_6": {
    upper: 7, lower: 6, name: "山水蒙", english: "Youthful Folly / Learning", pinyin: "Shan Shui Meng",
    description: "Spring under mountain. Immature stage, requiring training, onboarding, and education. Maintain instructor authority.",
    judgement: "蒙，亨。匪我求童蒙，童蒙求我。Inexperienced folly. Keep onboarding clear and structured."
  },
  "7_7": {
    upper: 7, lower: 7, name: "艮为山", english: "Keeping Still / Stand", pinyin: "Gen Wei Shan",
    description: "Double mountain. Stop, keep still. Restrict actions within current boundaries. Mindful rest, focus internally.",
    judgement: "艮，其背不获其身，行其庭不见其人，无咎。Keeping still. Freeze operations to secure the assets."
  },
  "7_8": {
    upper: 7, lower: 8, name: "山地剥", english: "Splitting Apart / Decay", pinyin: "Shan Di Bo",
    description: "Mountain crumbling to the ground. Strip-down, systematic collapse. Do not initialize new campaigns; lie low.",
    judgement: "剥，不利有攸往。Stripping down. Avoid investment; protect structural foundations carefully."
  },
  "8_1": {
    upper: 8, lower: 1, name: "地天泰", english: "Peace / Harmony", pinyin: "Di Tian Tai",
    description: "Earth sinking, Heaven rising; they meet in perfect friction. Splendid communication, massive luck, and growth.",
    judgement: "泰，小往大来，吉，亨。Peace and high expansion. High-level alignment and smooth progress."
  },
  "8_2": {
    upper: 8, lower: 2, name: "地泽临", english: "Approach / Expansion", pinyin: "Di Ze Lin",
    description: "Earth over lake. Approach of luck, scaling up operations. But watch the 8th month when a transition is expected.",
    judgement: "临，元亨利贞。至于八月有凶。Approach. Scaling up runs smoothly with high alignment."
  },
  "8_3": {
    upper: 8, lower: 3, name: "地火明夷", english: "Darkening of the Light", pinyin: "Di Huo Ming Yi",
    description: "Sun sinks into Earth. Obscurity, intelligence hiding, heavy censorship or external hostility. Keep internal light alive.",
    judgement: "明夷，利艰贞。Darkness active. Remain persevering inside while staying low-key outside."
  },
  "8_4": {
    upper: 8, lower: 4, name: "地雷复", english: "Return / Rebirth", pinyin: "Di Lei Fu",
    description: "Thunder deep in Earth. Rebirth of fire, pivot point. The 7th day cycle returns energy. Excellent time to re-launch.",
    judgement: "复，亨。出入无疾，朋来无咎。反复其道，七日来复。Return. Restoring momentum; fresh start is near."
  },
  "8_5": {
    upper: 8, lower: 5, name: "地风升", english: "Ascending / Rise", pinyin: "Di Feng Sheng",
    description: "Wind under Earth. Gradual, unstoppable upward evolution. Seek support from influential helpers and push forward.",
    judgement: "升，元亨，用见大人，勿忧，南征吉。Ascending upwards. Growth is quiet but highly structured."
  },
  "8_6": {
    upper: 8, lower: 6, name: "地水师", english: "The Army / Leadership", pinyin: "Di Shui Shi",
    description: "Water inside Earth. Mobilizing resources, team discipline, stern management. Leadership requires high wisdom.",
    judgement: "师，贞，丈人吉，无咎。Collective team campaign. Strict discipline secures success."
  },
  "8_7": {
    upper: 8, lower: 7, name: "地山谦", english: "Modesty / Safety", pinyin: "Di Shan Qian",
    description: "Highest mountain level hidden under Earth. Modesty shines bright, smooth obstacles melt. Highly auspicious.",
    judgement: "谦，亨，君子有终。Modesty yields long-term success and melts active hostile friction."
  },
  "8_8": {
    upper: 8, lower: 8, name: "坤为地", english: "The Receptive Earth", pinyin: "Kun Wei Di",
    description: "Double Earth. Receptivity, supportiveness, mother-like nurturing. Success comes not from pushing, but from following.",
    judgement: "坤，元亨，利牝马之贞。Receptive alignment. Carry burdens with gentle patient strength."
  }
};
