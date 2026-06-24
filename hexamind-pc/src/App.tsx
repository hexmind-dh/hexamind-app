import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import SeedVisualizer from "./components/SeedVisualizer";
import HistoryPanel from "./components/HistoryPanel";
import SettingsModal from "./components/SettingsModal";
import SubscriptionModal from "./components/SubscriptionModal";
import { runMeihuaCalculation, getGanzhiTime, getLocalMeihuaAnalysis, calculateSanCaiConfidence, getWuXingRelationshipInterpretation } from "./utils/meihuaEngine";
import { Language, translationDict } from "./utils/translations";
import { getDetailedYaoExplanation } from "./utils/yaoExplanations";
import { getAutomatedMonthlyPushes } from "./utils/automatedPushes";
import { DivinationApiResponse, DivinationHistoryItem, DivinationPayload } from "./types";
import { 
  Compass, MapPin, Activity, Calendar, Clock, 
  Sparkles, CheckCircle2, AlertTriangle, HelpCircle, 
  RefreshCw, Award, ArrowUpRight, CheckSquare, Zap, Eye, Lock,
  History, Maximize2, Minimize2, Trash2
} from "lucide-react";

const getElementDisplay = (element: string, lang: string) => {
  const map: Record<string, Record<string, string>> = {
    "zh-CN": { "Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土" },
    "zh-TW": { "Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土" },
    "ja": { "Metal": "金", "Wood": "木", "Water": "水", "Fire": "火", "Earth": "土" },
    "ko": { "Metal": "금", "Wood": "목", "Water": "수", "Fire": "화", "Earth": "토" },
  };
  return map[lang]?.[element] || element;
};

const getLanguageFontSettings = (lang: Language) => {
  switch (lang) {
    case "en":
      return {
        fontSans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSongti: '"Playfair Display", "Georgia", "Times New Roman", serif',
        letterSpacing: '0.015em',
        className: 'tracking-normal',
      };
    case "zh-CN":
      return {
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif',
        fontSongti: '"Noto Serif SC", "Source Han Serif SC", "Source Han Serif CN", "Songti SC", "SimSun", "STSong", serif',
        letterSpacing: '0.015em',
        className: 'tracking-normal',
      };
    case "zh-TW":
      return {
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang TC", "Hiragino Kaku Gothic ProN", "Microsoft JhengHei", "Noto Sans TC", sans-serif',
        fontSongti: '"Noto Serif TC", "Source Han Serif TC", "Songti TC", "PMingLiU", "LiSong Pro", serif',
        letterSpacing: '0.05em',
        className: 'tracking-wider',
      };
    case "ja":
      return {
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", "Meiryo", sans-serif',
        fontSongti: '"Hiragino Mincho ProN", "Noto Serif JP", "MS Mincho", serif',
        letterSpacing: '0.01em',
        className: 'tracking-tight',
      };
    case "ko":
      return {
        fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif',
        fontSongti: '"Batang", "AppleMyungjo", "Noto Serif KR", serif',
        letterSpacing: '0.015em',
        className: 'tracking-normal',
      };
    case "es":
      return {
        fontSans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSongti: '"Playfair Display", "Georgia", "Times New Roman", serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    case "id":
    case "ms":
      return {
        fontSans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSongti: '"Playfair Display", "Georgia", "Times New Roman", serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    case "th":
      return {
        fontSans: '"Noto Sans Thai", "Sukhumvit Set", system-ui, -apple-system, sans-serif',
        fontSongti: '"Noto Sans Thai", "Sukhumvit Set", system-ui, -apple-system, sans-serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    default:
      return {
        fontSans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSongti: '"Playfair Display", "Georgia", "Times New Roman", serif',
        letterSpacing: '0.015em',
        className: 'tracking-normal',
      };
  }
};


const getPlaceholderText = (lang: string): string => {
  if (lang.startsWith("zh")) {
    return "年/月/日 时：分";
  } else if (lang === "ja") {
    return "年/月/日 時:分";
  } else if (lang === "ko") {
    return "년/월/일 시:분";
  } else if (lang === "es") {
    return "aaaa/mm/dd hh:mm";
  } else if (lang === "id" || lang === "ms") {
    return "hh:mm dd/mm/yyyy";
  } else if (lang === "th") {
    return "วว/ดด/ปปปป --:--";
  }
  return "yyyy/mm/dd --:--";
};

const formatDateTimeForDisplay = (str: string, lang: string): string => {
  if (!str) return getPlaceholderText(lang);
  const parts = str.split("T");
  if (parts.length < 2) return str;
  const dateParts = parts[0].split("-");
  const timeStr = parts[1];
  if (dateParts.length < 3) return str;
  
  const yyyy = dateParts[0];
  const mm = dateParts[1];
  const dd = dateParts[2];
  
  if (lang.startsWith("zh")) {
    return `${yyyy}/${mm}/${dd} ${timeStr}`;
  } else if (lang === "ja") {
    return `${yyyy}/${mm}/${dd} ${timeStr}`;
  } else if (lang === "ko") {
    return `${yyyy}/${mm}/${dd} ${timeStr}`;
  } else if (lang === "es") {
    return `${dd}/${mm}/${yyyy} ${timeStr}`;
  } else if (lang === "id" || lang === "ms") {
    return `${dd}/${mm}/${yyyy} ${timeStr}`;
  } else if (lang === "th") {
    return `${dd}/${mm}/${yyyy} ${timeStr}`;
  }
  return `${yyyy}/${mm}/${dd} ${timeStr}`;
};


const parseBoldText = (text: string, isDark: boolean) => {
  if (!text) return <></>;
  
  // Clean formula symbols first
  let cleaned = text
    .replace(/\$\s*\\rightarrow\s*\$/g, " → ")
    .replace(/\\rightarrow/g, " → ")
    .replace(/\$\s*\\implies\s*\$/g, " ⇒ ")
    .replace(/\\implies/g, " ⇒ ")
    .replace(/\$\s*\\leftrightarrow\s*\$/g, " ↔ ")
    .replace(/\\leftrightarrow/g, " ↔ ")
    .replace(/->/g, " → ");

  // Normalise mismatched markers like *some text** or **some text* or *some text* to standard **some text**
  cleaned = cleaned.replace(/\*{1,3}([^*]+?)\*{1,3}/g, "**$1**");

  // Split by standard ** blocks
  const parts = cleaned.split(/\*\*([^*]+)\*\*/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          return (
            <strong key={i} className={`font-semibold ${isDark ? "text-cyan-400 font-sans" : "text-cyan-700 font-sans"}`}>
              {part}
            </strong>
          );
        }
        return part;
      })}
    </>
  );
};

const renderMarkdownMessage = (content: string, isDark: boolean) => {
  if (!content) return null;
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // Output code block
        elements.push(
          <pre 
            key={`code-${idx}`} 
            className={`p-3 my-2 text-[11.5px] rounded-sm border text-left leading-relaxed overflow-x-auto max-w-full ${
              isDark 
                ? "bg-slate-900/90 border-slate-800/80 text-slate-300" 
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
            style={{
              fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", Courier, NSimSun, SimSun, monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              letterSpacing: '0px'
            }}
          >
            {codeBlockLines.join("\n")}
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Process normal line elements
    if (/^[-*_=]{2,}$/.test(trimmed)) {
      elements.push(
        <div key={idx} className="my-2 border-b border-dashed border-slate-200 dark:border-white/10" />
      );
      continue;
    }

    if (trimmed.startsWith("#")) {
      const cleanHeader = trimmed.replace(/^#+\s*/, "");
      elements.push(
        <div 
          key={idx} 
          className="font-semibold mt-2.5 mb-1.5 text-xs text-cyan-400 dark:text-cyan-400 font-sans tracking-wide"
        >
          {cleanHeader}
        </div>
      );
      continue;
    }

    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const cleanBullet = trimmed.replace(/^[-*]\s*/, "");
      elements.push(
        <div key={idx} className={`flex items-start gap-1.5 pl-3 text-xs leading-relaxed text-left font-sans ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          <span className="text-cyan-500/70 select-none shrink-0">•</span>
          <span className={`flex-1 font-sans text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {parseBoldText(cleanBullet, isDark)}
          </span>
        </div>
      );
      continue;
    }

    if (line === "") {
      elements.push(<div key={idx} className="h-1.5" />);
      continue;
    }

    elements.push(
      <div key={idx} className={`text-xs leading-relaxed text-left font-sans ${isDark ? "text-slate-300" : "text-slate-700"}`}>
        {parseBoldText(line, isDark)}
      </div>
    );
  }

  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <pre 
        key="code-eof" 
        className={`p-3 my-2 text-[11.5px] rounded-sm border text-left leading-relaxed overflow-x-auto max-w-full ${
          isDark 
            ? "bg-slate-900/90 border-slate-800/80 text-slate-300" 
            : "bg-slate-50 border-slate-200 text-slate-600"
        }`}
        style={{
          fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", Courier, NSimSun, SimSun, monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          letterSpacing: '0px'
        }}
      >
        {codeBlockLines.join("\n")}
      </pre>
    );
  }

  return (
    <div className="space-y-1 font-sans">
      {elements}
    </div>
  );
};

const GREETINGS_BY_LANG: Record<string, {
  leading: string;
  rotating: string[];
  suggestions: { label: string; text: string }[];
}> = {
  en: {
    leading: "Director, the baseline matrix is secured.",
    rotating: [
      "What are you planning to do now?",
      "Ask whatever you want to understand, feel free to ask.",
      "How would you like to adjust your tactical variables?",
      "We are ready to simulate the dynamic elements."
    ],
    suggestions: [
      { label: "Ledger Credit Delay", text: "What if we extend the payment settlement period by 15 days or introduce a credit escrow?" },
      { label: "Bilateral Contract Rewrite", text: "What if we restructure the service agreement with a strict 20% price buffer cap and penalty clauses?" },
      { label: "In-source Sub-modules", text: "What if we reclaim outer sub-contracts and direct key logistics to internal teams?" },
      { label: "Auspicious Horizon Delay", text: "What if we select an alternative auspicious window to avoid peaks of direct resistance?" }
    ]
  },
  "zh-CN": {
    leading: "",
    rotating: [
      "您现在准备怎么做？",
      "想了解决策博弈或未来演化，尽管问吧。",
      "打算如何调整您的策略变量？",
      "已就位，随时可以仿真要素演化路径。"
    ],
    suggestions: [
      { label: "延长结算账期", text: "如果我们将结算周期拉长15天，或者引入第三方信用担保以吸收攻势，博弈效果如何？" },
      { label: "重组惩罚性条款", text: "如果我们在商务合约中强制增加20%的价格缓冲区，并写入严格的法律审计与违约罚则，会怎样？" },
      { label: "收缩外包业务流", text: "如果我们停止非核心的外包，并收回至主体部分由我们自己团队管控，能否止住泄气？" },
      { label: "调整交割时辰", text: "如果我们选择避开对方旺盛的时段，将交割交接时间作相应调整，会降低阻力吗？" }
    ]
  },
  "zh-TW": {
    leading: "",
    rotating: [
      "您現在準備怎麼做？",
      "想瞭解決策博弈或未來演化，儘管問吧。",
      "打算如何調整您的策略變量？",
      "已就位，隨時可以仿真要素演化路徑。"
    ],
    suggestions: [
      { label: "延長結算賬期", text: "如果我們將結算週期拉長15天，或者引入第三方信用擔保以吸收攻勢，博弈效果如何？" },
      { label: "重組懲罰性條款", text: "如果我們在商務合約中強制增加20%的價格緩衝區，並寫入嚴格的法律審計與違約罰則，會怎樣？" },
      { label: "收縮外包業務流", text: "如果我們停止非核心的外包，並收回至主體部分由我們自己團隊管控，能否止住洩氣？" },
      { label: "調整交割時辰", text: "如果我們選擇避開對方旺盛的时段，將交割交接時間作相應調整，會降低阻力嗎？" }
    ]
  },
  ja: {
    leading: "ディレクター、時空間基準マトリクスは安全にロックされています。",
    rotating: [
      "これからどうする予定ですか？",
      "知りたいことがあれば、何でもお聞きください。",
      "戦術的変数をどのように調整しますか？",
      "いつでも要素の進化軌道をシミュレートする準備ができています。"
    ],
    suggestions: [
      { label: "決済バッファの延長", text: "決済期日を15日間延ばす、あるいは第三者信用保証付きエスクローを導入した場合、どのような影響がありますか？" },
      { label: "ペナルティ条項の設定", text: "ビジネス契約に20％の厳格な価格バッファを設定し、監査・ペナルティ条項を強化するとどうなりますか？" },
      { label: "アウトソースの回収", text: "非コア業務の外部委託を停止し、すべて自社コアチームでの内製管理に切り替えた場合の資金ロス防止効果は？" },
      { label: "マイルストーンの再調整", text: "相手側のエネルギーが最も強い時間帯を避け、主要な引き渡しスケジュールを調整した場合、抵抗は減りますか？" }
    ]
  },
  ko: {
    leading: "디렉터, 시공간 기준 매트릭스가 성공적으로 잠겼습니다.",
    rotating: [
      "이제 어떻게 하실 계획인가요?",
      "궁금한 점이 있다면 무엇이든 편하게 물어보세요.",
      "전술적 변수를 어떻게 조정하고 싶으신가요?",
      "언제든지 요소 결합 변화 시뮬레이션을 시작할 수 있습니다."
    ],
    suggestions: [
      { label: "결제 기한 연장", text: "정산 주기를 15일 연장하거나 제3자 신용 담보 보증을 제공하면 대치 상황의 완화에 도움이 될까요?" },
      { label: "패널티 조항 신설", text: "계약 조건에 20%의 가격 완충 마진을 의무적으로 반영하고 위약 벌칙 조항을 추가하면 어떻게 되나요?" },
      { label: "아웃소싱 내재화", text: "비핵심 아웃소싱을 중단하고 자사 핵심 팀에서 직접 집중 관리하게 하면 자금 누출을 줄일 수 있을까요?" },
      { label: "전달 시점 조정", text: "상대방의 에너지가 강한 시간을 비켜서 주요 마일스톤 진행 일정을 조정하면 마찰을 완화할 수 있나요?" }
    ]
  },
  es: {
    leading: "Director, la matriz de referencia temporal-espacial ya está asegurada.",
    rotating: [
      "¿Qué planeas hacer ahora?",
      "Pregunta lo que quieras comprender, no dudes en consultar.",
      "¿Cómo le gustaría ajustar sus variables operativas?",
      "Estamos listos para simular los elementos en tiempo real."
    ],
    suggestions: [
      { label: "Extender Plazo de Pago", text: "¿Qué pasa si extendemos el período de liquidación por 15 días o introducimos un garante de crédito?" },
      { label: "Restructurar Cláusulas", text: "¿Qué pasa si hardcodeamos un buffer estricto del 20% e incorporamos auditorías legales de penalización?" },
      { label: "Internalizar Servicios", text: "¿Qué pasa si revocamos contratos a terceras partes y centralizamos la logística clave con nuestro propio personal?" },
      { label: "Reajustar Agenda Coincidente", text: "¿Qué pasa si retrasamos la fecha crítica para esquivar momentos de mayor fricción directa con la contraparte?" }
    ]
  },
  id: {
    leading: "Direktur, matriks dasar spasial-temporal kini telah dikunci.",
    rotating: [
      "Apa yang berencana Anda lakukan sekarang?",
      "Tanyakan apa saja yang ingin Anda pahami, silakan bertanya.",
      "Bagaimana Anda ingin menyesuaikan variabel taktis Anda?",
      "Kami siap menyimulasikan jalur evolusi elemen secara real-time."
    ],
    suggestions: [
      { label: "Perpanjang Tempo Pembayaran", text: "Bagaimana jika kita memperpanjang periode pembayaran selama 15 hari atau memperkenalkan penjamin kredit?" },
      { label: "Penyesuaian Ketentuan Hukum", text: "Bagaimana jika kita memberlakukan batas harga 20% yang ketat serta klausul denda ke dalam kontrak kerja sama?" },
      { label: "Sentralisasi Outsource", text: "Bagaimana jika kita mengambil alih pekerjaan outsourcing non-inti untuk dikelola tim internal utama agar tidak bocor?" },
      { label: "Penyesuaian Waktu Pengiriman", text: "Bagaimana jika kita menjadwal ulang pengiriman tonggak penting demi menghindari benturan waktu langsung?" }
    ]
  },
  ms: {
    leading: "Pengarah, matriks rujukan temporal-spasial kini telah dikunci.",
    rotating: [
      "Apakah tindakan anda seterusnya?",
      "Tanyalah apa-apa sahaja yang ingin anda fahami, silakan bertanya.",
      "Bagaimanakah anda ingin melaraskan pembolehubah taktikal anda?",
      "Pusat simulasi kami sedia meramalkan evolusi elemen secara dinamik."
    ],
    suggestions: [
      { label: "Panjangkan Tempoh Bayaran", text: "Bagaimanakah jika kita melanjutkan tempoh matang bil sebanyak 15 hari atau melantik pihak ketiga sebagai penjamin?" },
      { label: "Struktur Semula Kontrak", text: "Bagaimanakah jika kita menambah had zon penampan harga 20% yang tegas serta membina klausa penalti dalam rundingan?" },
      { label: "Kawal Outsource Luaran", text: "Bagaimanakah jika kita menghentikan rantaian sub-kontrak bukan teras dan menyerap sepenuhnya ke dalam pengurusan dalaman?" },
      { label: "Selaras Jadual Penghantaran", text: "Bagaimanakah jika kita mengubah suai waktu serahan projek penting bagi mengelakkan pertentangan secara terus?" }
    ]
  },
  th: {
    leading: "ผู้อำนวยการ มิติอ้างอิงช่วงเวลาและพื้นที่ถูกจัดเตรียมอย่างสมบูรณ์แล้ว",
    rotating: [
      "คุณวางแผนจะทำอย่างไรต่อไป?",
      "ต้องการทำความเข้าใจเรื่องใด ถามมาได้เลย",
      "คุณต้องการปรับเปลี่ยนตัวแปรทางกลยุทธ์อย่างไร?",
      "เราพร้อมวิเคราะห์ผลลัพธ์ขององค์ประกอบในโลกความเป็นจริงแล้ว"
    ],
    suggestions: [
      { label: "ขยายเวลาการชำระเงิน", text: "ถ้าเรายืดระยะเวลาชำระเงินออกไปอีก 15 วัน หรือแต่งตั้งบุคคลที่สามเป็นผู้ค้ำประกันการชำระเงินล่ะ?" },
      { label: "เขียนข้อตกลงสัญญาใหม่", text: "ถ้าเราตั้งค่าส่วนต่างราคาเผื่อป้องกันความเสี่ยงไว้ 20% และระบุบทลงโทษทางกฎหมายที่เข้มงวดลงในสัญญาล่ะ?" },
      { label: "ดึงงานเข้ามาดำเนินการเอง", text: "ถ้าเลิกจ้างบริษัทภายนอกในงานส่วนที่ไม่ใช่เป้าหมายหลัก แล้วนำกลับมาบริหารจัดการด้วยทีมหลักของเราเองล่ะ?" },
      { label: "เลื่อนกำหนดเวลาส่งมอบงาน", text: "ถ้าเราปรับช่วงเวลาส่งมอบงานทางวิชาชีพที่สำคัญเพื่อหลีกเลี่ยงช่วงเวลาที่มีความขัดแย้งสูงโดยตรงล่ะ?" }
    ]
  }
};

const getGreetingData = (lang: string) => {
  return GREETINGS_BY_LANG[lang] || GREETINGS_BY_LANG["en"];
};


export default function App() {
  const [question, setQuestion] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [kineticSpeed, setKineticSpeed] = useState(1.23);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [dateTimeStr, setDateTimeStr] = useState<string>("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<"idle" | "syncing" | "success">("idle");
  const [apiResult, setApiResult] = useState<DivinationApiResponse | null>(null);
  const [historyItems, setHistoryItems] = useState<DivinationHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [hiddenAutoIds, setHiddenAutoIds] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem("hexamIND_hidden_auto_ids");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Chat console states for stateful AI boardroom counselor
  interface ChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: string;
  }
  const [chatSessions, setChatSessions] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const cached = localStorage.getItem("hexamind_chats");
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [currentChatMessage, setCurrentChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSendChatMessage = async (customPrompt?: string | any) => {
    const promptValue = typeof customPrompt === "string" ? customPrompt : currentChatMessage;
    const promptToSend = promptValue;
    if (!activeHistoryId || !promptToSend.trim() || isChatLoading) return;

    if (userTier === "Free") {
      setIsSubscriptionOpen(true);
      return;
    }

    const userMsg = promptToSend;
    if (!customPrompt) {
      setCurrentChatMessage("");
    }
    setChatError(null);
    setIsChatLoading(true);

    const sessionMsgs = chatSessions[activeHistoryId] || [];
    const newSessionMsgs: ChatMessage[] = [
      ...sessionMsgs,
      { role: "user", content: userMsg, timestamp: new Date().toISOString() }
    ];

    // Optimistically update UI
    const updatedSessions = {
      ...chatSessions,
      [activeHistoryId]: newSessionMsgs
    };
    setChatSessions(updatedSessions);
    localStorage.setItem("hexamind_chats", JSON.stringify(updatedSessions));

    // Scroll to scroller immediately so customer feels the feedback and knows the advisor is writing
    setTimeout(() => {
      const chatContainer = document.getElementById("hexa-terminal-scroller");
      if (chatContainer) {
        chatContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 50);

    try {
      // Map history items into the role/content interface that the backend expects
      const prevHistoryForServer = sessionMsgs.map(m => ({
        role: m.role,
        content: m.content
      }));

      let activeItem = historyItems.find(h => h.id === activeHistoryId);
      if (!activeItem && activeHistoryId && activeHistoryId.startsWith("auto-monthly")) {
        activeItem = getAutomatedMonthlyPushes(language).find(p => p.id === activeHistoryId);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: activeHistoryId,
          user_tier: userTier,
          message: userMsg,
          chat_history: prevHistoryForServer,
          metadata: {
            hexagram: apiResult?.payload?.charts?.original?.name || activeItem?.originalGua || "Unknown",
            relationship: apiResult?.payload?.relationship || { conclusion: activeItem?.conclusion || "体用比和", type: "Unknown" },
            confidence: confidenceScore,
            original_query: apiResult?.input?.question || activeItem?.question || "",
            local_time: new Date(apiResult?.input?.timestamp || Date.now()).toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const finalMsgs: ChatMessage[] = [
          ...newSessionMsgs,
          { role: "model", content: data.reply, timestamp: new Date().toISOString() }
        ];
        const newestSessions = {
          ...chatSessions,
          [activeHistoryId]: finalMsgs
        };
        setChatSessions(newestSessions);
        localStorage.setItem("hexamind_chats", JSON.stringify(newestSessions));
      } else {
        setChatError(data.error || "An error occurred with Hexa AI Counsel.");
      }
    } catch (err: any) {
      console.error(err);
      setChatError("Connection error while consulting the boardroom advisor.");
    } finally {
      setIsChatLoading(false);
      
      // Auto-scroll chat window to bottom
      setTimeout(() => {
        const chatContainer = document.getElementById("hexa-terminal-scroller");
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 80);
    }
  };

  // Core settings states
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [systemDark, setSystemDark] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; provider: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryFullscreen, setIsHistoryFullscreen] = useState(false);
  const [userTier, setUserTier] = useState<"Free" | "Pro">("Free");

  // States for kinetic tracking pad & Mist Removal Scratch Board
  const [isDrawing, setIsDrawing] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratchLocked, setIsScratchLocked] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const lastPaintTimeRef = useRef<number>(0);
  const [hasScratched, setHasScratched] = useState(false);
  const [scratchLength, setScratchLength] = useState(0);
  const mouseTrailRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number>(98.42);
  const [rollingConfidence, setRollingConfidence] = useState<number>(75.00);
  const [greetingIndex] = useState(() => Math.floor(Math.random() * 4));

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setRollingConfidence(60 + Math.random() * 39.99);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Localisation lookup helper
  const t = (key: string) => translationDict[language][key] || key;

  // Track browser preference for light/dark
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // System time syncer for custom timestamp & user configurations
  useEffect(() => {
    // Load Local Language
    const savedLang = localStorage.getItem("hexamind_lang") as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // detect browser language
      const browserLanguage = navigator.language || "en";
      let matched: Language = "en";
      if (browserLanguage.includes("zh-CN") || browserLanguage.startsWith("zh-Hans")) {
        matched = "zh-CN";
      } else if (browserLanguage.includes("zh") || browserLanguage.includes("TW") || browserLanguage.includes("HK") || browserLanguage.startsWith("zh-Hant")) {
        matched = "zh-TW";
      } else if (browserLanguage.startsWith("ja")) {
        matched = "ja";
      } else if (browserLanguage.startsWith("ko")) {
        matched = "ko";
      } else if (browserLanguage.startsWith("es")) {
        matched = "es";
      } else if (browserLanguage.startsWith("id") || browserLanguage.startsWith("in")) {
        matched = "id";
      } else if (browserLanguage.startsWith("ms")) {
        matched = "ms";
      } else if (browserLanguage.startsWith("th")) {
        matched = "th";
      }
      setLanguage(matched);
    }

    // Load Local Theme
    const savedTheme = localStorage.getItem("hexamind_theme") as "dark" | "light" | "system" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Load Local User status
    const savedUser = localStorage.getItem("hexamind_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse user profile status", err);
      }
    }

    // Load Local User subscription tier
    const savedTier = localStorage.getItem("hexamind_tier") as "Free" | "Pro" | null;
    if (savedTier) {
      setUserTier(savedTier);
    }

    // Load Local History
    const localHist = localStorage.getItem("hexamIND_hist");
    if (localHist) {
      try {
        const parsed = JSON.parse(localHist);
        if (Array.isArray(parsed)) {
          setHistoryItems(parsed);
        } else {
          setHistoryItems([]);
        }
      } catch (err) {
        console.error("Failed to parse history", err);
        setHistoryItems([]);
      }
    }
  }, []);

  // Compute active dark state (Forced dark mode as default)
  const isDark = true;

  // Persistent settings actions
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("hexamind_lang", lang);
  };

  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    setTheme("dark");
    localStorage.setItem("hexamind_theme", "dark");
  };

  const handleLogin = (newUser: { name: string; email: string; provider: string }) => {
    setUser(newUser);
    localStorage.setItem("hexamind_user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hexamind_user");
  };

  // Get localized presets
  const getPresetsForLanguage = (lang: Language) => {
    const dict = translationDict[lang] || translationDict["en"];
    return [
      {
        label: lang.startsWith("zh")
          ? "供应合同"
          : lang === "ja"
          ? "契約締結"
          : lang === "ko"
          ? "공급계약"
          : lang === "id"
          ? "Kontrak Vendor"
          : lang === "ms"
          ? "Kontrak Vendor"
          : lang === "th"
          ? "สัญญาคู่ค้า"
          : lang === "es"
          ? "Contrato"
          : "Vendor Contract",
        question: dict.preset1
      },
      {
        label: lang.startsWith("zh")
          ? "生产发布"
          : lang === "ja"
          ? "本番リリース"
          : lang === "ko"
          ? "운영배포"
          : lang === "id"
          ? "Peluncuran Prod"
          : lang === "ms"
          ? "Pelancaran Prod"
          : lang === "th"
          ? "เปิดตัวระบบ"
          : lang === "es"
          ? "Lanzamiento"
          : "Prod Launch",
        question: dict.preset2
      },
      {
        label: lang.startsWith("zh")
          ? "融资交割"
          : lang === "ja"
          ? "資金調達"
          : lang === "ko"
          ? "금융투자"
          : lang === "id"
          ? "Pendanaan S-A"
          : lang === "ms"
          ? "Pendanaan S-A"
          : lang === "th"
          ? "ระดมทุน"
          : lang === "es"
          ? "Inversión"
          : "Funding",
        question: dict.preset3
      },
      {
        label: lang.startsWith("zh")
          ? "清关保障"
          : lang === "ja"
          ? "税关申告"
          : lang === "ko"
          ? "통관승인"
          : lang === "id"
          ? "Bea Cukai Kargo"
          : lang === "ms"
          ? "Pelepasan Kastam"
          : lang === "th"
          ? "ศุลกากรคาร์โก้"
          : lang === "es"
          ? "Aduanas"
          : "Customs Cargo",
        question: dict.preset4
      },
      {
        label: lang.startsWith("zh")
          ? "转型重组"
          : lang === "ja"
          ? "組織変更"
          : lang === "ko"
          ? "조직전형"
          : lang === "id"
          ? "Pivot Strategis"
          : lang === "ms"
          ? "Pivot Strategik"
          : lang === "th"
          ? "การปรับโครงสร้าง"
          : lang === "es"
          ? "Estrategia"
          : "Strategic Pivot",
        question: dict.preset5
      },
    ];
  };

  const PRESETS_LOCALIZED = getPresetsForLanguage(language);

  // Cycle preset questions when clicking the diamond star button
  const cyclePresetQuestion = () => {
    const questions = PRESETS_LOCALIZED.map((p) => p.question);
    const currentIndex = questions.indexOf(question);
    const nextIndex = (currentIndex + 1) % questions.length;
    setQuestion(questions[nextIndex]);
    if (errorMessage) setErrorMessage(null);
  };

  // Update millisecond timestamp when input changes
  const handleDateTimeChange = (val: string) => {
    setDateTimeStr(val);
    if (val) {
      setTimestamp(new Date(val).getTime());
    }
  };

  // Locate user GPS coordinates
  const triggerGPSLocate = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser environment.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(4)));
        setLongitude(Number(pos.coords.longitude.toFixed(4)));
        setErrorMessage(null);
      },
      (err) => {
        setErrorMessage("Location access was denied or timed out. Defaulting to standard coordinates.");
      }
    );
  };

  // Help reset scratch board state
  const resetScratchBoard = () => {
    setIsScratchLocked(false);
    setHasScratched(false);
    setScratchLength(0);
    setKineticSpeed(1.23);
    setScratchProgress(0);
  };

  // Canvas initializer for frosted/glass mist layer
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Beautiful misty vector background fill
    if (isDark) {
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, "#23242f");
      grad.addColorStop(0.5, "#2a2b38");
      grad.addColorStop(1, "#181920");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Star noise grains
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        ctx.fillRect(x, y, 1.2, 1.2);
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, "#cbd5e1");
      grad.addColorStop(0.5, "#e2e8f0");
      grad.addColorStop(1, "#94a3b8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 120; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // Primary guideline text inside the mist
    ctx.font = 'italic 500 11.5px Georgia, "Times New Roman", serif';
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.85)";
    const promptText = t("mistPrompt");
    ctx.fillText(promptText, rect.width / 2, rect.height / 2);
  };

  // Re-draw canvas on state adjustments
  useEffect(() => {
    if (canvasRef.current && !isScratchLocked) {
      // Small timeout to ensure canvas bounding-rect is calculated accurately
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [canvasRef.current, language, isDark, isScratchLocked]);

  // Kinetic Pad Drag & Scratch Board Interaction Managers
  const handlePadStart = (e: React.PointerEvent) => {
    if (isScratchLocked || isLoading) return;
    setIsDrawing(true);
    setHasScratched(true);
    mouseTrailRef.current = [];
    velocitiesRef.current = []; // Clear previous velocities stream
    lastPaintTimeRef.current = Date.now();

    // Erase starting node on start
    if (padRef.current && canvasRef.current) {
      const rect = padRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  };

  const handlePadMove = (e: React.PointerEvent) => {
    if (!isDrawing || isScratchLocked || isLoading || !padRef.current || !canvasRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const t = Date.now();

    // Soft destination-out brush effect
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      // Soft fading radial smudge edges
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const trail = mouseTrailRef.current;
    trail.push({ x, y, t });

    if (trail.length > 20) {
      trail.shift();
    }

    let addedLen = 0;
    if (trail.length >= 2) {
      const p1 = trail[trail.length - 2];
      const p2 = trail[trail.length - 1];
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      addedLen = dist;
      
      const dt = p2.t - p1.t || 1;
      const velocity = dist / dt;

      // Dynamic scale matching subscription boundaries
      const rawVelocity = velocity * 45; 
      const maxCap = userTier === "Free" ? 12.00 : 120.00;
      const scaledVal = Math.min(maxCap, Math.max(0.12, Number(rawVelocity.toFixed(3))));
      velocitiesRef.current.push(scaledVal); // Track for San-Cai Ren (stability) factor
    }

    const currentLen = scratchLength + addedLen;
    setScratchLength(currentLen);

    // Accumulate drawing duration up to 5000ms (5 seconds)
    const now = Date.now();
    const elapsed = now - lastPaintTimeRef.current;
    lastPaintTimeRef.current = now;
    if (elapsed > 0 && elapsed < 200) {
      setScratchProgress((prev) => {
        const next = prev + (elapsed / 5000) * 100;
        if (next >= 100) {
          setIsDrawing(false);
          setIsScratchLocked(true);
          // Set speed on active completion
          if (velocitiesRef.current.length > 0) {
            const sum = velocitiesRef.current.reduce((acc, v) => acc + v, 0);
            const averageSpeed = sum / velocitiesRef.current.length;
            setKineticSpeed(Number(averageSpeed.toFixed(3)));
          } else {
            setKineticSpeed(1.23);
          }
          return 100;
        }
        return next;
      });
    }
  };

  const handlePadEnd = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setIsScratchLocked(true); // Divine Lockout - Prevent "卦多不灵"

      if (velocitiesRef.current.length > 0) {
        const sum = velocitiesRef.current.reduce((acc, v) => acc + v, 0);
        const averageSpeed = sum / velocitiesRef.current.length;
        setKineticSpeed(Number(averageSpeed.toFixed(3)));
      } else {
        setKineticSpeed(1.23);
      }
    }
  };

  // Helper custom steps for localized fallbacks with Dynamic Executive Tactical Hedging Directives
  const getFallbackActions = (lang: Language, conclusion: string, ti: string, yong: string) => {
    const elementTranslations: Record<string, Record<string, string>> = {
      "en": { "Water": "Water", "Fire": "Fire", "Metal": "Metal", "Wood": "Wood", "Earth": "Earth" },
      "zh-CN": { "Water": "水", "Fire": "火", "Metal": "金", "Wood": "木", "Earth": "土" },
      "zh-TW": { "Water": "水", "Fire": "火", "Metal": "金", "Wood": "木", "Earth": "土" },
      "ja": { "Water": "水", "Fire": "火", "Metal": "金", "Wood": "木", "Earth": "土" },
      "ko": { "Water": "수(水)", "Fire": "화(火)", "Metal": "금(金)", "Wood": "목(木)", "Earth": "토(土)" },
      "es": { "Water": "Agua", "Fire": "Fuego", "Metal": "Metal", "Wood": "Madera", "Earth": "Tierra" },
      "id": { "Water": "Air", "Fire": "Api", "Metal": "Logam", "Wood": "Kayu", "Earth": "Tanah" },
      "ms": { "Water": "Air", "Fire": "Api", "Metal": "Logam", "Wood": "Kayu", "Earth": "Tanah" },
      "th": { "Water": "น้ำ (Water)", "Fire": "ไฟ (Fire)", "Metal": "ทอง/โลหะ (Metal)", "Wood": "ไม้ (Wood)", "Earth": "ดิน (Earth)" }
    };

    const getElementTranslated = (elem: string, l: Language): string => {
      const norm = elem ? elem.charAt(0).toUpperCase() + elem.slice(1).toLowerCase() : "Wood";
      const langKey = l.startsWith("zh") ? (l === "zh-TW" ? "zh-TW" : "zh-CN") : l;
      return elementTranslations[langKey]?.[norm] || elementTranslations["en"]?.[norm] || norm;
    };

    const getBridgeElement = (yG: string, tG: string) => {
      const yNorm = yG ? yG.charAt(0).toUpperCase() + yG.slice(1).toLowerCase() : "";
      const tNorm = tG ? tG.charAt(0).toUpperCase() + tG.slice(1).toLowerCase() : "";

      if (yNorm === "Water" && tNorm === "Fire") return "Wood";
      if (yNorm === "Fire" && tNorm === "Metal") return "Earth";
      if (yNorm === "Metal" && tNorm === "Wood") return "Water";
      if (yNorm === "Wood" && tNorm === "Earth") return "Fire";
      if (yNorm === "Earth" && tNorm === "Water") return "Metal";
      return "Wood";
    };

    const isZh = lang.startsWith("zh");
    const tiElem = getElementTranslated(ti, lang);
    const yongElem = getElementTranslated(yong, lang);
    const bridge = getBridgeElement(yong, ti);
    const bridgeElem = getElementTranslated(bridge, lang);

    const steps: string[] = [];

    if (conclusion === "用克体") {
      if (isZh) {
        steps.push(
          `[必须进行战术对冲] 检测到严重的 ${yongElem}属性 压制 ${tiElem}属性 的结构性冲突（如：${yongElem} 压制了您的 ${tiElem} 资本）。您的业务杠杆正在流失。请立即引入 ${bridgeElem}属性 资产（例如：当前 ${yongElem} 侵袭时，引入 ${bridgeElem} —— 如延长 15 天托管期或引入第三方信用担保人）来吸纳交易对手的攻势，并将其转化为良性生助循环。 [SIMULATE_TRIGGER: 引入 ${bridgeElem}属性 资本或结算期对冲（例如延长 15 天结算或引入第三方担保）来化解当前 ${yongElem} 克制 ${tiElem} 的严重冲突。]`
        );
        steps.push(
          `[资产安全控制] 对冲 ${yongElem} 元素带来的高频对立，重组具有惩罚性条款的商务合约，提升体卦防守韧度。 [SIMULATE_TRIGGER: 增加惩罚性违约金和法律审计条款，增强体卦资本抗风险能力。]`
        );
        steps.push(
          `[时序平衡校准] 建议在契机生助时辰（如避开 ${yongElem} 旺盛时辰）执行重组，以降低执行阻力。 [SIMULATE_TRIGGER: 调整交割时间至生助的时辰，规避 ${yongElem} 旺盛期的直接对立。]`
        );
      } else {
        steps.push(
          `[Tactical Hedging Required] Detected a severe ${yongElem} vs ${tiElem} structural conflict (e.g., ${yongElem} suppressing your ${tiElem} capital). You are bleeding leverage. IMMEDIATELY introduce a ${bridgeElem} asset (e.g., if ${yongElem} is attacking, introduce ${bridgeElem}—such as extended 15-day escrow terms or a 3rd-party credit guarantor) to absorb the counterpart's aggression and redirect it into a generative cycle. [SIMULATE_TRIGGER: Introduce ${bridgeElem} asset (such as extended 15-day escrow or 3rd-party guarantee) to resolve the severe ${yongElem} vs ${tiElem} structural conflict.]`
        );
        steps.push(
          `[Asset Security Controls] Mitigate the intense ${yongElem} pressure by structuring strict penalty clauses to protect your ${tiElem} base. [SIMULATE_TRIGGER: Add strict bilateral penalty clauses to insulate the ${tiElem} asset base from systemic risk.]`
        );
        steps.push(
          `[Temporal Realignment] Shift implementation timeline to avoid peak ${yongElem} orbital periods and leverage natural transition states. [SIMULATE_TRIGGER: Reschedule the critical milestone to a hour that neutralizes peak ${yongElem} influence.]`
        );
      }
    } else if (conclusion === "体生用") {
      if (isZh) {
        steps.push(
          `[强行执行最高成本上限] 您的企业运营架构正处于“泄气”周期（体卦 ${tiElem} 生助 用卦 ${yongElem}）。这预示着预算超支或供应商超额收费。您必须在明天的合同采购或履约谈判中强制写入 20% 的刚性价格缓冲区。一旦对方突破该上限，立即执行阶段性业务冻结。 [SIMULATE_TRIGGER: 限制预算并强制要求 20% 的价格缓冲区，以遏制体生用导致的资金过度流出。]`
        );
        steps.push(
          `[合同权限收缩] 收回不必要的非核心外包项目，由体卦主体部分直接进行集中管控，防止泄气扩散。 [SIMULATE_TRIGGER: 停止非核心业务外包，收缩业务流至体卦主体。]`
        );
        steps.push(
          `[长效增幅锁定] 对交易要素实施标准化锁价，用协议冻结用卦 ${yongElem} 的超标索求。 [SIMULATE_TRIGGER: 与对方签订固定单价锁价协议，冻结 ${yongElem} 属性的额外索求。]`
        );
      } else {
        steps.push(
          `[Cost Ceiling Enforcement] Your enterprise matrix is in a 'Leaking' cycle (${tiElem} producing ${yongElem}). This indicates unchecked budget creep or vendor overcharging. You MUST hard-code a strict 20% price buffer margin into tomorrow's contract procurement threshold. The moment the counter-party breaches this cap, execute an operational freeze. [SIMULATE_TRIGGER: Impose a rigorous 20% cost buffer limit on procurement to plug the ${tiElem} to ${yongElem} capital leak.]`
        );
        steps.push(
          `[Sovereignty Consolidation] Reclaim control of outsourced layers, routing tasks directly into internal teams to conserve active energy. [SIMULATE_TRIGGER: In-source critical sub-modules to preserve the generative reserves of the ${tiElem} core.]`
        );
        steps.push(
          `[Long-Term Price Lock] Hedging against further drainage by executing a hard immutable long-term pricing agreement. [SIMULATE_TRIGGER: Execute an immutable fixed-price supply contract to stop ongoing ${yongElem} drainage.]`
        );
      }
    } else {
      if (isZh) {
        steps.push(
          `[战略扩张部署] 当前五行态势表现为积极联动（关系判定为 ${conclusion === "用生体" ? "用卦生助体卦" : conclusion === "体用比和" ? "体用比和共生" : "体卦克制用卦"}）。当前体 ${tiElem} 与用 ${yongElem} 能量传导顺畅。建议全面加速签约、扩产及资产流动性部署。 [SIMULATE_TRIGGER: 推进全面扩张，充分利用 ${tiElem} 与 ${yongElem} 极佳的能量流动性。]`
        );
        steps.push(
          `[关系契合强化] 把握当前交易对手对您的倾斜或服从，通过签署排他性代理权或核心合作协议，锁死长远利益。 [SIMULATE_TRIGGER: 推进独家排他性合作条款，锁定在 ${yongElem} 之上的主导权益。]`
        );
        steps.push(
          `[杠杆乘数优化] 利用上升期势能适度扩大融资比例，将资源迅速导入到关键物流或资本供应链中。 [SIMULATE_TRIGGER: 借助有利能量期，放大核心商业资本对冲，加速盈利结算。]`
        );
      } else {
        steps.push(
          `[Strategic Forward Campaign] The active cycles present a high-affinity matrix (relationship evaluates as ${conclusion === "用生体" ? "Yong Generates Ti" : conclusion === "体用比和" ? "Equal Cohesion Coexistence" : "Ti Controls Yong Overcoming"}). Communication channels between ${tiElem} and ${yongElem} are wide open. Recommended to advance timelines and sign contracts immediately. [SIMULATE_TRIGGER: Speed up procurement and sign contracts to capitalize on the highly cooperative ${tiElem} and ${yongElem} synergy.]`
        );
        steps.push(
          `[Exclusivity Lock-In] Solidify control of the counter-party while conditions are highly favorable; establish strategic exclusivity agreements. [SIMULATE_TRIGGER: Lock down an exclusivity and priority partner status with the ${yongElem} counterparty.]`
        );
        steps.push(
          `[Leaning Leverage Optimization] Deploy aggressive growth options and extend logistical buffers while your enterprise controls the field. [SIMULATE_TRIGGER: Maximize long-term procurement hedging while we have upper-hand sovereignty.]`
        );
      }
    }

    return steps;
  };


  // Cast Divination Action
  const triggerDivinate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) {
      setErrorMessage(t("pleaseStateQuestion"));
      return;
    }

    if (!timestamp) {
      setErrorMessage(t("pleaseInjectTime"));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setActiveHistoryId(null);

    // Validate daily queries and cooldowns
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // Cooldown verification
    const lastQueryStr = localStorage.getItem("hexamind_last_query_time");
    if (lastQueryStr) {
      const lastQueryTime = parseInt(lastQueryStr, 10);
      const secondsPassed = (Date.now() - lastQueryTime) / 1000;
      
      let cooldownSec = 3600; // Free
      if (userTier === "Pro") cooldownSec = 15; // 15 secs (Superfast master speeds!)
      
      if (secondsPassed < cooldownSec) {
        const remainingSec = Math.ceil(cooldownSec - secondsPassed);
        const minutes = Math.floor(remainingSec / 60);
        const seconds = Math.floor(remainingSec % 60);
        const textTime = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        
        let cooldownMessage = "";
        const tierNames: Record<string, Record<string, string>> = {
          "zh-CN": { Free: "入门体验版", Pro: "专业顾问版" },
          "zh-TW": { Free: "入門體驗版", Pro: "專業顧問版" },
          "ja": { Free: "無料版", Pro: "プロ版" },
          "ko": { Free: "무료판", Pro: "프로판" },
          "es": { Free: "Gratis", Pro: "Pro" },
          "id": { Free: "Gratis", Pro: "Pro" },
          "ms": { Free: "Percuma", Pro: "Pro" },
          "th": { Free: "รุ่นฟรี", Pro: "รุ่นโปร" },
          "en": { Free: "Free", Pro: "Pro" },
        };
        const currentTierNames = tierNames[language] || tierNames["en"];
        const nameOfTier = currentTierNames[userTier] || userTier;

        if (language === "ja") {
          cooldownMessage = `⏳ 時系クールダウン制限：現在のプランは [${nameOfTier}] です。次の占いまで ${textTime} お待ちいただくか、設定画面でアップグレードを行ってください。`;
        } else if (language.startsWith("zh")) {
          cooldownMessage = `⏳ 触发时序冷却限制：正在使用 [${nameOfTier}]。请等待 ${textTime} 后再占问，或在设置中自助升级。`;
        } else if (language === "ko") {
          cooldownMessage = `⏳ 쿨다운 제한 적용 중: 현재 요금제 [${nameOfTier}]. 다음 판단까지 ${textTime} 동안 대기하시거나 설정에서 등급을 변경하십시오.`;
        } else if (language === "es") {
          cooldownMessage = `⏳ Restricción de enfriamiento: Plan activo [${nameOfTier}]. Espere ${textTime} antes de la próxima consulta, o actualice en CONFIGURACIÓN.`;
        } else if (language === "id") {
          cooldownMessage = `⏳ Batasan Cooldown: Paket aktif [${nameOfTier}]. Tunggu ${textTime} sebelum meramal kembali, atau tingkatkan di PENGATURAN.`;
        } else if (language === "ms") {
          cooldownMessage = `⏳ Batasan Cooldown: Pakej aktif [${nameOfTier}]. Tunggu ${textTime} sebelum meramal semula, atau tingkatkan di TETAPAN.`;
        } else if (language === "th") {
          cooldownMessage = `⏳ จำกัดเวลาคูลดาวน์ระบบ: แผนปัจจุบันของคุณคือ [${nameOfTier}]. กรุณารออีก ${textTime} ก่อนทำนายครั้งต่อไป หรืออัปเกรดในตั้งค่า`;
        } else {
          cooldownMessage = `⏳ Cooldown restriction: Active plan [${nameOfTier}]. Wait ${textTime} before next cast, or upgrade in SETTING.`;
        }
        setErrorMessage(cooldownMessage);
        setIsLoading(false);
        return;
      }
    }
    
    // Daily quota verification
    let dailyLimit = 3; // Free - Inception Tier 3 times max
    if (userTier === "Pro") dailyLimit = 1000; // Pro Consultant Unlimited
    
    const quotaDataStr = localStorage.getItem("hexamind_quota_data");
    let dailyCount = 0;
    if (quotaDataStr) {
      try {
        const data = JSON.parse(quotaDataStr);
        if (data.date === todayStr) {
          dailyCount = data.count;
        }
      } catch (err) {}
    }
    
    if (dailyCount >= dailyLimit) {
      let limitMessage = "";
      const tierNames: Record<string, Record<string, string>> = {
        "zh-CN": { Free: "入门体验版", Pro: "专业顾问版" },
        "zh-TW": { Free: "入門體驗版", Pro: "專業顧問版" },
        "ja": { Free: "無料版", Pro: "プロ版" },
        "ko": { Free: "무료판", Pro: "프로판" },
        "es": { Free: "Gratis", Pro: "Pro" },
        "id": { Free: "Gratis", Pro: "Pro" },
        "ms": { Free: "Percuma", Pro: "Pro" },
        "th": { Free: "รุ่นเสรี", Pro: "รุ่นโปร" },
        "en": { Free: "Free", Pro: "Pro" },
      };
      const currentTierNames = tierNames[language] || tierNames["en"];
      const nameOfTier = currentTierNames[userTier] || userTier;

      if (language === "ja") {
        limitMessage = `🚨 本日の利用回数上限に達しました：現在のプラン [${nameOfTier}] の上限は1日あたり ${dailyLimit} 回です。右上の「設定」からメンバーシップをアップグレードしてください。`;
      } else if (language.startsWith("zh")) {
        limitMessage = `🚨 每日配额用尽：您的 [${nameOfTier}] 只有每日 ${dailyLimit} 次。请点击右上角「设置」会员授权区，自助升级会员层级解锁限额！`;
      } else if (language === "ko") {
        limitMessage = `🚨 일일 할당량 소진: 현재 요금제 [${nameOfTier}]의 한도는 일일 ${dailyLimit}회입니다.설정에서 회원 등급 업그레이드를 진행하세요!`;
      } else if (language === "es") {
        limitMessage = `🚨 Cuota diaria agotada: Límite del plan activo [${nameOfTier}] es de ${dailyLimit} consultas/día. Haga clic en CONFIGURACIÓN para actualizar.`;
      } else if (language === "id") {
        limitMessage = `🚨 Kuota harian habis: Batasan paket aktif [${nameOfTier}] adalah ${dailyLimit} ramalan/hari. Klik PENGATURAN untuk meningkatkan!`;
      } else if (language === "ms") {
        limitMessage = `🚨 Had kuota harian habis: Had pakej aktif [${nameOfTier}] ialah ${dailyLimit} ramalan/hari. Sila rujuk TETAPAN untuk naik taraf!`;
      } else if (language === "th") {
        limitMessage = `🚨 โควตาประจำวันหมดแล้ว: ขีดจำกัดของแผนปัจจุบัน [${nameOfTier}] คือ ${dailyLimit} ครั้งต่อวัน เข้าสู่แผงตั้งค่าเพื่ออัปเกรดเพื่อปลดล็อกขีดจำกัด!`;
      } else {
        limitMessage = `🚨 Daily quota exhausted: Active plan [${nameOfTier}] limit is ${dailyLimit} queries/day. Click SETTING to upgrade membership!`;
      }
      setErrorMessage(limitMessage);
      setIsLoading(false);
      return;
    }

    const resolvedLat = latitude === "" ? 31.23 : latitude;
    const resolvedLng = longitude === "" ? 121.47 : longitude;
    const resolvedTs = timestamp;

    try {
      const response = await fetch("/api/divinate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          latitude: resolvedLat,
          longitude: resolvedLng,
          kineticValue: kineticSpeed,
          timestamp: resolvedTs,
          language,
          user_tier: userTier,
          timezoneOffset: new Date().getTimezoneOffset(),
        }),
      });

      if (!response.ok) {
        throw new Error("Mathematical core computed with non-200 state.");
      }

      const resData: DivinationApiResponse = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || "Metaphysical engine failed.");
      }

      // Map response verdict and analysis dynamically if localized dictionary is available
      const localCalculatedPayload = runMeihuaCalculation(resolvedTs, resolvedLat, resolvedLng, kineticSpeed);
      const isPositive = localCalculatedPayload.relationship.conclusion === "用生体" || localCalculatedPayload.relationship.conclusion === "体用比和" || localCalculatedPayload.relationship.conclusion === "体克用";
      
      const updatedResult = { ...resData };
      if (!updatedResult.aiOutput) {
        updatedResult.aiOutput = {
          verdict: localCalculatedPayload.relationship.auspiciousness,
          analysis: getLocalMeihuaAnalysis(localCalculatedPayload, language, getGanzhiTime(resolvedTs)),
          tacticalAction: getFallbackActions(
            language,
            localCalculatedPayload.relationship.conclusion,
            localCalculatedPayload.tiGua.trigram.element,
            localCalculatedPayload.yongGua.trigram.element
          ),
          phenomenologicalEcho: t("phenomEcho1"),
          catalystWindow: language.startsWith("zh")
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "午时 (11:00-13:00)" : "卯时 (05:00-07:00)")
            : language === "ja"
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "午の刻 (11:00-13:00)" : "卯の刻 (05:00-07:00)")
            : language === "ko"
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "오시 (11:00-13:00)" : "묘시 (05:00-07:00)")
            : (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "Hour of the Horse (11:00-13:00)" : "Hour of the Rabbit (05:00-07:00)")
        };
      } else {
        // Enforce localized translation of actions dynamically based on selection
        updatedResult.aiOutput.tacticalAction = getFallbackActions(
          language,
          localCalculatedPayload.relationship.conclusion,
          localCalculatedPayload.tiGua.trigram.element,
          localCalculatedPayload.yongGua.trigram.element
        );
      }

      // Calculate San-Cai Confidence dynamically
      const gTime = getGanzhiTime(resolvedTs);
      const monthPart = gTime.split(" ")[1];
      const monthBranch = monthPart ? monthPart.charAt(1) : "巳";
      const calculatedConfidence = calculateSanCaiConfidence(
        localCalculatedPayload.tiGua.trigram.element,
        monthBranch,
        resolvedLat,
        resolvedLng,
        velocitiesRef.current
      );
      setConfidenceScore(calculatedConfidence);

      // Save successful transaction stats and cooldown
      localStorage.setItem("hexamind_quota_data", JSON.stringify({ date: todayStr, count: dailyCount + 1 }));
      localStorage.setItem("hexamind_last_query_time", Date.now().toString());

      setApiResult(updatedResult);
      setIsLeftPanelCollapsed(true);

      if (updatedResult.payload) {
        const payload = updatedResult.payload;
        const newHistItem: DivinationHistoryItem = {
          id: `cast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: new Date(payload.temporalSeed.rawValue).toISOString(),
          question: updatedResult.input.question,
          originalGua: payload.charts.original.name,
          conclusion: payload.relationship.conclusion,
          auspiciousness: payload.relationship.auspiciousness,
          confidenceScore: calculatedConfidence,
          aiOutput: updatedResult.aiOutput,
          latitude: payload.spatialSeed.lat,
          longitude: payload.spatialSeed.lng,
          kineticValue: payload.kineticSeed.rawValue,
          timestamp: payload.temporalSeed.rawValue
        };

        setActiveHistoryId(newHistItem.id);

        let updatedHist = [newHistItem, ...historyItems];
        if (userTier === "Free") {
          // Keep strictly in memory - no database persistence per PRD rules
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          updatedHist = updatedHist.filter(h => new Date(h.date).getTime() > sevenDaysAgo);
          setHistoryItems(updatedHist);
        } else {
          setHistoryItems(updatedHist);
          localStorage.setItem("hexamIND_hist", JSON.stringify(updatedHist));
        }
      }
    } catch (err: any) {
      console.error(err);
      
      // Fallback
      const localCalculatedPayload = runMeihuaCalculation(
        resolvedTs,
        resolvedLat,
        resolvedLng,
        kineticSpeed
      );

      const isPositive = localCalculatedPayload.relationship.conclusion === "用生体" || localCalculatedPayload.relationship.conclusion === "体用比和" || localCalculatedPayload.relationship.conclusion === "体克用";
      const auspVal = localCalculatedPayload.relationship.auspiciousness;
      
      let finalVerdict = "Equilibrium";
      if (auspVal.includes("Extremely") || auspVal.includes("大吉") || auspVal.includes("Critical")) {
         finalVerdict = "Critical Advantage";
      } else if (auspVal.includes("Auspicious") || auspVal.includes("吉")) {
        finalVerdict = "Auspicious Growth";
      } else if (auspVal.includes("Leak") || auspVal.includes("泄")) {
        finalVerdict = "Leaking / Drainage";
      } else if (auspVal.includes("Exhausting") || auspVal.includes("平")) {
        finalVerdict = "Warning / Conflict";
      } else if (auspVal.includes("Equilibrium") || auspVal.includes("比和")) {
        finalVerdict = "Equilibrium";
      } else if (auspVal.includes("Inauspicious") || auspVal.includes("凶") || auspVal.includes("Risk")) {
        finalVerdict = "Systemic Risk";
      } else {
        const concl = localCalculatedPayload.relationship.conclusion;
        if (concl === "体用比和") {
          finalVerdict = "Equilibrium";
        } else if (concl === "用生体" || concl === "体克用") {
          finalVerdict = "Auspicious Growth";
        } else if (concl === "体生用") {
          finalVerdict = "Leaking / Drainage";
        } else {
          finalVerdict = "Systemic Risk";
        }
      }

      // Calculate San-Cai Confidence dynamically
      const gTime = getGanzhiTime(resolvedTs);
      const monthPart = gTime.split(" ")[1];
      const monthBranch = monthPart ? monthPart.charAt(1) : "巳";
      const calculatedConfidence = calculateSanCaiConfidence(
        localCalculatedPayload.tiGua.trigram.element,
        monthBranch,
        resolvedLat,
        resolvedLng,
        velocitiesRef.current
      );
      setConfidenceScore(calculatedConfidence);

      const localResult: DivinationApiResponse = {
        success: true,
        input: { question, latitude, longitude, kineticValue: kineticSpeed, timestamp: resolvedTs },
        payload: localCalculatedPayload,
        aiOutput: {
          verdict: finalVerdict,
          analysis: getLocalMeihuaAnalysis(localCalculatedPayload, language, gTime),
          tacticalAction: getFallbackActions(
            language,
            localCalculatedPayload.relationship.conclusion,
            localCalculatedPayload.tiGua.trigram.element,
            localCalculatedPayload.yongGua.trigram.element
          ),
          phenomenologicalEcho: t("phenomEcho2"),
          catalystWindow: language.startsWith("zh")
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "午时 (11:00-13:00)" : "卯时 (05:00-07:00)")
            : language === "ja"
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "午の刻 (11:00-13:00)" : "卯的刻 (05:00-07:00)")
            : language === "ko"
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "오시 (11:00-13:00)" : "묘시 (05:00-07:00)")
            : (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "Hour of the Horse (11:00-13:00)" : "Hour of the Rabbit (05:00-07:00)"),
          yaoInfo: {
            yaoCi: language.startsWith("zh")
              ? `本卦【${localCalculatedPayload.charts.original.name}】 动爻：第 ${localCalculatedPayload.changingLine} 爻`
              : `Hexagram [${localCalculatedPayload.charts.original.name}] Line ${localCalculatedPayload.changingLine}`,
            yaoExplanation: language.startsWith("zh")
              ? `时空序列触发本卦第 ${localCalculatedPayload.changingLine} 爻。`
              : `Spatial-temporal sequence triggered Line ${localCalculatedPayload.changingLine}.`,
            developmentDirection: language.startsWith("zh")
              ? `由本卦【${localCalculatedPayload.charts.original.name}】向变卦【${localCalculatedPayload.charts.transformed.name}】之第 ${localCalculatedPayload.changingLine} 爻位演进。请开启 GEMINI_API_KEY 以解锁高阶易学及周易经典爻辞深度分析。`
              : `Evolving towards Transformed Hexagram [${localCalculatedPayload.charts.transformed.name}] at Line ${localCalculatedPayload.changingLine}. Provide a valid GEMINI_API_KEY to unlock advanced historical YaoCi detail analysis.`
          }
        }
      };

      // Save successful transaction stats and cooldown
      localStorage.setItem("hexamind_quota_data", JSON.stringify({ date: todayStr, count: dailyCount + 1 }));
      localStorage.setItem("hexamind_last_query_time", Date.now().toString());

      setApiResult(localResult);
      setIsLeftPanelCollapsed(true);

      const hItem: DivinationHistoryItem = {
        id: `cast-${Date.now()}`,
        date: new Date(resolvedTs).toISOString(),
        question,
        originalGua: localCalculatedPayload.charts.original.name,
        conclusion: localCalculatedPayload.relationship.conclusion,
        auspiciousness: localCalculatedPayload.relationship.auspiciousness,
        confidenceScore: calculatedConfidence,
        aiOutput: localResult.aiOutput,
        latitude: localCalculatedPayload.spatialSeed.lat,
        longitude: localCalculatedPayload.spatialSeed.lng,
        kineticValue: localCalculatedPayload.kineticSeed.rawValue,
        timestamp: localCalculatedPayload.temporalSeed.rawValue
      };

      setActiveHistoryId(hItem.id);

      let updated = [hItem, ...historyItems];
      if (userTier === "Free") {
        // Keep strictly in memory - no database persistence per PRD rules
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        updated = updated.filter(h => new Date(h.date).getTime() > sevenDaysAgo);
        setHistoryItems(updated);
      } else {
        setHistoryItems(updated);
        localStorage.setItem("hexamIND_hist", JSON.stringify(updated));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Inspect previous item from Local History log
  const handleSelectHistory = (id: string) => {
    setActiveHistoryId(id);
    setIsLeftPanelCollapsed(true);
    let item = historyItems.find((h) => h.id === id);
    if (!item && id.startsWith("auto-monthly")) {
      item = getAutomatedMonthlyPushes(language).find(p => p.id === id);
    }
    if (!item) return;

    const dateNum = new Date(item.date).getTime();
    
    // Resolve inputs using historical data first, fallback to current input state
    const resolvedLat = item.latitude !== undefined ? item.latitude : (latitude === "" ? 31.23 : latitude);
    const resolvedLng = item.longitude !== undefined ? item.longitude : (longitude === "" ? 121.47 : longitude);
    const resolvedKinetic = item.kineticValue !== undefined ? item.kineticValue : kineticSpeed;
    const resolvedTimestamp = item.timestamp !== undefined ? item.timestamp : dateNum;

    // Sync input states to match the historical coordinates, speed and timestamp
    if (item.latitude !== undefined) setLatitude(item.latitude);
    if (item.longitude !== undefined) setLongitude(item.longitude);
    if (item.kineticValue !== undefined) setKineticSpeed(item.kineticValue);
    if (item.timestamp !== undefined) setTimestamp(item.timestamp);

    const reconstructedPayload = runMeihuaCalculation(
      resolvedTimestamp,
      resolvedLat,
      resolvedLng,
      resolvedKinetic
    );

    const isPositive = reconstructedPayload.relationship.conclusion === "用生体" || reconstructedPayload.relationship.conclusion === "体用比和" || reconstructedPayload.relationship.conclusion === "体克用";
    const auspVal = item.auspiciousness;
    
    let finalVerdict = "Equilibrium";
    if (auspVal.includes("Extremely") || auspVal.includes("大吉") || auspVal.includes("Critical")) {
      finalVerdict = "Critical Advantage";
    } else if (auspVal.includes("Auspicious") || auspVal.includes("吉")) {
      finalVerdict = "Auspicious Growth";
    } else if (auspVal.includes("Leak") || auspVal.includes("泄")) {
      finalVerdict = "Leaking / Drainage";
    } else if (auspVal.includes("Exhausting") || auspVal.includes("平")) {
      finalVerdict = "Warning / Conflict";
    } else if (auspVal.includes("Equilibrium") || auspVal.includes("比和")) {
      finalVerdict = "Equilibrium";
    } else if (auspVal.includes("Systemic") || auspVal.includes("Highly Inauspicious") || auspVal.includes("凶") || auspVal.includes("Inauspicious")) {
      finalVerdict = "Systemic Risk";
    } else {
      const concl = reconstructedPayload.relationship.conclusion;
      if (concl === "体用比和") {
        finalVerdict = "Equilibrium";
      } else if (concl === "用生体" || concl === "体克用") {
        finalVerdict = "Auspicious Growth";
      } else if (concl === "体生用") {
        finalVerdict = "Leaking / Drainage";
      } else {
        finalVerdict = "Systemic Risk";
      }
    }

    // Load or calculate San-Cai confidence
    let finalConfidence = item.confidenceScore;
    if (finalConfidence === undefined) {
      const histGTime = getGanzhiTime(resolvedTimestamp);
      const hMonthPart = histGTime.split(" ")[1];
      const hMonthBranch = hMonthPart ? hMonthPart.charAt(1) : "巳";
      finalConfidence = calculateSanCaiConfidence(
        reconstructedPayload.tiGua.trigram.element,
        hMonthBranch,
        resolvedLat,
        resolvedLng,
        []
      );
    }
    setConfidenceScore(finalConfidence);

    const reResult: DivinationApiResponse = {
      success: true,
      input: {
        question: item.question,
        latitude: resolvedLat,
        longitude: resolvedLng,
        kineticValue: resolvedKinetic,
        timestamp: resolvedTimestamp
      },
      payload: reconstructedPayload,
      aiOutput: item.aiOutput || {
        verdict: finalVerdict,
        analysis: getLocalMeihuaAnalysis(reconstructedPayload, language, getGanzhiTime(resolvedTimestamp)),
        tacticalAction: getFallbackActions(
          language,
          reconstructedPayload.relationship.conclusion,
          reconstructedPayload.tiGua.trigram.element,
          reconstructedPayload.yongGua.trigram.element
        ),
        phenomenologicalEcho: t("historyLockedEcho"),
        catalystWindow: "Double-hours of peak elemental coordination.",
        yaoInfo: {
          yaoCi: language.startsWith("zh")
            ? `本卦【${reconstructedPayload.charts.original.name}】 动爻：第 ${reconstructedPayload.changingLine} 爻`
            : `Hexagram [${reconstructedPayload.charts.original.name}] Line ${reconstructedPayload.changingLine}`,
          yaoExplanation: language.startsWith("zh")
            ? `时空序列触发本卦第 ${reconstructedPayload.changingLine} 爻。`
            : `Spatial-temporal sequence triggered Line ${reconstructedPayload.changingLine}.`,
          developmentDirection: language.startsWith("zh")
            ? `由本卦【${reconstructedPayload.charts.original.name}】向变卦【${reconstructedPayload.charts.transformed.name}】之第 ${reconstructedPayload.changingLine} 爻位演进。请开启 GEMINI_API_KEY 以解锁高阶易学及周易经典爻辞深度分析。`
            : `Evolving towards Transformed Hexagram [${reconstructedPayload.charts.transformed.name}] at Line ${reconstructedPayload.changingLine}. Provide a valid GEMINI_API_KEY to unlock advanced historical YaoCi detail analysis.`
        }
      }
    };

    setApiResult(reResult);
    setQuestion(item.question);
  };

  const handleDeleteHistory = (id: string) => {
    if (id.startsWith("auto-monthly")) {
      const updatedHidden = [...hiddenAutoIds, id];
      setHiddenAutoIds(updatedHidden);
      localStorage.setItem("hexamIND_hidden_auto_ids", JSON.stringify(updatedHidden));
    } else {
      const updated = historyItems.filter((h) => h.id !== id);
      setHistoryItems(updated);
      localStorage.setItem("hexamIND_hist", JSON.stringify(updated));
    }
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setApiResult(null);
      setIsLeftPanelCollapsed(false);
    }
  };

  const handleClearAllHistory = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }
    setHistoryItems([]);
    localStorage.removeItem("hexamIND_hist");

    // Hide/dismiss all automated push items
    const allAutoIds = getAutomatedMonthlyPushes(language).map(item => item.id);
    setHiddenAutoIds(allAutoIds);
    localStorage.setItem("hexamIND_hidden_auto_ids", JSON.stringify(allAutoIds));

    setActiveHistoryId(null);
    setApiResult(null);
    setIsLeftPanelCollapsed(false);
    setIsConfirmingClear(false);
  };

  // Verdict design aesthetics mapper (supports isDark conditionally in light/dark mode)
  const getVerdictCardStyles = (ver?: string) => {
    const defaultColor = isDark
      ? "bg-white/5 text-white/85 bg-white/20"
      : "bg-slate-100 text-slate-800 bg-slate-200";

    switch (ver) {
      case "Critical Advantage":
      case "Extremely Auspicious":
      case "大吉":
        return {
          bg: isDark 
            ? "text-rose-400 bg-rose-950/20" 
            : "text-rose-800 bg-rose-50/40",
          text: isDark ? "text-rose-400" : "text-rose-800",
          iconColor: "text-rose-500",
          badge: "bg-rose-500 text-white",
          desc: t("descExtremAusp")
        };
      case "Auspicious Growth":
      case "Auspicious":
      case "吉":
        return {
          bg: isDark ? "text-rose-300 bg-rose-950/20" : "text-rose-800 bg-rose-50/40",
          text: isDark ? "text-rose-400" : "text-rose-800",
          iconColor: "text-rose-500",
          badge: "bg-rose-500 text-white",
          desc: t("descAusp")
        };
      case "Equilibrium":
      case "体用比和":
        return {
          bg: isDark ? "bg-white/5" : "bg-white",
          text: isDark ? "text-white/90" : "text-slate-900",
          iconColor: "text-slate-400 dark:text-white/40",
          badge: isDark ? "bg-white/10 text-white" : "bg-slate-800 text-white",
          desc: t("descEquil")
        };
      case "Leaking / Drainage":
      case "Leak":
      case "泄":
        return {
          bg: isDark ? "text-rose-300 bg-rose-950/15" : "text-rose-800 bg-rose-50/30",
          text: isDark ? "text-rose-400" : "text-rose-800",
          iconColor: "text-rose-500",
          badge: isDark ? "bg-white/10 text-white" : "bg-slate-700 text-white",
          desc: t("descLeak")
        };
      case "Warning / Conflict":
      case "Exhausting":
      case "平":
        return {
          bg: isDark ? "text-rose-300 bg-rose-950/15" : "text-rose-800 bg-rose-50/35",
          text: isDark ? "text-rose-400" : "text-rose-800",
          iconColor: "text-rose-400",
          badge: "bg-rose-500 text-white",
          desc: t("descWarning")
        };
      case "Systemic Risk":
      case "Highly Inauspicious":
      case "凶":
        return {
          bg: isDark ? "text-rose-300 bg-rose-950/20" : "text-rose-800 bg-rose-50/40",
          text: isDark ? "text-rose-400" : "text-rose-800",
          iconColor: "text-rose-400",
          badge: "bg-rose-550 text-white bg-rose-600",
          desc: t("descRisk")
        };
      default:
        return {
          bg: isDark ? "bg-white/5" : "bg-white",
          text: isDark ? "text-white/80" : "text-slate-800",
          iconColor: isDark ? "text-white/40" : "text-slate-400",
          badge: defaultColor,
          desc: t("defaultVerdictDesc")
        };
    }
  };

  const activeVerdict = apiResult?.aiOutput?.verdict;
  const cardStyle = getVerdictCardStyles(activeVerdict);

  const getVerdictTranslationKey = (ver?: string) => {
    switch (ver) {
      case "Critical Advantage":
      case "Extremely Auspicious":
      case "大吉":
        return "ausp_ExtremAusp";
      case "Auspicious Growth":
      case "Auspicious":
      case "吉":
        return "ausp_Ausp";
      case "Equilibrium":
      case "体用比和":
        return "ausp_Equil";
      case "Leaking / Drainage":
      case "Leak":
      case "泄":
        return "ausp_Leak";
      case "Warning / Conflict":
      case "Exhausting":
      case "平":
        return "ausp_Warning";
      case "Systemic Risk":
      case "Highly Inauspicious":
      case "凶":
        return "ausp_Risk";
      default:
        return "ausp_Equil";
    }
  };

  // Helper to calculate auspicious element cycle and zodiac days based on Ti Element
  const getPrimeCoordinatingDetails = () => {
    if (!apiResult?.payload?.tiGua?.trigram) return null;
    const element = apiResult.payload.tiGua.trigram.element;
    
    // Normalizing element key to English
    let normalizedElement = element;
    if (element === "金") normalizedElement = "Metal";
    if (element === "木") normalizedElement = "Wood";
    if (element === "水") normalizedElement = "Water";
    if (element === "火") normalizedElement = "Fire";
    if (element === "土") normalizedElement = "Earth";

    const localizations: Record<string, Record<string, { element: string, zodiacs: string, favorableDays: string }>> = {
      "en": {
        "Metal": {
          element: "Earth generates Metal",
          zodiacs: "Ox, Dragon, Goat, Dog",
          favorableDays: "Chou, Chen, Wei, Xu Days"
        },
        "Wood": {
          element: "Water generates Wood",
          zodiacs: "Rat, Pig",
          favorableDays: "Zi, Hai Days"
        },
        "Water": {
          element: "Metal generates Water",
          zodiacs: "Monkey, Rooster",
          favorableDays: "Shen, You Days"
        },
        "Fire": {
          element: "Wood generates Fire",
          zodiacs: "Tiger, Rabbit",
          favorableDays: "Yin, Mao Days"
        },
        "Earth": {
          element: "Fire generates Earth",
          zodiacs: "Snake, Horse",
          favorableDays: "Si, Wu Days"
        }
      },
      "zh-CN": {
        "Metal": {
          element: "土生金",
          zodiacs: "牛、龙、羊、狗",
          favorableDays: "丑日、辰日、未日、戌日"
        },
        "Wood": {
          element: "水生木",
          zodiacs: "鼠、猪",
          favorableDays: "子日、亥日"
        },
        "Water": {
          element: "金生水",
          zodiacs: "猴、鸡",
          favorableDays: "申日、酉日"
        },
        "Fire": {
          element: "木生火",
          zodiacs: "虎、兔",
          favorableDays: "寅日、卯日"
        },
        "Earth": {
          element: "火生土",
          zodiacs: "蛇、马",
          favorableDays: "巳日、午日"
        }
      },
      "zh-TW": {
        "Metal": {
          element: "土生金",
          zodiacs: "牛、龍、羊、狗",
          favorableDays: "丑日、辰日、未日、戌日"
        },
        "Wood": {
          element: "水生木",
          zodiacs: "鼠、豬",
          favorableDays: "子日、亥日"
        },
        "Water": {
          element: "金生水",
          zodiacs: "猴、雞",
          favorableDays: "申日、酉日"
        },
        "Fire": {
          element: "木生火",
          zodiacs: "虎、兔",
          favorableDays: "寅日、卯日"
        },
        "Earth": {
          element: "火生土",
          zodiacs: "蛇、馬",
          favorableDays: "巳日、午日"
        }
      },
      "ja": {
        "Metal": {
          element: "土生金 (土が金を生む)",
          zodiacs: "丑 (うし)、辰 (たつ)、未 (ひつじ)、戌 (いぬ)",
          favorableDays: "丑の日、辰の日、未の日、戌の日"
        },
        "Wood": {
          element: "水生木 (水が木を生む)",
          zodiacs: "子 (ね)、亥 (いのしし)",
          favorableDays: "子の日、亥の日"
        },
        "Water": {
          element: "金生水 (金が水を生む)",
          zodiacs: "申 (さる)、酉 (とり)",
          favorableDays: "申の日、酉の日"
        },
        "Fire": {
          element: "木生火 (木が火を生む)",
          zodiacs: "寅 (とら)、卯 (うさぎ)",
          favorableDays: "寅の日、卯の日"
        },
        "Earth": {
          element: "火生土 (火が土を生む)",
          zodiacs: "巳 (み)、午 (うま)",
          favorableDays: "巳の日、午の日"
        }
      },
      "ko": {
        "Metal": {
          element: "토생금 (토가 금을 생함)",
          zodiacs: "소 (축), 용 (진), 양 (미), 개 (술)",
          favorableDays: "축일, 진일, 미일, 술일"
        },
        "Wood": {
          element: "수생목 (수가 목을 생함)",
          zodiacs: "쥐 (자), 돼지 (해)",
          favorableDays: "자일, 해일"
        },
        "Water": {
          element: "금생수 (금이 수를 생함)",
          zodiacs: "원숭이 (신), 닭 (유)",
          favorableDays: "신일, 유일"
        },
        "Fire": {
          element: "목생화 (목이 화를 생함)",
          zodiacs: "호랑이 (인), 토끼 (묘)",
          favorableDays: "인일, 묘일"
        },
        "Earth": {
          element: "화생토 (화가 토를 생함)",
          zodiacs: "뱀 (사), 말 (오)",
          favorableDays: "사일, 오일"
        }
      },
      "es": {
        "Metal": {
          element: "La Tierra genera el Metal",
          zodiacs: "Buey, Dragón, Cabra, Perro",
          favorableDays: "Días de Buey (Chou), Dragón (Chen), Cabra (Wei), Perro (Xu)"
        },
        "Wood": {
          element: "El Agua genera la Madera",
          zodiacs: "Rata, Cerdo",
          favorableDays: "Días de Rata (Zi), Cerdo (Hai)"
        },
        "Water": {
          element: "El Metal genera el Agua",
          zodiacs: "Mono, Gallo",
          favorableDays: "Días de Mono (Shen), Gallo (You)"
        },
        "Fire": {
          element: "La Madera genera el Fuego",
          zodiacs: "Tigre, Conejo",
          favorableDays: "Días de Tigre (Yin), Conejo (Mao)"
        },
        "Earth": {
          element: "El Fuego genera la Tierra",
          zodiacs: "Serpiente, Caballo",
          favorableDays: "Días de Serpiente (Si), Caballo (Wu)"
        }
      },
      "id": {
        "Metal": {
          element: "Tanah menghasilkan Logam",
          zodiacs: "Kerbau, Naga, Kambing, Anjing",
          favorableDays: "Hari Kerbau (Chou), Naga (Chen), Kambing (Wei), Anjing (Xu)"
        },
        "Wood": {
          element: "Air menghasilkan Kayu",
          zodiacs: "Tikus, Babi",
          favorableDays: "Hari Tikus (Zi), Babi (Hai)"
        },
        "Water": {
          element: "Logam menghasilkan Air",
          zodiacs: "Monyet, Ayam",
          favorableDays: "Hari Monyet (Shen), Ayam (You)"
        },
        "Fire": {
          element: "Kayu menghasilkan Api",
          zodiacs: "Harimau, Kelinci",
          favorableDays: "Hari Harimau (Yin), Kelinci (Mao)"
        },
        "Earth": {
          element: "Api menghasilkan Tanah",
          zodiacs: "Ular, Kuda",
          favorableDays: "Hari Ular (Si), Kuda (Wu)"
        }
      },
      "ms": {
        "Metal": {
          element: "Tanah menghasilkan Logam",
          zodiacs: "Kerbau, Naga, Kambing, Anjing",
          favorableDays: "Hari Kerbau (Chou), Naga (Chen), Kambing (Wei), Anjing (Xu)"
        },
        "Wood": {
          element: "Air menghasilkan Kayu",
          zodiacs: "Tikus, Babi",
          favorableDays: "Hari Tikus (Zi), Babi (Hai)"
        },
        "Water": {
          element: "Logam menghasilkan Air",
          zodiacs: "Monyet, Ayam",
          favorableDays: "Hari Monyet (Shen), Ayam (You)"
        },
        "Fire": {
          element: "Kayu menghasilkan Api",
          zodiacs: "Harimau, Kelinci",
          favorableDays: "Hari Harimau (Yin), Kelinci (Mao)"
        },
        "Earth": {
          element: "Api menghasilkan Tanah",
          zodiacs: "Ular, Kuda",
          favorableDays: "Hari Ular (Si), Kuda (Wu)"
        }
      },
      "th": {
        "Metal": {
          element: "ดินส่งเสริมทองคำ",
          zodiacs: "ฉลู (วัว), มะโรง (มังกร), มะแม (แพะ), จอ (สุนัข)",
          favorableDays: "วันฉลู (ทิสทวด), วันมะโรง, วันมะแม, วันจอ"
        },
        "Wood": {
          element: "น้ำส่งเสริมไม้",
          zodiacs: "ชวด (หนู), กุน (หมู)",
          favorableDays: "วันชวด, วันกุน"
        },
        "Water": {
          element: "ทองคำส่งเสริมน้ำ",
          zodiacs: "วอก (ลิง), ระกา (ไก่)",
          favorableDays: "วันวอก, วันระกา"
        },
        "Fire": {
          element: "ไม้ส่งเสริมไฟ",
          zodiacs: "ขาล (เสือ), เถาะ (กระต่าย)",
          favorableDays: "วันขาล, วันเถาะ"
        },
        "Earth": {
          element: "ไฟส่งเสริมดิน",
          zodiacs: "มะเส็ง (งูเล็ก), มะเมีย (ม้า)",
          favorableDays: "วันมะเส็ง, วันมะเมีย"
        }
      }
    };

    const currentLocal = localizations[language] || localizations["en"];
    return currentLocal[normalizedElement] || {
      element: language.startsWith("zh") ? "比和生助" : language === "ja" ? "比和生助 (互いに助け合う)" : "Mutual Elemental Assistance",
      zodiacs: language.startsWith("zh") ? "鼠、龙、猴" : language === "ja" ? "子、辰、申" : "Rat, Dragon, Monkey",
      favorableDays: language.startsWith("zh") ? "生肖吉星时刻" : language === "ja" ? "吉星の並ぶ時間帯" : "Auspicious alignment phases"
    };
  };

  const getCorporateCounselElementTranslation = (rawElement: string, lang: string) => {
    const isZh = lang.startsWith("zh");
    let elementKey = rawElement;
    if (rawElement.includes("金") || rawElement.includes("Metal") || rawElement.includes("generates Metal")) elementKey = "Metal";
    if (rawElement.includes("木") || rawElement.includes("Wood") || rawElement.includes("generates Wood")) elementKey = "Wood";
    if (rawElement.includes("水") || rawElement.includes("Water") || rawElement.includes("generates Water")) elementKey = "Water";
    if (rawElement.includes("火") || rawElement.includes("Fire") || rawElement.includes("generates Fire")) elementKey = "Fire";
    if (rawElement.includes("土") || rawElement.includes("Earth") || rawElement.includes("generates Earth")) elementKey = "Earth";

    if (!isZh) {
      switch (elementKey) {
        case "Metal":
          return "Injecting 'Earth' operations (e.g. consolidation of physical resources, securing stable backend assets) nourishes and defends your 'Metal' asset class.";
        case "Wood":
          return "Injecting 'Water' operations (e.g. maintaining strategic adaptation, introducing flexible agreements, securing reserve buffer capital) clears growth bottlenecks of your 'Wood' asset class.";
        case "Water":
          return "Injecting 'Metal' operations (e.g. tightening corporate compliance frameworks, allocating hard collateral, executing strategic hedging) directly protects and nourishes your liquidity ('Water' asset).";
        case "Fire":
          return "Injecting 'Wood' operations (e.g. extending contract credit periods, mobilizing strategic partnerships, building buffer stocks) fuels and sustains your 'Fire' asset with continuous momentum.";
        case "Earth":
          return "Injecting 'Fire' operations (e.g. accelerating active execution velocity, conducting high-profile concentrated launches) builds structural solidity and fast implementation of your 'Earth' asset.";
        default:
          return "Combining supporting elements will enrich your organizational core and shield your asset.";
      }
    }

    switch (elementKey) {
      case "Metal":
        return "引入【土】属性策略（如：巩固有形实体资产、提供基建支撑、设计稳健底盘）能有效筑牢决策根基，滋养并维护您的【金】属性防线与流动性。";
      case "Wood":
        return "引入【水】属性策略（如：保持长线战略定力、设计灵活性缓冲条款、配置额外预算资金）能合理打破扩张瓶颈，滋养并维护您的【木】属性成长空间。";
      case "Water":
        return "引入【金】属性策略（如：收紧风控合规、划拨硬性资产抵押、配置套期保值）可对冲外部的不确定性耗损，安全级数极大，能长效滋养您的【水】属性流动资产。";
      case "Fire":
        return "引入【木】属性策略（如：拉长账期增加周转弹性、寻求战略同盟背书、注入预留周转时间）能作为完美的缓冲对冲量，为【火】属性决策提供源源不断的长驱能量。";
      case "Earth":
        return "引入【火】属性策略（如：提升即时执行速率、集中高频资源宣发、快速突破关键决策）能够快速激发大局势的能效比，实现您的【土】属性稳健项目快速落地。";
      default:
        return "合理配置相生生助因素，能长效滋养您这一方的核心资产，稳步防御外部风险。";
    }
  };

  const getCorporateCounselCalendarExplanation = (zodiacs: string, favorableDays: string, lang: string) => {
    const isZh = lang.startsWith("zh");
    if (!isZh) {
      return `Suggested calendar execution timeframe: Select days in your planner characterized by the zodiac signs [${zodiacs}] (corresponding to ${favorableDays} in the 12 earthly branch cycle) to declare actions, execute trades, or close contracts to capitalize on high-resonance advantage.`;
    }
    return `建议您比对您的工作月历，选择传统干支历法中对应【${zodiacs}】（即对应的地支：${favorableDays}，这在普通手机日历、万年历 App 或黄历中均直接标有生肖属性或地支名称）的日子，来作为签署重要合同、部署关键商业项目或执行重要财务交易的执行时机。这些特定日期的能量气场与您的核心能级具有极强的共鸣与相生生助关系，能天然赋予您最优越的天时进展优势。`;
  };

  const getUnifiedAssetSynergyDetails = (elementKey: string, lang: string) => {
    const isZh = lang.startsWith("zh");
    const isTw = lang === "zh-TW";
    
    if (isZh) {
      switch (elementKey) {
        case "Metal":
          return {
            synergyComponent: isTw 
              ? "主體資本屬金，當前最佳協同能量為【土】。這意味著在執行期內，主動鞏固有形實體資產、提供基建支撑或設計穩健底盤（土屬性行為），將產生‘土生金’的良性催化鍊。"
              : "主体资本属金，当前最佳协同能量为【土】。这意味着在执行期内，主动巩固有形实体资产、提供基建支撑或设计稳健底盘（土属性行为），将产生‘土生金’的良性催化链。",
            resonantTimeline: isTw
              ? "系統精算顯示，未來時間軸中【丑日（土旺）】、【辰日（土旺）】、【未日（土旺）】與【戌日（土旺）】為最強外部地利共振點。建議將核心合同簽署、資金劃撥或關鍵談判對攻，剛性排配這四个時間窗口内執行，以獲取最高的時間溢價與風險沖減。"
              : "系统精算显示，未来时间轴中【丑日（土旺）】、【辰日（土旺）】、【未日（土旺）】与【戌日（土旺）】为最强外部地利共振点。建议将核心合同签署、资金划拨或关键谈判对攻，刚性排配在这四个时间窗口内执行，以获取最高的周期溢价与风险冲减。"
          };
        case "Wood":
          return {
            synergyComponent: isTw
              ? "主體資本屬木，當前最佳協同能量為【水】。這意味著在執行期內，主動保持長線戰略定力、設計靈活性緩衝條款或配置額外預算資金（水屬性行為），將產生‘水生木’的良性催化鍊。"
              : "主体资本属木，当前最佳协同能量为【水】。这意味着在执行期内，主动保持长线战略定力、设计灵活性缓冲条款或配置额外预算资金（水属性行为），将产生‘水生木’的良性催化链。",
            resonantTimeline: isTw
              ? "系統精算顯示，未來時間軸中【子日（水旺）】與【亥日（水旺）】為最強外部地利共振點。建議將核心合同簽署、資金劃撥或關鍵談判對攻，剛性排配在這兩個時間窗口內執行，以獲取最高的時間溢價與風險沖減。"
              : "系统精算显示，未来时间轴中【子日（水旺）】与【亥日（水旺）】为最强外部地利共振点。建议将核心合同签署、资金拨付或关键谈判对攻，刚性排配在这两个时间窗口内执行，以获取最高的周期溢价与风险冲减。"
          };
        case "Water":
          return {
            synergyComponent: isTw
              ? "主體資本屬水，當前最佳協同能量為【金】。這意味著在執行期內，主動收緊風控合規、劃撥硬性資產抵押或配置套期保值（金屬性行為），將產生‘金生水’的良性催化鍊。"
              : "主体资本属水，当前最佳协同能量为【金】。这意味着在执行期内，主动收紧风控合规、划拨硬性资产抵押 or 配置套期保值（金属性行为），将产生‘金生水’的良性催化链。",
            resonantTimeline: isTw
              ? "系統精算顯示，未來時間軸中【申日（金旺）】與【酉日（金旺）】為最強外部地利共振點。建議將核心合同簽署、資金劃撥或關鍵談判對攻，剛性排配在這兩個時間窗口內執行，以獲取最高的時間溢价與風險沖減。"
              : "系统精算显示，未来时间轴中【申日（金旺）】与【酉日（金旺）】为最强外部地利共振点。建议将核心合同签署、资金划拨或关键谈判对攻，刚性排配在这两个时间窗口内执行，以获取最高的周期溢价与风险冲减。"
          };
        case "Fire":
          return {
            synergyComponent: isTw
              ? "主體資本屬火，當前最佳協同能量為【木】。這意味著在執行期內，主動增加策略耐性、讓利賬期或追加技術研發投入（木屬性行為），將產生‘木生火’的良性催化鍊。"
              : "主体资本属火，当前最佳协同能量为【木】。这意味着在执行期内，主动增加策略耐性、让利账期或追加技术研发投入（木属性行为），将产生‘木生火’的良性催化链。",
            resonantTimeline: isTw
              ? "系統精算顯示，未來時間軸中【寅日（木旺）】與【卯日（木旺）】為最強外部地利共振點。建議將核心合同簽署、資金劃撥或關鍵談判對攻，剛性排配在這兩個時間窗口內執行，以獲取最高的時間溢價與風險沖減。"
              : "系统精算显示，未来时间轴中【寅日（木旺）】与【卯日（木旺）】为最强外部地利共振点。建议将核心合同签署、资金划拨或关键谈判对攻，刚性排配在这两个时间窗口内执行，以获取最高的周期溢价与风险冲减。"
          };
        case "Earth":
          return {
            synergyComponent: isTw
              ? "主體資本屬土，當前最佳協同能量為【火】。這意味著在執行期內，主動提升即時執行速率、集中高頻資源宣發或快速突破關鍵決策（火屬性行為），將產生‘火生土’的良性催化鍊。"
              : "主体资本属土，当前最佳协同能量为【火】。这意味着在执行期内，主动提升即时执行速率、集中高频资源宣发或快速突破关键决策（火属性行为），将产生‘火生土’的良性催化链。",
            resonantTimeline: isTw
              ? "系統精算顯示，未來時間軸中【巳日（火旺）】與【午日（火旺）】為最強外部地利共振點。建議將核心合同簽署、資金劃撥或關鍵談判對攻，剛性排配在這兩個時間窗口內執行，以獲取最高的時間溢價與風險沖減。"
              : "系统精算显示，未来时间轴中【巳日（火旺）】与【午日（火旺）】为最强外部地利共振点。建议将核心合同签署、资金划拨或关键谈判对攻，刚性排配在这两个时间窗口内执行，以获取最高的周期溢价与风险冲减。"
          };
        default:
          return {
            synergyComponent: "合理配置相生生助因素，能长效滋养您这一方的核心资产，稳步防御外部风险。",
            resonantTimeline: "建议参考您工作月历中的生肖及地支日子进行关键排期。"
          };
      }
    }
    
    // Fallback/Translations for non-Chinese languages
    switch (elementKey) {
      case "Metal":
        return {
          synergyComponent: lang === "ja" 
            ? "主体資本は土が金を生むサイクルです。有形資産を固め、インフラ支持や安定的なポートフォリオを強化することが、あなたの金属性資産を守る良質な触媒となります。"
            : "TI Asset belongs to Metal; the current optimal synergetic energy is [Earth]. Actively strengthening physical assets, core foundations, or stable reserve systems (Earth-based tactics) triggers an 'Earth generates Metal' protective feedback loop.",
          resonantTimeline: lang === "ja"
            ? "システムの算定によると、【丑の日】、【辰の日】、【未の日】、【戌の日】が最良の共鳴タイミングです。重要契約의締結などをこの窓口に配分することが推奨されます。"
            : "System calculation indicates that Chou, Chen, Wei, and Xu (Earth) days represent the absolute strongest resonant timelines. Schedule critical agreement signing or capital deployments within these windows to capture premium mitigation."
        };
      case "Wood":
        return {
          synergyComponent: lang === "ja"
            ? "主体資本は水が木を生むサイクルです。戦略的定力を保ち、弾力的なバッファ予算を配置することが、あなたの木属性資産を拡大させる良質な触媒となります。"
            : "TI Asset belongs to Wood; the current optimal synergetic energy is [Water]. Actively maintaining strategic patience, flexible buffer agreements, or extra reserve backing (Water-based tactics) triggers a 'Water generates Wood' developmental cycle.",
          resonantTimeline: lang === "ja"
            ? "システムの算定によると、【子の日】および【亥の日】が最良の共鳴タイミングです。重要交渉や意思決定をこの窓口に配分することが推奨されます。"
            : "System calculation indicates that Zi and Hai (Water) days represent the absolute strongest resonant timelines. Schedule critical trade alignments or tactical agreements within these windows to yield maximum structural premiums."
        };
      case "Water":
        return {
          synergyComponent: lang === "ja"
            ? "主体資本は金が水を生むサイクルです。監査規約を締め、物理的担保を配備することが、あなたの水属性（流動性資本）に長期的で安全な養分を与えます。"
            : "TI Asset belongs to Water; the current optimal synergetic energy is [Metal]. Actively tightening auditing safeguards, designating solid collateral, or executing safety hedges (Metal-based tactics) triggers a 'Metal generates Water' nurturing defense pipeline.",
          resonantTimeline: lang === "ja"
            ? "システムの算定によると、【申の日】および【酉の日】が最良の共鳴タイミングです。重要交渉や意思決定をこの窓口に配分することが推奨されます。"
            : "System calculation indicates that Shen and You (Metal) days represent the absolute strongest resonant timelines. Lock key negotiations or transactional settlements into these cycles to command superior security margins."
        };
      case "Fire":
        return {
          synergyComponent: lang === "ja"
            ? "主体資本は木が火を生むサイクルです。戦略的耐久性を高め、取引条件を調整し、追加开发投資を注入することが、あなたの火属性資本を持続的に燃え立たせる良質な触媒となります。"
            : "TI Asset belongs to Fire; the current optimal synergetic energy is [Wood]. Actively increasing strategic patience, easing payment credit terms, or appending core technical research (Wood-based tactics) creates a robust 'Wood generates Fire' continuous momentum multiplier.",
          resonantTimeline: lang === "ja"
            ? "システムの算定によると、【寅の日】および【卯の日】が最良の共鳴タイミングです。重要計画の実行をこの窓口に配分することが推奨されます。"
            : "System calculation indicates that Yin and Mao (Wood) days represent the absolute strongest resonant timelines. Align key contract signings or trade declarations into these windows to harvest maximum cyclical premiums."
        };
      case "Earth":
        return {
          synergyComponent: lang === "ja"
            ? "主体資本は火が土を生むサイクルです。即座の実行率を高め、集中プロモーションを実施することが、あなたの土属性資本を急速に強固にする良質な触媒となります。"
            : "TI Asset belongs to Earth; the current optimal synergetic energy is [Fire]. Actively increasing project implementation velocity, amplifying marketing declarations, or seizing breakthrough decisions (Fire-based tactics) fosters a 'Fire generates Earth' quick-win realization path.",
          resonantTimeline: lang === "ja"
            ? "システムの算定によると、【巳の日】および【午の日】が最良の共鳴タイミングです。主要キャンペーンの実行をこの窓口に配分することが推奨されます。"
            : "System calculation indicates that Si and Wu (Fire) days represent the absolute strongest resonant timelines. Infuse major product pushes or decisive contract settlements into these dates to scale up growth velocity effortlessly."
        };
      default:
        return {
          synergyComponent: "Balanced element configuration sustains asset growth and defends core parameters from external stress vectors.",
          resonantTimeline: "Check your regional calendars for matching astrological branch parameters to execute key operations."
        };
    }
  };

  const getChartTitle = (type: "original" | "nuclear" | "transformed", lang: string) => {
    const map: Record<string, Record<string, string>> = {
      "en": { original: "Original Chart", nuclear: "Nuclear Chart", transformed: "Transformed Chart" },
      "zh-CN": { original: "本卦", nuclear: "互卦", transformed: "变卦" },
      "zh-TW": { original: "本卦", nuclear: "互卦", transformed: "變卦" },
      "ja": { original: "本卦", nuclear: "互卦", transformed: "変卦" },
      "ko": { original: "본괘", nuclear: "호괘", transformed: "변괘" },
      "es": { original: "Hexagrama Inicial", nuclear: "Hexagrama Intermedio", transformed: "Hexagrama Resultante" },
      "id": { original: "Heksagram Asal", nuclear: "Heksagram Nuklir", transformed: "Heksagram Transformatif" },
      "ms": { original: "Heksagram Asal", nuclear: "Heksagram Nuklir", transformed: "Heksagram Transformatif" },
      "th": { original: "มณฑลตั้งต้น", nuclear: "มณฑลส่งผ่าน", transformed: "มณฑลแปรรูป" }
    };
    const langMap = map[lang] || map["en"];
    return langMap[type];
  };

  const renderAnalysis = (text: string) => {
    const isLocalFallback = text.includes("本地流控推演") || text.includes("Local Analytic Engine");
    if (!isLocalFallback) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
    
    // Parse Sections from the raw fallback text
    const sections: { title: string; content: string[] }[] = [];
    const lines = text.split("\n");
    let currentSection: { title: string; content: string[] } | null = null;
    let introLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Detect section headers
      if (
        trimmed.includes("【体用生克分析】") ||
        trimmed.includes("【本卦与变卦断意】") ||
        trimmed.includes("【全面玄学综述】") ||
        trimmed.includes("1️⃣") ||
        trimmed.includes("2️⃣") ||
        trimmed.includes("3️⃣") ||
        trimmed.includes("Ti-Yong Interaction") ||
        trimmed.includes("Hexagram Evolution") ||
        trimmed.includes("Synthesized Prediction")
      ) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { title: trimmed, content: [] };
      } else if (currentSection) {
        currentSection.content.push(trimmed);
      } else {
        introLines.push(trimmed);
      }
    }
    if (currentSection) {
      sections.push(currentSection);
    }

    return (
      <div className="space-y-4 font-sans text-xs">
        {introLines.length > 0 && (
          <div className={`p-3 rounded-sm border uppercase font-mono tracking-wider text-[10px] ${
            isDark ? "bg-white/5 border-white/5 text-white/65" : "bg-slate-50 border-slate-200/60 text-slate-500"
          }`}>
            {introLines.map((l, i) => (
              <div key={i} className="font-semibold">{l}</div>
            ))}
          </div>
        )}
        
        {sections.map((sec, idx) => (
          <div key={idx} className={`p-4 rounded-sm border ${
            isDark ? "bg-black/20 border-white/5 text-white/90" : "bg-slate-100/50 border-slate-200/60 text-slate-700"
          }`}>
            <h5 className={`font-mono text-[10.5px] font-bold uppercase mb-2 flex items-center gap-1.5 ${
              isDark ? "text-rose-400" : "text-rose-700"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {sec.title}
            </h5>
            <div className="space-y-2 leading-relaxed">
              {sec.content.map((para, pIdx) => (
                <p key={pIdx} className="indent-0">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Dynamic colors for body Layout depending on isDark (light vs dark mode)
  const bodyBgClass = isDark ? "bg-[#050608] text-white/90" : "bg-[#FAF9F6] text-slate-800";
  const glowOpacityClass = isDark ? "opacity-100" : "opacity-40";

  // Shared dark/light class builders
  const cardBgStyle = isDark 
    ? "bg-[#0b0c10]/30 p-4 md:p-5 relative" 
    : "bg-white p-4 md:p-5 rounded-none relative";

  const cardBorderCol = isDark ? "border-white/15" : "border-slate-100";
  const labelTextClass = isDark ? "text-white/45" : "text-slate-400";
  const textTitleClass = isDark ? "text-white" : "text-slate-900";
  const textSubClass = isDark ? "text-white/40" : "text-slate-400";
  const inputBgClass = isDark 
    ? "bg-black/40 border border-white/10" 
    : "bg-slate-50 border border-slate-200";

  const presLabelClass = isDark ? "text-white/40" : "text-slate-400";
  const presBtnClass = isDark
    ? "bg-white/5 hover:bg-white/10 border-white/10 text-white/60"
    : "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-600 hover:text-slate-900";

  const indicatorBgClass = isDark ? "bg-black/30 text-white/40 border border-white/5" : "bg-slate-50 text-slate-500 border border-slate-200/60";
  const fontSettings = getLanguageFontSettings(language);

  return (
    <div 
      className={`min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden font-sans antialiased flex flex-col selection:bg-[#f59e0b] selection:text-black relative overflow-hidden transition-colors duration-300 ${bodyBgClass} ${fontSettings.className}`}
      style={{
        "--font-sans-computed": fontSettings.fontSans,
        "--font-songti-computed": fontSettings.fontSongti,
        fontFamily: fontSettings.fontSans,
        letterSpacing: fontSettings.letterSpacing,
      } as React.CSSProperties}
    >
      {/* Immersive radial background glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#f59e0b]/5 rounded-full blur-[140px] pointer-events-none transition-all ${glowOpacityClass}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#06b6d4]/5 rounded-full blur-[140px] pointer-events-none transition-all ${glowOpacityClass}`} />

      {/* Dynamic Header */}
      <Header
        timestamp={timestamp}
        latitude={latitude}
        longitude={longitude}
        kineticSpeed={kineticSpeed}
        language={language}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(prev => !prev)}
        user={user}
        isDark={isDark}
        userTier={userTier}
      />

      {/* Main Grid View */}
      <main className={`flex-1 w-full max-w-none p-0 flex flex-col lg:flex-row gap-0 items-stretch relative z-10 border-t lg:min-h-0 lg:overflow-hidden ${
        isDark ? "border-white/10" : "border-slate-200"
      }`}>
        
        {/* Core Workspace Area: Casting panel + Result panels */}
        <div className={`flex-1 w-full flex flex-col lg:flex-row lg:h-full lg:overflow-hidden gap-0 items-stretch divide-y lg:divide-y-0 lg:divide-x ${
          isDark ? "divide-white/10 bg-white/[0.01]" : "divide-slate-200 bg-slate-50/20"
        }`}>
          
          {/* Left Side: parameters & shortcuts */}
          <div className={`w-full ${
            isLeftPanelCollapsed 
              ? "h-[48px] lg:h-full lg:w-[48px] overflow-hidden" 
              : "h-auto lg:h-full lg:w-[380px]"
          } lg:shrink-0 flex flex-col lg:overflow-y-auto custom-scrollbar transition-all duration-300 relative border-r ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}>
            {isLeftPanelCollapsed ? (
              <div className="relative w-full h-[48px] lg:h-full flex lg:flex-col items-center justify-start py-0 lg:py-[7px] px-[7px]">
                <button
                  type="button"
                  onClick={() => setIsLeftPanelCollapsed(false)}
                  className={`absolute top-[7px] left-[7px] z-40 w-[34px] h-[34px] rounded-sm border transition-all duration-150 flex items-center justify-center cursor-pointer ${
                    isDark ? "bg-white/5 border-white/10 text-[#f59e0b] hover:bg-white/10" : "bg-slate-50 border-slate-200 text-[#f59e0b] hover:bg-slate-100"
                  }`}
                  title="Expand Panel"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="hidden lg:block lg:mt-[56px] writing-mode-vertical text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-40 select-none whitespace-nowrap text-center" style={{ writingMode: "vertical-rl" }}>
                  {t("inceptionTitle")}
                </div>
                <div className="lg:hidden flex items-center gap-1.5 text-[11px] font-sans font-medium tracking-wide text-slate-400 select-none truncate pl-[50px] pr-4 h-[48px] w-full">
                  <Compass className="w-3.5 h-3.5 text-[#f59e0b] animate-spin-slow" />
                  <span className="truncate">{t("inceptionTitle")}</span>
                  <span className="text-[10px] opacity-60 font-normal">({language.startsWith("zh") ? "已折叠 / 点击展开参数" : "Tap to view parameters"})</span>
                </div>
              </div>
            ) : (
              <div className={`${cardBgStyle} pt-[48.5px] lg:pt-5`}>
                {/* 1. Mobile-only top bar (Absolute overlay at same corner coordinates) */}
                <div className="lg:hidden absolute top-[7px] left-[7px] right-[7px] h-[34px] flex items-center z-40">
                  <button
                    type="button"
                    onClick={() => setIsLeftPanelCollapsed(true)}
                    className={`w-[34px] h-[34px] rounded-sm border transition-all duration-150 flex items-center justify-center cursor-pointer ${
                      isDark 
                        ? "bg-white/5 border-white/10 text-white/50 hover:text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                    title="Collapse Panel"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 pl-[11px] select-none text-left pointer-events-none">
                    <Sparkles className="w-3.5 h-3.5 text-[#f59e0b2a]" />
                    <h2 className={`text-[12.5px] font-sans font-bold uppercase tracking-wider ${textTitleClass}`}>
                      {t("inceptionTitle")}
                    </h2>
                  </div>
                </div>

                {/* 2. PC/Desktop-only elegant header (Standard flow row, left-aligned title, right-aligned clean toggle) */}
                <div className="hidden lg:flex items-center justify-between mb-5 select-none">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                    <div>
                      <h2 className={`text-[14px] font-sans font-bold uppercase tracking-wider ${textTitleClass}`}>
                        {t("inceptionTitle")}
                      </h2>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLeftPanelCollapsed(true)}
                    className={`p-1.5 rounded-sm border transition-colors duration-150 text-xs font-mono flex items-center justify-center cursor-pointer ${
                      isDark ? "hover:bg-white/10 border-white/10 text-white/50 hover:text-white" : "hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                    title="Collapse Panel"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>

            {/* casting form */}
            <form onSubmit={triggerDivinate} className="space-y-4">
              
              {/* SECTION 1: 当前决策 (Red) */}
              <div className={`space-y-3.5 p-3.5 rounded-sm border ${
                isDark 
                  ? "border-red-500/30 bg-red-500/[0.02]" 
                  : "border-red-500/20 bg-red-500/[0.01]"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] font-mono font-bold text-red-500 uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{t("currentDecision")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={cyclePresetQuestion}
                    title="切换决策预设"
                    className="p-1.5 rounded-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center group"
                  >
                    <svg className="w-4 h-4 text-slate-400 dark:text-white/30 group-hover:text-slate-600 dark:group-hover:text-white/60 group-hover:rotate-45 transition-all duration-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2Z" />
                    </svg>
                  </button>
                </div>
                
                {/* Question Textarea */}
                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder={t("inquiryPlaceholder")}
                    rows={2}
                    className={`w-full rounded-sm p-3 text-[10px] font-normal focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/20 font-sans transition-all resize-none h-14 overflow-hidden ${
                      isDark 
                        ? "bg-black/55 border-white/10 text-white placeholder-white/20 focus:border-white/30" 
                        : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400"
                    }`}
                  />
                </div>
              </div>

              {/* SECTION 2: 时间时序 (Orange) */}
              <div className={`space-y-3.5 p-3.5 rounded-sm border ${
                isDark 
                  ? "border-orange-500/30 bg-orange-500/[0.02]" 
                  : "border-orange-500/20 bg-orange-500/[0.01]"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] font-mono font-bold text-orange-500 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{t("timeTemporal")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const tzoffset = now.getTimezoneOffset() * 60000;
                      const localISOTime = (new Date(now.getTime() - tzoffset)).toISOString().slice(0, 16);
                      setDateTimeStr(localISOTime);
                      setTimestamp(now.getTime());
                    }}
                    className="text-[9px] font-mono font-normal text-orange-500 hover:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 px-1.5 py-0.5 rounded-sm transition-all bg-orange-500/5 cursor-pointer select-none"
                  >
                    {t("injectTimeBtn")}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="relative w-full">
                    {/* Visual presentation layer with matching style & gray colors */}
                    <div className={`w-full rounded-sm py-1.5 px-2 text-[12px] font-normal font-mono border flex items-center justify-between pointer-events-none ${
                      isDark 
                        ? `bg-black/55 border-white/10 ${dateTimeStr ? "text-white/70" : "text-white/40"}` 
                        : `bg-white border-slate-200 ${dateTimeStr ? "text-slate-600" : "text-slate-400"}`
                    }`}>
                      <span className="truncate">
                        {formatDateTimeForDisplay(dateTimeStr, language)}
                      </span>
                      <Calendar className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                    </div>

                    {/* Hidden interactive input overlaying transparently */}
                    <input
                      type="datetime-local"
                      value={dateTimeStr}
                      onChange={(e) => handleDateTimeChange(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px]"
                      style={{ colorScheme: isDark ? "dark" : "light" }}
                    />
                  </div>
                  {timestamp ? (
                    <div className="text-[13px] font-mono font-normal text-slate-400 dark:text-white/40 mt-1.5 h-5 flex items-center">
                      <div>{(language === "zh-CN" || language === "language" || language === "zh-TW") ? "" : `${t("lunarTimeLabel")}: `}{getGanzhiTime(timestamp)}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* SECTION 3: 空间定位 (Blue) */}
              <div className={`space-y-3.5 p-3.5 rounded-sm border relative ${
                isDark 
                  ? "border-blue-500/30 bg-blue-500/[0.02]" 
                  : "border-blue-500/20 bg-blue-500/[0.01]"
              }`}>
                {/* Free Tier Lock Screen - Full-cover rectangular blurred overlay, dashed border, gray font, no buttons */}
                {userTier === "Free" && (
                  <div 
                    onClick={() => setIsSubscriptionOpen(true)}
                    className={`absolute inset-0 backdrop-blur-[4px] z-25 cursor-pointer rounded-sm border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all ${
                      isDark 
                        ? "bg-black/75 border-neutral-700/80 text-neutral-400" 
                        : "bg-white/85 border-neutral-300/85 text-neutral-500"
                    }`}
                  >
                    <Lock className={`w-5 h-5 mb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                    <p className="text-[10px] font-mono uppercase font-bold tracking-wider">{t("geolocationLocked")}</p>
                    <p className={`text-[9px] mt-1.5 max-w-[210px] leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("geolocationLockedDesc")}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] font-mono font-bold text-blue-500 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{t("spatialCoordinates")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={triggerGPSLocate}
                    className="text-[9px] font-mono font-normal text-blue-500 hover:text-blue-400 border border-blue-500/30 hover:border-blue-500/50 px-1.5 py-0.5 rounded-sm transition-all bg-blue-500/5 cursor-pointer select-none"
                  >
                    {t("getGpsBtn")}
                  </button>
                </div>

                {/* GPS selection grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] sm:text-[11px] font-mono font-normal uppercase text-slate-400 dark:text-white/40 leading-none">
                      {t("latitude")}
                    </label>
                    <div
                      className={`w-full rounded-sm py-1.5 px-2 text-[12px] font-normal font-mono border ${
                        isDark 
                          ? `bg-black/55 border-white/10 ${latitude ? "text-white/70" : "text-white/40"}` 
                          : `bg-white border-slate-200 ${latitude ? "text-slate-600" : "text-slate-400"}`
                      }`}
                    >
                      {latitude !== "" ? latitude : "--"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] sm:text-[11px] font-mono font-normal uppercase text-slate-400 dark:text-white/40 leading-none">
                      {t("longitude")}
                    </label>
                    <div
                      className={`w-full rounded-sm py-1.5 px-2 text-[12px] font-normal font-mono border ${
                        isDark 
                          ? `bg-black/55 border-white/10 ${longitude ? "text-white/70" : "text-white/40"}` 
                          : `bg-white border-slate-200 ${longitude ? "text-slate-600" : "text-slate-400"}`
                      }`}
                    >
                      {longitude !== "" ? longitude : "--"}
                    </div>
                  </div>
                </div>

              </div>


              {/* SECTION 4: 意念动能 (Purple) */}
              <div className={`space-y-3.5 p-3.5 rounded-sm border relative ${
                isDark 
                  ? "border-purple-500/30 bg-purple-500/[0.02]" 
                  : "border-purple-500/20 bg-purple-500/[0.01]"
              }`}>
                {/* Free Tier Lock Screen - Full-cover rectangular blurred overlay, dashed border, gray font, no buttons */}
                {userTier === "Free" && (
                  <div 
                    onClick={() => setIsSubscriptionOpen(true)}
                    className={`absolute inset-0 backdrop-blur-[4px] z-25 cursor-pointer rounded-sm border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all ${
                      isDark 
                        ? "bg-black/75 border-neutral-700/80 text-neutral-400" 
                        : "bg-white/85 border-neutral-300/85 text-neutral-500"
                    }`}
                  >
                    <Lock className={`w-5 h-5 mb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} />
                    <p className="text-[10px] font-mono uppercase font-bold tracking-wider">{t("kineticLocked")}</p>
                    <p className={`text-[9px] mt-1.5 max-w-[210px] leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("kineticLockedDesc")}</p>
                  </div>
                )}

                <div className="flex items-start justify-between gap-1.5 min-h-[22px]">
                  <span className="flex items-start gap-2 text-[12px] font-mono font-bold text-purple-400 uppercase tracking-wider max-w-[62%] leading-normal">
                    <Activity className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    <span className="break-words">{t("mindKineticVector")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={resetScratchBoard}
                    disabled={!isScratchLocked || isLoading}
                    className={`text-[9px] font-mono font-normal text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/50 px-1.5 py-0.5 rounded-sm transition-all bg-purple-500/5 cursor-pointer select-none shrink-0 max-w-[36%] text-center truncate ${
                      isScratchLocked && !isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {language.startsWith("zh") ? "重新注入意念" : "Re-inject Mind Force"}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div
                    ref={padRef}
                    style={{ height: "56px", minHeight: "56px", maxHeight: "56px" }}
                    className={`w-full flex flex-col items-center justify-center relative overflow-hidden select-none rounded-sm touch-none ${
                      isDark
                        ? "bg-[#0b0c13]"
                        : "bg-slate-50"
                    }`}
                  >
                    {/* Background Reveal Layer (What gets revealed when mist is rubbed off!) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-slate-950 flex flex-col items-center justify-center pointer-events-none select-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_75%)]" />
                      {!isScratchLocked && (
                        <p className="text-[12px] font-mono font-normal text-purple-200 tracking-widest uppercase">
                          {t("cosmicAlignmentFormed")}
                        </p>
                      )}
                    </div>

                    {/* Canvas Overlay for Erasing */}
                    {!isScratchLocked && (
                      <canvas
                        ref={canvasRef}
                        onPointerDown={handlePadStart}
                        onPointerMove={handlePadMove}
                        onPointerUp={handlePadEnd}
                        onPointerLeave={handlePadEnd}
                        className="absolute inset-0 w-full h-full z-10 touch-none cursor-pointer"
                      />
                    )}

                    {/* Locked Screen Overlay (Defending "卦多不灵" Ritual) */}
                    {isScratchLocked && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-[1px] pointer-events-all px-4 animate-fade-in text-center bg-black/45">
                        <div className="flex flex-col justify-center items-center">
                          <div className="text-[11px] font-mono font-normal text-slate-400 dark:text-white/40">
                            {language.startsWith("zh") ? "" : "Measured Velocity: "}{kineticSpeed.toFixed(3)} m/s²
                          </div>
                          <span className="text-[11px] font-mono font-normal text-slate-400 dark:text-white/40 mt-1 max-w-xs block leading-normal">
                            {language.startsWith("zh") 
                              ? "意念动能已注入" 
                              : "Mind kinetic energy injected"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* slider vector metrics progress */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-400 transition-all z-10 pointer-events-none" style={{ width: `${scratchProgress}%` }} />
                  </div>
                </div>
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-start gap-2.5 text-xs text-red-500 font-mono">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Cast Action trigger Button */}
              <div className="relative group mt-2">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-red-500 via-orange-500 via-cyan-500 to-purple-600 rounded-sm blur-xs opacity-20 ${isLoading ? '' : 'group-hover:opacity-40'} transition duration-500`} />
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`relative w-full py-2.5 px-4 rounded-sm font-mono font-bold tracking-widest text-[9.5px] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isDark 
                      ? "bg-white text-black border-transparent hover:bg-white/95 text-black" 
                      : "bg-slate-900 text-white border-transparent hover:bg-slate-800 text-white"
                  } ${
                    isLoading
                      ? "opacity-45 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {t("integratingSeeds")}
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                      {t("castChartsBtn")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
            )}
        </div>

        {apiResult ? (
          <>
            {/* Column 2: Module 1 & Module 2 Charts */}
            <div className={`flex-1 flex flex-col lg:h-full lg:overflow-y-auto custom-scrollbar divide-y ${isDark ? "divide-white/10" : "divide-slate-200"} animate-fade-in`}>
              
              {/* Module 1: Seed & Gua Charts Visualizer screen */}
              <div className={cardBgStyle}>
                <div className="flex items-center justify-between pb-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" />
                    <div>
                      <h2 className={`text-xs font-sans font-bold uppercase tracking-wider ${textTitleClass}`}>
                        {t("mod1Title")}
                      </h2>
                      <p className={`text-[10px] font-sans ${textSubClass}`}>
                        {t("mod1Sub")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seed Hex outputs dec indicators */}
                <div className={`grid grid-cols-3 gap-3 text-[9px] font-mono p-3 rounded-sm border ${
                  isDark ? "bg-black/45 border-white/5 text-white/40" : "bg-slate-50 border-slate-200/80 text-slate-500"
                }`}>
                  <div>
                    <span className="block opacity-75 uppercase font-normal">{t("tSeedHex")}</span>
                    <span className="text-orange-500 font-bold text-[9px]">{apiResult.payload.temporalSeed.hex}</span>
                  </div>
                  <div>
                    <span className="block opacity-75 uppercase font-normal">{t("sSeedLatLng")}</span>
                    <span className="text-blue-500 font-bold text-[9px]">
                      {apiResult.payload.spatialSeed.formatted}
                    </span>
                  </div>
                  <div>
                    <span className="block opacity-75 uppercase font-normal">{t("kSeedAcc")}</span>
                    <span className="text-purple-500 font-bold text-[9px]">{apiResult.payload.kineticSeed.rawValue.toFixed(3)} m/s²</span>
                  </div>
                </div>

                {/* 3 stacked charts representation comparison to optimize horizontal space */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                  {/* Ben Gua */}
                  <SeedVisualizer
                    title={getChartTitle("original", language)}
                    lines={apiResult.payload.charts.original.lines}
                    guaName={apiResult.payload.charts.original.name}
                    englishName={apiResult.payload.charts.original.english}
                    symbol={apiResult.payload.charts.original.symbol}
                    changingLine={apiResult.payload.changingLine}
                    upperTrigram={apiResult.payload.charts.original.upper}
                    lowerTrigram={apiResult.payload.charts.original.lower}
                    isDark={isDark}
                    language={language}
                  />

                  {/* Hu Gua */}
                  <SeedVisualizer
                    title={getChartTitle("nuclear", language)}
                    lines={apiResult.payload.charts.nuclear.lines}
                    guaName={apiResult.payload.charts.nuclear.name}
                    englishName={apiResult.payload.charts.nuclear.english}
                    symbol={apiResult.payload.charts.nuclear.symbol}
                    upperTrigram={apiResult.payload.charts.nuclear.upper}
                    lowerTrigram={apiResult.payload.charts.nuclear.lower}
                    isDark={isDark}
                    language={language}
                  />

                  {/* Bian Gua */}
                  <SeedVisualizer
                    title={getChartTitle("transformed", language)}
                    lines={apiResult.payload.charts.transformed.lines}
                    guaName={apiResult.payload.charts.transformed.name}
                    englishName={apiResult.payload.charts.transformed.english}
                    symbol={apiResult.payload.charts.transformed.symbol}
                    changingLine={apiResult.payload.changingLine}
                    upperTrigram={apiResult.payload.charts.transformed.upper}
                    lowerTrigram={apiResult.payload.charts.transformed.lower}
                    isTransformed={true}
                    isDark={isDark}
                    language={language}
                  />
                </div>
              </div>

              {/* Module 2: The WuXing Metaphysical Interaction matrix */}
              <div className={cardBgStyle}>
                <div className="flex items-center gap-2 pb-2 mb-4">
                  <Compass className="w-4 h-4 text-rose-500" />
                  <div>
                    <h2 className={`text-xs font-sans font-bold uppercase tracking-wider ${textTitleClass}`}>
                      {t("mod2Title")}
                    </h2>
                    <p className={`text-[10px] font-sans ${textSubClass}`}>
                      {t("mod2Sub")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  
                  {/* Ti vs Yong element identifiers */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Ti */}
                    <div className={`p-4 rounded-sm border text-center relative overflow-hidden group ${
                      isDark ? "bg-black/30 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}>
                      <span className={`absolute left-2 top-2 px-1.5 py-0.5 rounded-sm ${
                        language.startsWith("zh")
                          ? "font-classic-serif font-extrabold text-[14px]"
                          : "text-[8px] font-mono font-bold uppercase tracking-wider"
                      } ${
                        isDark ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800"
                      }`}>
                        {t("tiGua")}
                      </span>
                      <span className={`block text-[9px] uppercase font-mono mt-3 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                        {t("tiSub")}
                      </span>
                      <div className={`text-3xl my-2 ${isDark ? "text-white" : "text-slate-900"} ${
                        language.startsWith("zh") ? "font-classic-serif font-extrabold text-[32px]" : "font-sans font-medium"
                      }`}>
                        {apiResult.payload.tiGua.trigram.name}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border font-bold uppercase ${
                        isDark ? "bg-white/5 border-white/10 text-white/90" : "bg-slate-150 border-slate-300 text-slate-700"
                      }`}>
                        {getElementDisplay(apiResult.payload.tiGua.trigram.element, language)}
                      </span>
                      <div className={`text-[9px] mt-2.5 font-mono ${isDark ? "text-white/30" : "text-slate-400"}`}>
                        ({t("tiRole")})
                      </div>
                    </div>

                    {/* Yong */}
                    <div className={`p-4 rounded-sm border text-center relative overflow-hidden group ${
                      isDark ? "bg-black/30 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}>
                      <span className={`absolute left-2 top-2 px-1.5 py-0.5 rounded-sm ${
                        language.startsWith("zh")
                          ? "font-classic-serif font-extrabold text-[14px]"
                          : "text-[8px] font-mono font-bold uppercase tracking-wider"
                      } ${
                        isDark ? "bg-white/10 text-white" : "bg-slate-200/80 text-slate-800"
                      }`}>
                        {t("yongGua")}
                      </span>
                      <span className={`block text-[9px] uppercase font-mono mt-3 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                        {t("yongSub")}
                      </span>
                      <div className={`text-3xl my-2 ${isDark ? "text-white" : "text-slate-900"} ${
                        language.startsWith("zh") ? "font-classic-serif font-extrabold text-[32px]" : "font-sans font-medium"
                      }`}>
                        {apiResult.payload.yongGua.trigram.name}
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border font-bold uppercase ${
                        isDark ? "bg-white/5 border-white/10 text-white/90" : "bg-slate-150 border-slate-300 text-slate-700"
                      }`}>
                        {getElementDisplay(apiResult.payload.yongGua.trigram.element, language)}
                      </span>
                      <div className={`text-[9px] mt-2.5 font-mono ${isDark ? "text-white/30" : "text-slate-400"}`}>
                        ({t("yongRole")})
                      </div>
                    </div>
                  </div>

                  {/* formula and localized relationship outcome details */}
                  <div className={`p-4 border rounded-sm flex flex-col justify-between ${
                    isDark ? "bg-black/45 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div>
                      <span className={`text-[8px] uppercase tracking-wider font-sans block mb-1 font-bold ${
                        isDark ? "text-white/40" : "text-slate-400"
                      }`}>
                        {t("formulaMatrix")}
                      </span>
                      <h4 className="text-base font-semibold text-rose-500 flex items-center gap-2">
                        {apiResult.payload.relationship.conclusion}
                        {!(language === "zh-CN" || language === "zh-TW") && (
                          <span className={`text-xs font-mono font-normal ${isDark ? "text-white/40" : "text-slate-400"}`}>
                            ({apiResult.payload.relationship.type})
                          </span>
                        )}
                      </h4>
                    </div>

                    <p className={`text-xs leading-relaxed mt-4 italic p-3 rounded-sm border ${
                      isDark ? "bg-white/5 border-white/5 text-white/90" : "bg-white border-slate-100 text-slate-700"
                    }`}>
                      "{getWuXingRelationshipInterpretation(
                        apiResult.payload.relationship.conclusion,
                        apiResult.payload.tiGua.trigram.element,
                        apiResult.payload.yongGua.trigram.element,
                        language
                      )}"
                    </p>

                    <div className={`mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-[9px] font-sans uppercase font-bold ${
                      isDark ? "text-white/40 border-white/5" : "text-slate-400 border-slate-200"
                    }`}>
                      <span>{t("dynamicTrigger")}</span>
                      <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 rounded-sm font-sans font-bold">
                        {t("changingLineTrigger").replace("{line}", apiResult.payload.changingLine.toString())}
                      </span>
                    </div>

                    {/* Beginner-friendly explanation of the activated Yao position */}
                    {(() => {
                      const hasClassicalYao = apiResult.aiOutput && apiResult.aiOutput.yaoInfo;
                      const yaoDetails = getDetailedYaoExplanation(apiResult.payload.changingLine, language);
                      
                      if (hasClassicalYao) {
                        const yaoInfo = apiResult.aiOutput.yaoInfo!;
                        return (
                          <div className={`mt-4 pt-4 border-t ${
                            isDark ? "border-white/5 text-slate-300" : "border-slate-100 text-slate-700"
                          } text-xs leading-relaxed font-sans space-y-4`}>
                            
                            {/* Layer name and Yao statement concatenated */}
                            <div>
                              <div className={`font-bold text-xs font-sans ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                {language.startsWith("zh") 
                                  ? `触发${yaoDetails.levelName.replace("爻", "层")}（${yaoDetails.levelConcept}）`
                                  : `Activated ${yaoDetails.levelName.replace("爻", "层").replace("Line ", "Layer ")} (${yaoDetails.levelConcept})`}
                              </div>
                              <div className={`text-xs font-sans mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                <span className={`font-semibold mr-1.5 ${isDark ? "text-slate-200" : "text-slate-900"}`}>{yaoInfo.yaoCi}</span>
                                {yaoInfo.yaoExplanation}
                              </div>
                            </div>

                            {/* Corresponding executive guidance */}
                            <div>
                              <div className={`font-bold text-xs font-sans ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                {language.startsWith("zh") ? "[ 对应决策指引 ]" : "[ Executive Decision Guidance ]"}
                              </div>
                              <div className={`text-xs font-sans mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                {yaoInfo.developmentDirection}
                              </div>
                            </div>

                            {/* Footnote reference */}
                            <div className={`pt-3 border-t text-[10px] ${isDark ? "border-white/5 text-slate-500" : "border-slate-100 text-slate-400"}`}>
                              <span className="font-bold">{language.startsWith("zh") ? "要素代表 — " : "Elements — "}</span>
                              {yaoDetails.representation}
                            </div>

                          </div>
                        );
                      }

                      return (
                        <div className={`mt-4 pt-4 border-t ${
                          isDark ? "border-white/5 text-slate-300" : "border-slate-100 text-slate-700"
                        } text-xs leading-relaxed font-sans`}>
                          <div className="mb-3.5">
                            <div className={`font-bold text-xs font-sans ${isDark ? "text-slate-200" : "text-slate-900"}`}>
                              {yaoDetails.levelName}
                            </div>
                            <div className={`text-xs font-sans mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              {yaoDetails.levelConcept}
                            </div>
                          </div>
                          
                          <div className="mb-3.5">
                            <div className={`font-bold text-xs font-sans ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                              {language.startsWith("zh") ? "现实中对应人物与要素代表" : "Real-world representation"}
                            </div>
                            <div className={`text-xs font-sans mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {yaoDetails.representation}
                            </div>
                          </div>
                          
                          <div>
                            <div className={`font-bold text-xs font-sans ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                              {language.startsWith("zh") ? "现实场景决策影响推演" : "Real-world gameplay impact"}
                            </div>
                            <div className={`text-xs font-sans mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {yaoDetails.gameAnalysis}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>

            </div>

            {/* Column 3: AI decision centre & Footer */}
            <div className={`flex-1 flex flex-col lg:h-full lg:overflow-y-auto custom-scrollbar divide-y ${isDark ? "divide-white/10" : "divide-slate-200"} animate-fade-in`}>
              
              {/* Module 3: AI decision centre */}
              <div className={cardBgStyle}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 mb-4 gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`w-4 h-4 ${cardStyle.iconColor}`} />
                    <div>
                      <h2 className={`text-xs font-sans font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
                        {t("mod3Title")}
                      </h2>
                      <p className={`text-[10px] font-sans ${isDark ? "text-white/45" : "text-slate-500"}`}>
                        {t("mod3Sub")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Verdict Badge */}
                  <div className={`rounded-sm flex items-center gap-1.5 tracking-wider uppercase font-sans ${
                    (activeVerdict === "凶" || activeVerdict === "Systemic Risk" || activeVerdict === "Highly Inauspicious")
                      ? "text-sm font-bold px-4 py-2.5 bg-rose-500 text-white shadow-lg shadow-rose-500/15"
                      : `text-[9.5px] font-mono font-bold px-3 py-1.5 ${cardStyle.badge}`
                  }`}>
                    {!(activeVerdict === "凶" || activeVerdict === "Systemic Risk" || activeVerdict === "Highly Inauspicious") && (
                      <Award className="w-3.5 h-3.5" />
                    )}
                    <span className={(activeVerdict === "凶" || activeVerdict === "Systemic Risk" || activeVerdict === "Highly Inauspicious") ? "text-base font-black px-1.5 scale-110 tracking-widest inline-block" : ""}>
                      {t(getVerdictTranslationKey(activeVerdict)) || activeVerdict}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Verdict descriptive intro */}
                  <p className={`text-xs italic mt-1 pb-3 border-b ${
                    isDark ? "text-white/60 border-white/5" : "text-slate-600 border-slate-100"
                  }`}>
                    "{cardStyle.desc}"
                  </p>

                  {/* Strategic analysis log text */}
                  <div>
                    <h4 className={`text-[9px] font-sans font-bold uppercase tracking-widest mb-2.5 ${
                      isDark ? "text-white/40" : "text-slate-400"
                    }`}>
                      {t("evalAnalysis")}
                    </h4>
                    <div className={`border p-4 rounded-sm text-xs leading-relaxed ${
                      isDark ? "bg-black/40 border-white/5 text-slate-300" : "bg-white border-slate-100 text-slate-600"
                    }`}>
                      {renderAnalysis(apiResult.aiOutput?.analysis || "")}
                    </div>
                  </div>

                  {/* Interactive localized task milestones guides */}
                  <div>
                    <h4 className={`text-[9px] font-sans font-bold uppercase tracking-widest mb-3 ${
                      isDark ? "text-white/40" : "text-slate-400"
                    }`}>
                      {t("tacticalRoadmap")}
                    </h4>
                    <div className="space-y-2.5">
                      {apiResult.aiOutput?.tacticalAction?.map((act, aIdx) => {
                        let displayText = act;
                        let triggerText = "";
                        const match = act.match(/\[SIMULATE_TRIGGER:\s*(.*?)\]/);
                        if (match) {
                          displayText = act.replace(/\[SIMULATE_TRIGGER:\s*(.*?)\]/, "").trim();
                          triggerText = match[1];
                        }

                        const bracketMatch = displayText.match(/^\[(.*?)\]\s*(.*)/);
                        let tagText = "";
                        let contentText = displayText;
                        if (bracketMatch) {
                          tagText = bracketMatch[1];
                          contentText = bracketMatch[2];
                        }

                        return (
                          <div key={aIdx} className={`p-3 rounded-sm border ${
                            isDark ? "bg-black/25 border-white/5 text-slate-300" : "bg-white border-slate-200/80 text-slate-600"
                          }`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`h-5 w-5 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
                                  isDark ? "bg-white/5 text-rose-500 border-white/10" : "bg-slate-100 text-rose-600 border-slate-200"
                                }`}>
                                  0{aIdx + 1}
                                </div>
                                <div className="flex-1 text-left text-xs leading-relaxed">
                                  {tagText ? (
                                    <div className="text-left leading-relaxed">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-sans font-medium rounded-sm tracking-wide mr-1.5 align-middle select-none ${
                                        isDark 
                                          ? "bg-slate-800 text-slate-300 border border-slate-700/60" 
                                          : "bg-slate-700 text-slate-100"
                                      }`}>
                                        {tagText}
                                      </span>
                                      <span className={`${isDark ? "text-slate-300" : "text-slate-600"} align-middle`}>
                                        {contentText}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                                      {displayText}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {triggerText && (
                                <button
                                  type="button"
                                  onClick={() => handleSendChatMessage(triggerText)}
                                  className={`shrink-0 flex items-center gap-1 px-2 py-0.5 mt-0.5 text-[9px] font-sans tracking-wider uppercase border rounded-sm transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                                    isDark 
                                      ? "bg-rose-950/25 text-rose-400 border-rose-500/20 hover:bg-rose-500/15 hover:border-rose-500/40"
                                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-400"
                                  }`}
                                  title={language.startsWith("zh") ? "模拟此战术推演" : "Simulate Tactic"}
                                >
                                  <Sparkles className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span>{language.startsWith("zh") ? "模拟推演" : "Simulate"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stacking metatags vertically inside Column 3 to maximize horizontal breath */}
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {/* Yingqi / Catalyst Window */}
                    <div className={`border p-4 rounded-sm flex flex-col justify-between ${
                      isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <div>
                        <span className={`text-[11.5px] uppercase tracking-wider font-sans block mb-2.5 font-bold ${
                          isDark ? "text-white/45" : "text-slate-500"
                        }`}>
                          {t("catalystWindow")}
                        </span>
                        
                        {/* Fully Unlocked YingQi + Real Interactive Calendar Sync for All Users! */}
                        <div className="mt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                            <div className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              <span>
                                {apiResult.aiOutput?.catalystWindow || "HOUR OF THE RABBIT (05:00-07:00)"}
                              </span>
                            </div>

                             {/* Live Calendar synchronization wizard aligned to the right like simulate action */}
                             <div className="shrink-0">
                               {calendarSyncStatus === "idle" ? (
                                 <button
                                   type="button"
                                   onClick={() => {
                                     setCalendarSyncStatus("syncing");
                                     setTimeout(() => {
                                       setCalendarSyncStatus("success");
                                     }, 1550);
                                   }}
                                   className={`shrink-0 flex items-center justify-center px-2.5 py-1 text-xs font-sans border rounded-sm transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                                     isDark 
                                       ? "bg-rose-950/25 text-rose-400 border-rose-500/20 hover:bg-rose-500/15 hover:border-rose-500/40"
                                       : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-400"
                                   }`}
                                 >
                                   <span>{t("syncToSysCalendar")}</span>
                                 </button>
                               ) : calendarSyncStatus === "syncing" ? (
                                 <div className={`p-1 px-2.5 rounded-sm border text-xs font-sans flex items-center justify-center ${
                                   isDark 
                                     ? "bg-rose-950/20 text-rose-400 border-rose-500/20"
                                     : "bg-rose-50 text-rose-700 border-rose-200"
                                 }`}>
                                   <span>{t("shakingHandsWithCalendar")}</span>
                                 </div>
                               ) : (
                                 <div className={`p-1 px-2.5 rounded-sm border text-xs font-sans flex items-center justify-center ${
                                   isDark 
                                     ? "bg-rose-950/30 text-rose-400 border-rose-500/30"
                                     : "bg-rose-100 text-rose-800 border-rose-300"
                                 }`}>
                                   <span className="font-semibold">{t("calendarIntegrated")}</span>
                                 </div>
                               )}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Waixing */}
                    <div className={`border p-4 rounded-sm ${
                      isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <span className={`text-[11.5px] uppercase tracking-wider font-sans block mb-2.5 font-bold ${
                        isDark ? "text-white/45" : "text-slate-500"
                      }`}>
                        {t("phenomEcho")}
                      </span>
                      <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        {apiResult.aiOutput?.phenomenologicalEcho}
                      </p>
                    </div>

                    {/* Unified Prime Coordinating Panel - Refactored into 2 separate cards */}
                    {(() => {
                      const rawElement = apiResult?.payload?.tiGua?.trigram?.element || "";
                      let elementKey = "Fire";
                      if (rawElement === "金") elementKey = "Metal";
                      if (rawElement === "木") elementKey = "Wood";
                      if (rawElement === "水") elementKey = "Water";
                      if (rawElement === "火") elementKey = "Fire";
                      if (rawElement === "土") elementKey = "Earth";

                      const details = getUnifiedAssetSynergyDetails(elementKey, language);
                      return (
                        <>
                          {/* Card 1: 高价值执行节点 */}
                          <div className={`border p-4 rounded-sm ${
                            isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                          }`}>
                            <span className={`text-[11.5px] uppercase tracking-wider font-sans block mb-2.5 font-bold ${
                              isDark ? "text-white/45" : "text-slate-500"
                            }`}>
                              {language.startsWith("zh") ? "高价值执行节点" : "High-Value Execution Nodes"}
                            </span>
                            <p className={`text-xs leading-relaxed font-sans font-normal ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              {details.synergyComponent}
                            </p>
                          </div>

                          {/* Card 2: 高胜率执行周期节点 */}
                          <div className={`border p-4 rounded-sm ${
                            isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                          }`}>
                            <span className={`text-[11.5px] uppercase tracking-wider font-sans block mb-2.5 font-bold ${
                              isDark ? "text-white/45" : "text-slate-500"
                            }`}>
                              {language.startsWith("zh") ? "高胜率执行周期节点" : "Resonant Execution Timeline"}
                            </span>
                            <p className={`text-xs leading-relaxed font-sans font-normal ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              {details.resonantTimeline}
                            </p>
                          </div>
                        </>
                      );
                    })()}

                  </div>

                </div>
              </div>

            </div>

            {/* Column 4: Hexa AI Chat Counsel */}
            <div className={`flex-1 flex flex-col lg:h-full lg:overflow-hidden divide-y ${isDark ? "divide-white/10" : "divide-slate-200"} animate-fade-in`}>
              
              {/* Module 5: Hexa AI Stateful Terminal Chat Portal */}
              {activeHistoryId && apiResult && (
                <div className={`p-4 md:p-5 transition-all duration-350 font-mono h-full lg:h-full flex flex-col justify-between overflow-hidden min-h-0 ${
                  isDark ? "bg-[#0d1322] border-white/5" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-dashed border-cyan-500/15 shrink-0">
                      <div className="flex items-center">
                        <h3 className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                          isDark ? "text-cyan-400" : "text-cyan-700"
                        }`}>
                          HEXA AI
                        </h3>
                      </div>
                      <span className="text-[10px] opacity-50 tracking-widest uppercase font-sans">
                        {t("sessionLabel")}: {activeHistoryId ? activeHistoryId.replace(/^(cast|キャスト|auto-monthly)-/, "").slice(0, 8) : "--"}
                      </span>
                    </div>

                    {/* Chat message display area */}
                    <div 
                      id="hexa-terminal-scroller"
                      className={`flex-1 min-h-0 overflow-y-auto pr-1 mb-3 space-y-3 custom-scrollbar text-[13px] placeholder-neutral-400 p-2 rounded-sm ${
                        isDark ? "bg-black/40 text-neutral-300" : "bg-white text-neutral-700 border border-slate-100"
                      } ${(chatSessions[activeHistoryId] || []).length === 0 ? "flex flex-col items-center justify-center" : ""}`}
                    >
                      {/* Opening welcome briefing/Carousel from advisor when history is empty */}
                      {(chatSessions[activeHistoryId] || []).length === 0 ? (
                        <div className="flex flex-col items-center justify-center max-w-lg w-full mx-auto py-12 px-4 text-center space-y-6 font-sans">
                          {/* Main Dynamic Greeting in Elegant Thin Serif (Songti) */}
                          <div className="w-full text-center py-4">
                            {/* Gemini-style dynamic looping text with elegant fading transition */}
                            <div className="min-h-[48px] flex items-center justify-center">
                              <span 
                                key={greetingIndex}
                                className={`text-2xl sm:text-3xl md:text-4xl tracking-wide leading-relaxed transition-all duration-300 ${
                                  isDark 
                                    ? "bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-cyan-100 to-teal-100" 
                                    : "bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-cyan-950 to-slate-900"
                                }`}
                                style={{ 
                                  fontFamily: '"Microsoft YaHei", "微软雅黑", system-ui, -apple-system, sans-serif',
                                  fontWeight: 300 
                                }}
                              >
                                {getGreetingData(language).rotating[greetingIndex % getGreetingData(language).rotating.length]}
                              </span>
                            </div>
                          </div>

                          {/* Centered Input Box reminiscent of Gemini's start screen */}
                          <div className="w-full mt-4">
                            {userTier === "Free" ? (
                              <div className="p-4 border border-dashed border-amber-500/15 bg-amber-500/[0.02] rounded-sm flex flex-col items-center justify-center text-center gap-2">
                                <p className="text-[11px] max-w-[280px] leading-relaxed text-slate-400 font-sans">
                                  {language.startsWith("zh")
                                    ? "深度 Hexa AI 决策参谋阁聊天是 专属专业顾问版 (Pro) 尊享功能。"
                                    : "Interactive Stateful Chat Consultation with Hexa Advisor is reserved for Pro Consultant users."}
                                </p>
                                <button 
                                  type="button" 
                                  onClick={() => setIsSubscriptionOpen(true)}
                                  className="py-2 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-[11px] uppercase rounded-sm cursor-pointer transition-all duration-150 shadow-md hover:shadow-[#f59e0b]/10 whitespace-nowrap"
                                >
                                  {language.startsWith("zh") ? "开阁升级解锁" : "Upgrade to Pro"}
                                </button>
                              </div>
                            ) : (
                              <div className={`p-1 flex items-center gap-2 rounded-full border shadow-sm transition-all duration-300 w-full ${
                                isDark 
                                  ? "bg-black/60 border-neutral-800 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/20" 
                                  : "bg-white border-slate-200 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/20"
                              }`}>
                                <input
                                  type="text"
                                  value={currentChatMessage}
                                  onChange={(e) => setCurrentChatMessage(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleSendChatMessage();
                                    }
                                  }}
                                  disabled={isChatLoading}
                                  placeholder={
                                    language.startsWith("zh")
                                      ? "问问 HEXA AI..."
                                      : "Ask HEXA AI..."
                                  }
                                  className={`flex-1 text-sm py-2 px-4 focus:outline-none bg-transparent font-sans ${
                                    isDark ? "text-white placeholder-neutral-600" : "text-slate-800 placeholder-slate-450"
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={handleSendChatMessage}
                                  disabled={isChatLoading || !currentChatMessage.trim()}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer duration-150 shrink-0 shadow-sm mr-1"
                                  title="Send inquiry"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Chat Messages */}
                      {(chatSessions[activeHistoryId] || []).map((msg, mIdx) => {
                        const isUser = msg.role === "user";
                        return (
                          <div key={mIdx} className={`flex flex-col ${isUser ? "items-end text-right" : "items-start text-left"} w-full space-y-0.5 font-sans`}>
                            <span className="text-[9px] opacity-30 font-mono select-none px-1">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <div className={`leading-relaxed text-xs ${
                              isUser 
                                ? `max-w-[60%] w-fit p-3 rounded-sm text-right ${
                                    isDark 
                                      ? "bg-slate-800/80 border border-slate-700/60 text-slate-200" 
                                      : "bg-slate-100 border border-slate-200/80 text-slate-700"
                                  }`
                                : `w-full py-1 px-0 bg-transparent border-0 text-left`
                            }`}>
                              {isUser ? parseBoldText(msg.content, isDark) : renderMarkdownMessage(msg.content, isDark)}
                            </div>
                          </div>
                        );
                      })}

                      {/* Chat Error Indicator */}
                      {chatError && (
                        <div className="p-2 border border-dashed border-rose-500/20 bg-rose-950/10 rounded-xs text-xs text-rose-400 leading-normal text-left">
                          {chatError}
                        </div>
                      )}

                      {/* Chat Loading Placeholder */}
                      {isChatLoading && (
                        <div className="flex items-center gap-2 p-1.5 opacity-70 text-xs">
                          <span>
                            {language.startsWith("zh-TW") ? "正在演算要素關聯矩陣與博弈路徑..." :
                             language.startsWith("zh") ? "正在演算要素关联矩阵与博弈路径..." :
                             language.startsWith("ja") ? "時空間マトリクスの整合性とシミュレーション経路を計算中..." :
                             language.startsWith("ko") ? "시공간 매트릭스 정렬 및 시뮬레이션 경로 계산 중..." :
                             language.startsWith("es") ? "Calculando la alineación de vectores de la matriz..." :
                             language.startsWith("id") ? "Menghitung penyelarasan vektor matriks..." :
                             language.startsWith("ms") ? "Mengira penjajaran vektor matriks..." :
                             language.startsWith("th") ? "กำลังคำนวณการจัดตำแหน่งเวกเตอร์เมทริกซ์..." :
                             "Calculating matrix vectors alignment..."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stateful Interaction / Upgrade Overlay */}
                  {((chatSessions[activeHistoryId] || []).length > 0) && (
                    userTier === "Free" ? (
                      <div className="p-4 border border-dashed border-amber-500/15 bg-amber-500/[0.02] rounded-sm flex flex-col items-center justify-center text-center gap-2">
                        <p className="text-[11px] max-w-[280px] leading-relaxed text-slate-400 font-sans">
                          {language.startsWith("zh")
                            ? "深度 Hexa AI 决策参谋阁聊天是 专属专业顾问版 (Pro) 尊享功能。"
                            : "Interactive Stateful Chat Consultation with Hexa Advisor is reserved for Pro Consultant users."}
                        </p>
                        <button 
                          type="button" 
                          onClick={() => setIsSubscriptionOpen(true)}
                          className="py-2 px-4 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-[11px] uppercase rounded-sm cursor-pointer transition-all duration-150 shadow-md hover:shadow-[#f59e0b]/10 whitespace-nowrap"
                        >
                          {language.startsWith("zh") ? "开阁升级解锁" : "Upgrade to Pro"}
                        </button>
                      </div>
                    ) : (
                      /* Active chat text bar input field */
                      <div className="flex gap-2 font-sans items-center">
                        <input
                          type="text"
                          value={currentChatMessage}
                          onChange={(e) => setCurrentChatMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSendChatMessage();
                            }
                          }}
                          disabled={isChatLoading}
                          placeholder={
                            language.startsWith("zh")
                              ? "问问 HEXA AI..."
                              : "Ask HEXA AI..."
                          }
                          className={`flex-1 text-sm py-2 px-3 focus:outline-none rounded-sm font-sans transition-all ${
                            isDark 
                              ? "bg-black/60 border border-neutral-850 focus:border-cyan-500 placeholder-neutral-600 focus:ring-1 focus:ring-cyan-500/20 text-white" 
                              : "bg-white border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder-slate-400 text-slate-800"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleSendChatMessage}
                          disabled={isChatLoading || !currentChatMessage.trim()}
                          className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer duration-150 shrink-0 shadow-sm"
                          title="Send consultation response"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                          </svg>
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
          </>
        ) : (
          /* Column 2 (Span 8): Idle Screen / Elegant Celestial Zen Grid State */
          <div className="flex-1">
            <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center h-full min-h-[550px] transition-all duration-300 relative overflow-hidden group ${
              isDark 
                ? "bg-[#0b0c10]/15 hover:bg-[#0b0c10]/25" 
                : "bg-white/40 hover:bg-white"
            }`}>
              <div className="relative mb-8">
                {/* Breathing Concentric Loops (4-color halo) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500/10 via-orange-500/10 via-cyan-500/10 to-purple-500/10 filter blur-[28px] scale-150" />
                
                {/* 4-directional compass structure */}
                <div className={`w-28 h-28 rounded-full border flex items-center justify-center relative animate-spin-slow keep-round ${
                  isDark ? "border-white/15" : "border-slate-200"
                }`} style={{ animationDuration: "25s" }}>
                  <Compass className={`w-10 h-10 stroke-[1] ${isDark ? "text-white/20" : "text-slate-300"}`} />
                  
                  {/* Top pointer (12 o'clock) - Red for 1. 当前决策 */}
                  <div className="absolute top-0.5 left-1/2 -ml-1 w-2 h-2 bg-[#ef4444] rounded-full" />
                  
                  {/* Right pointer (3 o'clock) - Orange for 2. 时间 */}
                  <div className="absolute right-0.5 top-1/2 -mt-1 w-2 h-2 bg-[#f97316] rounded-full" />
                  
                  {/* Bottom pointer (6 o'clock) - Blue for 3. 空间 */}
                  <div className="absolute bottom-0.5 left-1/2 -ml-1 w-2 h-2 bg-[#3b82f6] rounded-full" />
                  
                  {/* Left pointer (9 o'clock) - Purple for 4. 意念 */}
                  <div className="absolute left-0.5 top-1/2 -mt-1 w-2 h-2 bg-[#a855f7] rounded-full" />
                </div>
              </div>
              
              <h3 className={`text-base font-medium tracking-widest mb-1.5 uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                {t("idleTitle")}
              </h3>
              <p className={`text-xs max-w-sm leading-relaxed mb-6 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {t("idleSub")}
              </p>

              {/* Dynamic steps checklist panel */}
              <div className={`text-left p-4 rounded-sm border max-w-sm text-[9px] font-mono space-y-2.5 ${
                isDark ? "bg-white/5 border-white/5 text-white/50 divide-y divide-white/5" : "bg-slate-50 border-slate-100 text-slate-500 divide-y divide-slate-100"
              }`}>
                <div className="flex items-center gap-2.5 pb-2">
                  <CheckSquare className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{t("currentDecision")}</span>
                </div>
                <div className="flex items-center gap-2.5 py-2">
                  <CheckSquare className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{t("calibT")}</span>
                </div>
                <div className="flex items-center gap-2.5 py-2">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{t("calibS")}</span>
                </div>
                <div className="flex items-center gap-2.5 pt-2">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>{t("calibK")}</span>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

    </main>

    {/* Immersive Float / Fullscreen History Panel */}
    {isHistoryOpen && (
      <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
        {/* Backdrop (semi-transparent click-away) */}
        <div 
          className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] pointer-events-auto cursor-pointer" 
          onClick={() => setIsHistoryOpen(false)} 
        />
        
        {/* Main Floating Container - Sticky Top & Sticky Right (吸顶吸右) / Fullscreen */}
        <div 
          className={`pointer-events-auto flex flex-col transition-all duration-300 shadow-2xl z-[110] border-l ${
            isHistoryFullscreen 
              ? "fixed inset-0 w-full h-full border-none" 
              : "fixed top-0 right-0 w-[420px] max-w-full h-full"
          } ${
            isDark ? "bg-neutral-950 border-neutral-800 text-neutral-150" : "bg-white border-neutral-200 text-neutral-800"
          }`}
        >
          {/* Control Header Bar for Float Window - Pure Grayscale */}
          <div className={`p-3 border-b flex items-center justify-between shrink-0 ${
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"
          }`}>
            <div className="flex items-center gap-2">
              <History className={`w-4 h-4 ${isDark ? "text-neutral-400" : "text-neutral-500"}`} />
              <span className={`text-[12px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-neutral-100" : "text-neutral-900"
              }`}>
                {t("historyArchive")}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${
                isDark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-200 text-neutral-500"
              }`}>
                {historyItems.length}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Trash / Purge Chronicle Button */}
              {(historyItems.length > 0 || (userTier === "Pro" && getAutomatedMonthlyPushes(language).some(p => !hiddenAutoIds.includes(p.id)))) && (
                <div className="flex items-center gap-1.5 transition-all duration-200">
                  {isConfirmingClear ? (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm border ${
                      isDark 
                        ? "bg-red-950/20 border-red-500/30" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      <button
                        onClick={handleClearAllHistory}
                        className={`px-1.5 py-0.5 text-[8px] font-bold transition-colors cursor-pointer uppercase tracking-wider font-mono ${
                          isDark ? "text-red-400 hover:text-red-300" : "text-red-700 hover:text-red-600"
                        }`}
                      >
                        {language.startsWith("zh") ? "确认清空" : "Confirm"}
                      </button>
                      <span className={`text-[8px] font-mono ${isDark ? "text-red-950" : "text-red-300"}`}>|</span>
                      <button
                        onClick={() => setIsConfirmingClear(false)}
                        className={`px-1.5 py-0.5 text-[8px] font-bold transition-colors cursor-pointer uppercase tracking-wider font-mono ${
                          isDark ? "text-neutral-400 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        {language.startsWith("zh") ? "取消" : "Cancel"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingClear(true)}
                      className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                        isDark ? "text-neutral-400 hover:text-red-400 hover:bg-neutral-800" : "text-neutral-500 hover:text-red-500 hover:bg-neutral-100"
                      }`}
                      title={t("clearAll")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Fullscreen Icon Toggle (clean graphical maximize/minimize, no text labels) */}
              <button
                onClick={() => setIsHistoryFullscreen(!isHistoryFullscreen)}
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  isDark ? "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
                title={isHistoryFullscreen ? (language.startsWith("zh") ? "窗口" : "Exit Fullscreen") : (language.startsWith("zh") ? "全屏" : "Fullscreen")}
              >
                {isHistoryFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => setIsHistoryOpen(false)}
                className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
                  isDark ? "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* History Items List Area */}
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            <HistoryPanel
              historyItems={historyItems}
              activeId={activeHistoryId}
              onSelect={(id) => {
                handleSelectHistory(id);
              }}
              onDelete={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
              language={language}
              isDark={isDark}
              isFullscreen={isHistoryFullscreen}
              userTier={userTier}
              onOpenSubscription={() => setIsSubscriptionOpen(true)}
              hiddenAutoIds={hiddenAutoIds}
            />
          </div>
        </div>
      </div>
    )}



      {/* Persistent global footer */}
      <footer className={`py-4 lg:py-2.5 shrink-0 border-t font-mono uppercase tracking-widest ${
        isDark ? "border-white/5 bg-neutral-950 text-neutral-500" : "border-neutral-200 bg-neutral-800 text-neutral-450"
      }`}>
        <div className="w-full max-w-none flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 xl:px-10 text-[9px] font-normal">
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap text-left">
            <span>{t("systemPulse")}: {t("synchronized")}</span>
            <span className="opacity-30 mx-1.5">•</span>
            {isLoading ? (
              <span>
                {t("confidence")}:{" "}
                <span className="font-bold">
                  {rollingConfidence.toFixed(2)}% [{language.startsWith("zh") ? "计算中..." : "RUNNING..."}]
                </span>
              </span>
            ) : apiResult ? (
              <span>
                {t("confidence")}:{" "}
                <span className="font-bold">
                  {confidenceScore.toFixed(2)}%
                </span>
              </span>
            ) : (
              <span className="opacity-50">
                {t("confidence")}: -- . -- %
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-right">
            <span>{t("suiteFooter")}</span>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="text-[8.5px] text-slate-500 dark:text-neutral-500 select-all font-mono tracking-widest">Version 2.5.30</span>
          </div>
        </div>
      </footer>

      {/* Configuration Console modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isDark={isDark}
      />

      {/* Subscription Deluxe modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        language={language}
        userTier={userTier}
        onUserTierChange={(tier) => {
          setUserTier(tier);
          localStorage.setItem("hexamind_tier", tier);
        }}
        isDark={isDark}
      />
    </div>
  );
}
