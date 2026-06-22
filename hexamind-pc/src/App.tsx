import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import SeedVisualizer from "./components/SeedVisualizer";
import HistoryPanel from "./components/HistoryPanel";
import SettingsModal from "./components/SettingsModal";
import SubscriptionModal from "./components/SubscriptionModal";
import { runMeihuaCalculation, getGanzhiTime, getLocalMeihuaAnalysis, calculateSanCaiConfidence, getWuXingRelationshipInterpretation } from "./utils/meihuaEngine";
import { Language, translationDict } from "./utils/translations";
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
        fontSans: '"Times New Roman", "Times", "Georgia", serif',
        fontSongti: '"Times New Roman", "Times", "Georgia", serif',
        letterSpacing: '0.015em',
        className: 'tracking-normal',
      };
    case "zh-CN":
      return {
        fontSans: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
        fontSongti: '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    case "zh-TW":
      return {
        fontSans: '"PingFang TC", "Noto Sans TC", sans-serif',
        fontSongti: '"PingFang TC", "Noto Sans TC", sans-serif',
        letterSpacing: '0.05em',
        className: 'tracking-wider',
      };
    case "ja":
      return {
        fontSans: '"Hiragino Sans", "Noto Sans JP", "Meiryo", sans-serif',
        fontSongti: '"Hiragino Sans", "Noto Sans JP", "Meiryo", sans-serif',
        letterSpacing: '0.01em',
        className: 'tracking-tight',
      };
    case "ko":
      return {
        fontSans: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
        fontSongti: '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
        letterSpacing: '0.015em',
        className: 'tracking-normal',
      };
    case "es":
      return {
        fontSans: '"Times New Roman", "Times", "Georgia", serif',
        fontSongti: '"Times New Roman", "Times", "Georgia", serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    case "id":
    case "ms":
      return {
        fontSans: '"Times New Roman", "Times", "Georgia", serif',
        fontSongti: '"Times New Roman", "Times", "Georgia", serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    case "th":
      return {
        fontSans: '"Noto Sans Thai", "Sukhumvit Set", sans-serif',
        fontSongti: '"Noto Sans Thai", "Sukhumvit Set", sans-serif',
        letterSpacing: '0.01em',
        className: 'tracking-normal',
      };
    default:
      return {
        fontSans: '"Times New Roman", "Times", "Georgia", serif',
        fontSongti: '"Times New Roman", "Times", "Georgia", serif',
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


export default function App() {
  const [question, setQuestion] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [kineticSpeed, setKineticSpeed] = useState(1.23);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [dateTimeStr, setDateTimeStr] = useState<string>("");

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

      if (updatedResult.payload) {
        const payload = updatedResult.payload;
        const newHistItem: DivinationHistoryItem = {
          id: `キャスト-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "午の刻 (11:00-13:00)" : "卯の刻 (05:00-07:00)")
            : language === "ko"
            ? (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "오시 (11:00-13:00)" : "묘시 (05:00-07:00)")
            : (localCalculatedPayload.tiGua.trigram.element === "Fire" ? "Hour of the Horse (11:00-13:00)" : "Hour of the Rabbit (05:00-07:00)")
        }
      };

      // Save successful transaction stats and cooldown
      localStorage.setItem("hexamind_quota_data", JSON.stringify({ date: todayStr, count: dailyCount + 1 }));
      localStorage.setItem("hexamind_last_query_time", Date.now().toString());

      setApiResult(localResult);

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
        catalystWindow: "Double-hours of peak elemental coordination."
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
            ? "text-cyan-400 bg-cyan-950/20" 
            : "text-cyan-800 bg-cyan-50/40",
          text: isDark ? "text-[#06b6d4]" : "text-cyan-800",
          iconColor: "text-[#06b6d4]",
          badge: "bg-[#06b6d4] text-black",
          desc: t("descExtremAusp")
        };
      case "Auspicious Growth":
      case "Auspicious":
      case "吉":
        return {
          bg: isDark ? "text-cyan-200 bg-emerald-950/20" : "text-emerald-800 bg-emerald-50/40",
          text: isDark ? "text-cyan-400" : "text-emerald-800",
          iconColor: isDark ? "text-cyan-400" : "text-emerald-600",
          badge: isDark ? "bg-cyan-500 text-black" : "bg-emerald-500 text-white",
          desc: t("descAusp")
        };
      case "Equilibrium":
      case "体用比和":
        return {
          bg: isDark ? "bg-white/5" : "bg-white",
          text: isDark ? "text-white/90" : "text-slate-900",
          iconColor: isDark ? "text-white/60" : "text-slate-500",
          badge: isDark ? "bg-white text-black" : "bg-slate-800 text-white",
          desc: t("descEquil")
        };
      case "Leaking / Drainage":
      case "Leak":
      case "泄":
        return {
          bg: isDark ? "text-blue-300 bg-blue-950/20" : "text-blue-800 bg-blue-50/40",
          text: isDark ? "text-blue-400" : "text-blue-700",
          iconColor: "text-blue-400",
          badge: isDark ? "bg-blue-500 text-black" : "bg-blue-600 text-white",
          desc: t("descLeak")
        };
      case "Warning / Conflict":
      case "Exhausting":
      case "平":
        return {
          bg: isDark ? "text-amber-200 bg-amber-950/15" : "text-amber-800 bg-amber-50/45",
          text: isDark ? "text-[#f59e0b]" : "text-amber-800",
          iconColor: "text-[#f59e0b]",
          badge: "bg-[#f59e0b] text-black",
          desc: t("descWarning")
        };
      case "Systemic Risk":
      case "Highly Inauspicious":
      case "凶":
        return {
          bg: isDark ? "text-rose-300 bg-rose-950/20" : "text-rose-800 bg-rose-50/40",
          text: isDark ? "text-rose-400" : "text-rose-800",
          iconColor: "text-rose-400",
          badge: "bg-rose-500 text-white",
          desc: t("descRisk")
        };
      default:
        return {
          bg: isDark ? "bg-white/5" : "bg-white",
          text: isDark ? "text-white/80" : "text-slate-800",
          iconColor: isDark ? "text-white/40" : "text-slate-400",
          badge: defaultColor,
          desc: "Standard metaphysical diagnostic verdict."
        };
    }
  };

  const activeVerdict = apiResult?.aiOutput?.verdict;
  const cardStyle = getVerdictCardStyles(activeVerdict);

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
              isDark ? "text-cyan-400" : "text-cyan-700"
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-[pulse_1.5s_infinite]" />
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
      className={`min-h-screen font-sans flex flex-col selection:bg-[#f59e0b] selection:text-black relative overflow-hidden transition-colors duration-300 ${bodyBgClass} ${fontSettings.className}`}
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
      <main className={`flex-1 w-full max-w-none p-0 flex flex-col lg:flex-row gap-0 items-stretch relative z-10 border-t ${
        isDark ? "border-white/10" : "border-slate-200"
      }`}>
        
        {/* Core Workspace Area: Casting panel + Result panels */}
        <div className={`flex-1 w-full flex flex-col lg:flex-row gap-0 items-stretch divide-y lg:divide-y-0 lg:divide-x ${
          isDark ? "divide-white/10 bg-white/[0.01]" : "divide-slate-200 bg-slate-50/20"
        }`}>
          
          {/* Left Side: parameters & shortcuts */}
          <div className="w-full lg:w-[380px] lg:shrink-0 flex flex-col">
          
          {/* Casting Form Frame */}
          <div className={cardBgStyle}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-[#f59e0b] animate-pulse" />
              <div>
                <h2 className={`text-[14px] font-mono font-bold uppercase tracking-wider ${textTitleClass}`}>
                  {t("inceptionTitle")}
                </h2>
              </div>
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
                    <HelpCircle className="w-4 h-4 text-red-500 animate-[pulse_2s_infinite] shrink-0" />
                    <span>{t("currentDecision")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={cyclePresetQuestion}
                    title="切换决策预设"
                    className="p-1.5 rounded-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center active:scale-95 group"
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
                    className={`w-full rounded-sm p-3 text-[10px] font-normal focus:ring-1 focus:ring-slate-400 dark:focus:ring-white/20 font-sans transition-all resize-none h-20 overflow-hidden ${
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
                    <Clock className="w-4 h-4 text-orange-500 animate-[pulse_2.2s_infinite] shrink-0" />
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
                    className="text-[9px] font-mono font-normal text-orange-500 hover:text-orange-400 border border-orange-500/30 hover:border-orange-500/50 px-1.5 py-0.5 rounded-sm transition-all bg-orange-500/5 active:scale-95 cursor-pointer select-none"
                  >
                    {t("injectTimeBtn")}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="relative w-full">
                    {/* Visual presentation layer with matching style & gray colors */}
                    <div className={`w-full rounded-sm py-1.5 px-2 text-[12px] font-normal font-mono border flex items-center justify-between pointer-events-none ${
                      isDark 
                        ? "bg-black/55 border-white/10 text-white/40" 
                        : "bg-white border-slate-200 text-slate-400"
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
                  <div className="text-[13px] font-mono font-normal text-slate-400 dark:text-white/40 mt-1.5">
                    {timestamp ? (
                      <div>{(language === "zh-CN" || language === "language" || language === "zh-TW") ? "" : `${t("lunarTimeLabel")}: `}{getGanzhiTime(timestamp)}</div>
                    ) : (
                      <div className="text-slate-400 dark:text-white/40 animate-pulse text-[13px]">
                        <span className="font-bold mr-1">!</span> {t("emptyTimeWarning")}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: 空间定位 (Blue-Green / Cyan) */}
              <div className={`space-y-3.5 p-3.5 rounded-sm border relative ${
                isDark 
                  ? "border-cyan-500/30 bg-cyan-500/[0.02]" 
                  : "border-cyan-500/20 bg-cyan-500/[0.01]"
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
                    <Lock className={`w-5 h-5 mb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"} animate-[pulse_2s_infinite]`} />
                    <p className="text-[10px] font-mono uppercase font-bold tracking-wider">{t("geolocationLocked")}</p>
                    <p className={`text-[9px] mt-1.5 max-w-[210px] leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("geolocationLockedDesc")}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] font-mono font-bold text-cyan-500 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-cyan-500 animate-[pulse_1.8s_infinite] shrink-0" />
                    <span>{t("spatialCoordinates")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={triggerGPSLocate}
                    className="text-[9px] font-mono font-normal text-cyan-500 hover:text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 px-1.5 py-0.5 rounded-sm transition-all bg-cyan-500/5 active:scale-95 cursor-pointer select-none"
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
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="--"
                      value={latitude}
                      readOnly
                      className={`w-full rounded-sm py-1 px-2 text-[12px] font-normal font-mono focus:outline-none ${
                        isDark ? "bg-black/40 border-white/5 text-white/70" : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] sm:text-[11px] font-mono font-normal uppercase text-slate-400 dark:text-white/40 leading-none">
                      {t("longitude")}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="--"
                      value={longitude}
                      readOnly
                      className={`w-full rounded-sm py-1 px-2 text-[12px] font-normal font-mono focus:outline-none ${
                        isDark ? "bg-black/40 border-white/5 text-white/70" : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}
                    />
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
                    <Lock className={`w-5 h-5 mb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"} animate-[pulse_2s_infinite]`} />
                    <p className="text-[10px] font-mono uppercase font-bold tracking-wider">{t("kineticLocked")}</p>
                    <p className={`text-[9px] mt-1.5 max-w-[210px] leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>{t("kineticLockedDesc")}</p>
                  </div>
                )}

                <div className="flex items-start justify-between gap-1.5 min-h-[22px]">
                  <span className="flex items-start gap-2 text-[12px] font-mono font-bold text-purple-400 uppercase tracking-wider max-w-[62%] leading-normal">
                    <Activity className="w-4 h-4 text-purple-500 animate-[pulse_1.5s_infinite] shrink-0 mt-0.5" />
                    <span className="break-words">{t("mindKineticVector")}</span>
                  </span>
                  <button
                    type="button"
                    onClick={resetScratchBoard}
                    disabled={!isScratchLocked || isLoading}
                    className={`text-[9px] font-mono font-normal text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 px-1.5 py-0.5 rounded-sm transition-all bg-purple-500/5 active:scale-95 cursor-pointer select-none shrink-0 max-w-[36%] text-center truncate ${
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
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-blue-950/30 to-slate-950 flex flex-col items-center justify-center pointer-events-none select-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18)_0%,transparent_75%)] animate-[pulse_3s_infinite]" />
                      <p className="text-[12px] font-mono font-normal text-purple-200 tracking-widest uppercase animate-pulse">
                        {t("cosmicAlignmentFormed")}
                      </p>
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
                      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-[1px] pointer-events-all px-4 animate-fade-in text-center ${
                        isDark ? "bg-black/85" : "bg-white/95"
                      }`}>
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
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-[#06b6d4] transition-all z-10 pointer-events-none" style={{ width: `${scratchProgress}%` }} />
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
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:scale-[1.01] active:scale-[0.99]"
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

        </div>

        {apiResult ? (
          <>
            {/* Column 2: Module 1 & Module 2 Charts */}
            <div className={`flex-1 flex flex-col divide-y ${isDark ? "divide-white/10" : "divide-slate-200"} animate-fade-in`}>
              
              {/* Module 1: Seed & Gua Charts Visualizer screen */}
              <div className={cardBgStyle}>
                <div className="flex items-center justify-between pb-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#06b6d4]" />
                    <div>
                      <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${textTitleClass}`}>
                        {t("mod1Title")}
                      </h2>
                      <p className={`text-[10px] font-mono ${textSubClass}`}>
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
                    <span className="text-[#f59e0b] font-normal text-[9px]">{apiResult.payload.temporalSeed.hex}</span>
                  </div>
                  <div>
                    <span className="block opacity-75 uppercase font-normal">{t("sSeedLatLng")}</span>
                    <span className={`font-normal text-[9px] ${isDark ? "text-white/80" : "text-slate-800"}`}>
                      {apiResult.payload.spatialSeed.formatted}
                    </span>
                  </div>
                  <div>
                    <span className="block opacity-75 uppercase font-normal">{t("kSeedAcc")}</span>
                    <span className="text-[#06b6d4] font-normal text-[9px]">{apiResult.payload.kineticSeed.rawValue.toFixed(3)} m/s²</span>
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
                  <Compass className="w-4 h-4 text-[#f59e0b]" />
                  <div>
                    <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${textTitleClass}`}>
                      {t("mod2Title")}
                    </h2>
                    <p className={`text-[10px] font-mono ${textSubClass}`}>
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
                      <span className={`absolute left-2 top-2 px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider ${
                        isDark ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-600"
                      }`}>
                        {t("tiGua")}
                      </span>
                      <span className={`block text-[9px] uppercase font-mono mt-3 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                        {t("tiSub")}
                      </span>
                      <div className={`text-3xl font-serif my-2 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                        {apiResult.payload.tiGua.trigram.name}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#06b6d4]/10 text-[#06b6d4] rounded-sm border border-[#06b6d4]/20 font-bold uppercase">
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
                      <span className={`absolute left-2 top-2 px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-wider ${
                        isDark ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-600"
                      }`}>
                        {t("yongGua")}
                      </span>
                      <span className={`block text-[9px] uppercase font-mono mt-3 ${isDark ? "text-white/40" : "text-slate-400"}`}>
                        {t("yongSub")}
                      </span>
                      <div className={`text-3xl font-serif my-2 font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                        {apiResult.payload.yongGua.trigram.name}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded-sm border border-[#f59e0b]/20 font-bold uppercase">
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
                      <span className={`text-[8px] uppercase tracking-wider font-mono block mb-1 font-bold ${
                        isDark ? "text-white/40" : "text-slate-400"
                      }`}>
                        {t("formulaMatrix")}
                      </span>
                      <h4 className="text-base font-serif font-semibold text-[#06b6d4] flex items-center gap-2">
                        {apiResult.payload.relationship.conclusion}
                        {!(language === "zh-CN" || language === "zh-TW") && (
                          <span className={`text-xs font-mono font-normal ${isDark ? "text-white/40" : "text-slate-400"}`}>
                            ({apiResult.payload.relationship.type})
                          </span>
                        )}
                      </h4>
                    </div>

                    <p className={`text-xs leading-relaxed mt-4 italic p-3 rounded-sm border font-serif ${
                      isDark ? "bg-white/5 border-white/5 text-white/90" : "bg-white border-slate-100 text-slate-700"
                    }`}>
                      "{getWuXingRelationshipInterpretation(
                        apiResult.payload.relationship.conclusion,
                        apiResult.payload.tiGua.trigram.element,
                        apiResult.payload.yongGua.trigram.element,
                        language
                      )}"
                    </p>

                    <div className={`mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-[9px] font-mono uppercase font-bold ${
                      isDark ? "text-white/40 border-white/5" : "text-slate-400 border-slate-200"
                    }`}>
                      <span>{t("dynamicTrigger")}</span>
                      <span className="text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 border border-[#f59e0b]/20 rounded-sm">
                        {t("changingLineTrigger").replace("{line}", apiResult.payload.changingLine.toString())}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Column 3: AI decision centre & Footer */}
            <div className={`flex-1 flex flex-col divide-y ${isDark ? "divide-white/10" : "divide-slate-200"} animate-fade-in`}>
              
              {/* Module 3: AI decision centre */}
              <div className={`p-4 md:p-5 transition-all duration-350 font-songti ${cardStyle.bg}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 mb-4 gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`w-4 h-4 ${cardStyle.iconColor}`} />
                    <div>
                      <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
                        {t("mod3Title")}
                      </h2>
                      <p className={`text-[10px] font-mono ${isDark ? "text-white/45" : "text-slate-500"}`}>
                        {t("mod3Sub")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Verdict Badge */}
                  <div className={`text-[9.5px] font-mono font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 tracking-wider uppercase ${cardStyle.badge}`}>
                    <Award className="w-3.5 h-3.5" />
                    <span>{t("ausp_" + activeVerdict) || activeVerdict}</span>
                  </div>
                </div>

                <div className="space-y-6 font-songti">
                  {/* Verdict descriptive intro */}
                  <p className={`text-xs italic mt-1 pb-3 border-b font-songti ${
                    isDark ? "text-white/60 border-white/5" : "text-slate-600 border-slate-100"
                  }`}>
                    "{cardStyle.desc}"
                  </p>

                  {/* Strategic analysis log text */}
                  <div>
                    <h4 className={`text-[9px] font-mono font-bold uppercase tracking-widest mb-2.5 ${
                      isDark ? "text-white/40" : "text-slate-400"
                    }`}>
                      {t("evalAnalysis")}
                    </h4>
                    <div className={`border p-4 rounded-sm text-xs leading-relaxed font-songti ${
                      isDark ? "bg-black/40 border-white/5 text-white/95" : "bg-white border-slate-100 text-slate-700"
                    }`}>
                      {renderAnalysis(apiResult.aiOutput?.analysis || "")}
                    </div>
                  </div>

                  {/* Interactive localized task milestones guides */}
                  <div>
                    <h4 className={`text-[9px] font-mono font-bold uppercase tracking-widest mb-3 ${
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

                        return (
                          <div key={aIdx} className={`flex flex-col gap-2 p-3 rounded-sm border ${
                            isDark ? "bg-black/25 border-white/5 text-white/80" : "bg-white border-slate-200/80 text-slate-700"
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className={`h-5 w-5 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
                                isDark ? "bg-white/5 text-[#06b6d4] border-white/10" : "bg-slate-100 text-cyan-600 border-slate-200"
                              }`}>
                                0{aIdx + 1}
                              </div>
                              <span className="text-xs leading-relaxed font-songti flex-1">
                                {displayText}
                              </span>
                            </div>

                            {triggerText && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleSendChatMessage(triggerText);
                                  setTimeout(() => {
                                    const chatContainer = document.getElementById("hexa-terminal-scroller");
                                    if (chatContainer) {
                                      chatContainer.scrollIntoView({ behavior: "smooth", block: "center" });
                                    }
                                  }, 100);
                                }}
                                className={`self-start mt-1 flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono tracking-wide uppercase border rounded-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                                  isDark 
                                    ? "bg-cyan-950/20 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/45"
                                    : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-400"
                                }`}
                              >
                                <Sparkles className="w-3.5 h-3.5 animate-[pulse_2s_infinite]" />
                                <span>{language.startsWith("zh") ? "⚡ 模拟此战术推演" : "⚡ Simulate This Strategy"}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stacking metatags vertically inside Column 3 to maximize horizontal breath */}
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {/* Waixing */}
                    <div className={`border p-4 rounded-sm ${
                      isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <span className={`text-[8px] uppercase tracking-wider font-mono block mb-1.5 font-bold ${
                        isDark ? "text-white/40" : "text-slate-400"
                      }`}>
                        {t("phenomEcho")}
                      </span>
                      <p className={`text-xs leading-relaxed font-songti ${isDark ? "text-white/70" : "text-slate-600"}`}>
                        {apiResult.aiOutput?.phenomenologicalEcho}
                      </p>
                    </div>

                    {/* Yingqi / Catalyst Window */}
                    <div className={`border p-4 rounded-sm flex flex-col justify-between ${
                      isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <div>
                        <span className={`text-[8px] uppercase tracking-wider font-mono block mb-1.5 font-bold ${
                          isDark ? "text-white/40" : "text-slate-400"
                        } flex items-center gap-1`}>
                          <span>{t("catalystWindow")}</span>
                          <Sparkles className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        </span>

                        {/* Fully Unlocked YingQi + Real Interactive Calendar Sync for All Users! */}
                        <div className="space-y-2 mt-1">
                          <div className={`text-xs leading-relaxed font-songti flex items-center gap-1.5 ${isDark ? "text-white/70" : "text-slate-600"}`}>
                            <Clock className="w-4 h-4 text-emerald-500 shrink-0 animate-[pulse_1.5s_infinite]" />
                            <span>
                              {apiResult.aiOutput?.catalystWindow || "HOUR OF THE RABBIT (05:00-07:00)"}
                            </span>
                          </div>

                          {/* Live Calendar synchronization wizard */}
                          <div className="mt-2.5 border-t border-emerald-500/10 pt-2 bg-transparent">
                            {calendarSyncStatus === "idle" ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCalendarSyncStatus("syncing");
                                  setTimeout(() => {
                                    setCalendarSyncStatus("success");
                                  }, 1500);
                                }}
                                className="w-full text-center py-0.5 px-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800/80 dark:text-emerald-300/75 opacity-75 hover:opacity-100 border border-emerald-500/10 font-mono font-normal text-[6px] tracking-wide rounded-sm uppercase cursor-pointer transition-all flex items-center justify-center gap-1"
                              >
                                {t("syncToSysCalendar")}
                              </button>
                            ) : calendarSyncStatus === "syncing" ? (
                              <div className="p-1 px-2 bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 rounded-sm text-[7.2px] font-mono uppercase tracking-wide flex items-center justify-center gap-1 animate-pulse">
                                <span>{t("shakingHandsWithCalendar")}</span>
                              </div>
                            ) : (
                              <div className="p-1 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-sm text-[7.2px] font-mono leading-relaxed uppercase tracking-wide">
                                <span className="font-bold flex items-center gap-1 mb-0.5 text-emerald-400"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> {t("calendarIntegrated")}</span>
                                {t("calendarIntegratedDesc")} {question.slice(0, 18)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Independent Prime Coordinating & Auspicious Zodiac Days Panel */}
                    <div className={`border p-4 rounded-sm ${
                      isDark ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-200/80"
                    }`}>
                      <span className={`text-[8px] uppercase tracking-wider font-mono block mb-1.5 font-bold ${
                        isDark ? "text-white/40" : "text-slate-400"
                      }`}>
                        {t("primeCoordinating")}
                      </span>
                      {(() => {
                        const coord = getPrimeCoordinatingDetails();
                        if (!coord) return null;
                        return (
                          <div className="space-y-1.5 mt-1 font-songti">
                            <div className={`text-xs ${isDark ? "text-white/70" : "text-slate-600"}`}>
                              <span className={`font-mono text-[9px] uppercase tracking-wider block font-bold ${isDark ? "text-[#06b6d4]" : "text-cyan-700"}`}>
                                {t("supportingElementalForce")}
                              </span>
                              <span className="font-bold">{coord.element}</span>
                            </div>
                            <div className={`text-xs ${isDark ? "text-white/70" : "text-slate-600"} mt-0.5`}>
                              <span className={`font-mono text-[9px] uppercase tracking-wider block font-bold ${isDark ? "text-[#f59e0b]" : "text-amber-700"}`}>
                                {t("auspiciousZodiacDays")}
                              </span>
                              <span>{coord.zodiacs} <span className="text-[10px] opacity-60 font-mono">({coord.favorableDays})</span></span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>
              </div>

              {/* Module 5: Hexa AI Stateful Terminal Chat Portal */}
              {activeHistoryId && apiResult && (
                <div className={`p-4 md:p-5 border-t transition-all duration-350 font-mono ${
                  isDark ? "bg-[#0d1322] border-white/5" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-dashed border-cyan-500/15">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <h3 className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                        isDark ? "text-cyan-400" : "text-cyan-700"
                      }`}>
                        ⚡ Hexa AI Chat Counsel
                      </h3>
                    </div>
                    <span className="text-[8px] opacity-50 tracking-widest uppercase">
                      Session: {activeHistoryId.slice(0, 8)}
                    </span>
                  </div>

                  {/* Chat message display area */}
                  <div 
                    id="hexa-terminal-scroller"
                    className={`h-[240px] overflow-y-auto pr-1 mb-3 space-y-3 custom-scrollbar text-[11px] placeholder-neutral-400 p-2 rounded-sm ${
                      isDark ? "bg-black/40 text-neutral-300" : "bg-white text-neutral-700 border border-slate-100"
                    }`}
                  >
                    {/* Opening welcome briefing from advisor if this session has no message history */}
                    {(!chatSessions[activeHistoryId] || chatSessions[activeHistoryId].length === 0) && (
                      <div className="space-y-1 bg-cyan-950/5 dark:bg-white/5 border border-dashed border-cyan-500/10 p-2.5 rounded-sm">
                        <span className="text-[8.5px] font-extrabold text-cyan-400 block uppercase">
                          ⚜️ [ Hexa Advisor Alignment Briefing ]
                        </span>
                        <p className="leading-relaxed font-songti text-[10.5px]">
                          {language.startsWith("zh")
                            ? `我是 Hexa 决策参谋。已挂载本卷轴的五行运数。请在下方输入您考虑的战术变化（如：延长收账期限、重构履约合同、引入第三方担保、进行仓储对冲），以便精确推演您的策略抉择、资金安全（体卦）和外部应力（用卦）的动态转化。`
                            : `I am Hexa Counselor. The energetic attributes of this session's hexagram are securely locked into place. Specify your strategic operational adjustments (such as: lengthening credit periods, relocating supply chain bottlenecks, introducing sovereign guarantees, or hedging inventory buffers) to calculate the cyclical transformed elements.`}
                        </p>
                      </div>
                    )}

                    {/* Chat Messages */}
                    {(chatSessions[activeHistoryId] || []).map((msg, mIdx) => (
                      <div key={mIdx} className="space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8.5px] font-extrabold tracking-wider uppercase ${
                            msg.role === "user" ? "text-slate-400" : "text-cyan-400"
                          }`}>
                            {msg.role === "user" ? `👤 [ Executive Proposer ]` : `🏛️ [ Hexa AI Counsel ]`}
                          </span>
                          <span className="text-[7.5px] opacity-35 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className={`leading-relaxed font-songti text-[11px] p-2 rounded-sm whitespace-pre-wrap ${
                          msg.role === "user" 
                            ? isDark ? "bg-white/5 border border-white/5" : "bg-slate-100 border border-slate-200/50"
                            : isDark ? "bg-[#0d1322]" : "bg-cyan-50/20"
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}

                    {/* Chat Error Indicator */}
                    {chatError && (
                      <div className="p-2 border border-dashed border-rose-500/20 bg-rose-950/10 rounded-xs text-[10px] text-rose-400 leading-normal text-left">
                        {chatError}
                      </div>
                    )}

                    {/* Chat Loading Placeholder */}
                    {isChatLoading && (
                      <div className="flex items-center gap-2 p-1.5 opacity-70 animate-pulse text-[9.5px]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-500" />
                        <span>Calculating matrix vectors alignment...</span>
                      </div>
                    )}
                  </div>

                  {/* Stateful Interaction / Upgrade Overlay */}
                  {userTier === "Free" ? (
                    <div className="p-3 border border-dashed border-rose-500/20 bg-rose-500/5 rounded-sm flex flex-col items-center justify-center text-center gap-2">
                      <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
                      <p className="text-[9.5px] max-w-[280px] leading-relaxed text-slate-400 font-sans">
                        {language.startsWith("zh")
                          ? "深度 Hexa AI 决策参谋阁聊天是 专属专业顾问版 (Pro) 尊享功能。"
                          : "Interactive Stateful Chat Consultation with Hexa Advisor is reserved for Pro Consultant users."}
                      </p>
                      <button 
                        type="button" 
                        onClick={() => setIsSubscriptionOpen(true)}
                        className="py-1 px-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold tracking-wider text-[8.5px] uppercase rounded-sm cursor-pointer"
                      >
                        {language.startsWith("zh") ? "升级顾问版解锁" : "Upgrade to Pro"}
                      </button>
                    </div>
                  ) : (
                    /* Active chat text bar input field */
                    <div className="flex gap-2">
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
                            ? "输入业务方案调整以请求变卦五行推演..."
                            : "Enter hypothetical strategic operational change..."
                        }
                        className={`flex-1 text-xs py-2 px-3 focus:outline-none rounded-sm font-sans transition-all ${
                          isDark 
                            ? "bg-black/60 border border-neutral-850 focus:border-cyan-500 placeholder-neutral-600 focus:ring-1 focus:ring-cyan-500/20 text-white" 
                            : "bg-white border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 placeholder-slate-400 text-slate-800"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleSendChatMessage}
                        disabled={isChatLoading || !currentChatMessage.trim()}
                        className="p-2 border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 rounded-sm hover:bg-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-xs uppercase font-bold tracking-wider hover:border-cyan-400 transition-all duration-200"
                        title="Send consultation response"
                      >
                        {language.startsWith("zh") ? "咨 询" : "Consult"}
                      </button>
                    </div>
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-500/10 via-orange-500/10 via-cyan-500/10 to-purple-500/10 filter blur-[28px] animate-pulse scale-150" />
                
                {/* 4-directional compass structure */}
                <div className={`w-28 h-28 rounded-full border flex items-center justify-center relative animate-spin-slow keep-round ${
                  isDark ? "border-white/15" : "border-slate-200"
                }`} style={{ animationDuration: "25s" }}>
                  <Compass className={`w-10 h-10 stroke-[1] ${isDark ? "text-white/20" : "text-slate-300"}`} />
                  
                  {/* Top pointer (12 o'clock) - Red for 1. 当前决策 */}
                  <div className="absolute top-0.5 left-1/2 -ml-1 w-2 h-2 bg-[#ef4444] rounded-full" />
                  
                  {/* Right pointer (3 o'clock) - Orange for 2. 时间 */}
                  <div className="absolute right-0.5 top-1/2 -mt-1 w-2 h-2 bg-[#f97316] rounded-full" />
                  
                  {/* Bottom pointer (6 o'clock) - Blue/Cyan for 3. 空间 */}
                  <div className="absolute bottom-0.5 left-1/2 -ml-1 w-2 h-2 bg-[#06b6d4] rounded-full" />
                  
                  {/* Left pointer (9 o'clock) - Purple for 4. 意念 */}
                  <div className="absolute left-0.5 top-1/2 -mt-1 w-2 h-2 bg-[#a855f7] rounded-full" />
                </div>
              </div>
              
              <h3 className={`text-base font-serif font-medium tracking-widest mb-1.5 uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                {t("idleTitle")}
              </h3>
              <p className={`text-xs max-w-sm leading-relaxed mb-6 font-serif ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {t("idleSub")}
              </p>

              {/* Dynamic steps checklist panel */}
              <div className={`text-left p-4 rounded-sm border max-w-sm text-[9px] font-mono space-y-2.5 ${
                isDark ? "bg-white/5 border-white/5 text-white/50 divide-y divide-white/5" : "bg-slate-50 border-slate-100 text-slate-500 divide-y divide-slate-100"
              }`}>
                <div className="flex items-center gap-2.5 pb-2">
                  <CheckSquare className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                  <span>{t("currentDecision")}</span>
                </div>
                <div className="flex items-center gap-2.5 py-2">
                  <CheckSquare className="w-3.5 h-3.5 text-orange-500 animate-pulse shrink-0" />
                  <span>{t("calibT")}</span>
                </div>
                <div className="flex items-center gap-2.5 py-2">
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-500 animate-pulse shrink-0" />
                  <span>{t("calibS")}</span>
                </div>
                <div className="flex items-center gap-2.5 pt-2">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-500 animate-pulse shrink-0" />
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
      <footer className={`py-6 border-t font-mono uppercase tracking-widest mt-auto ${
        isDark ? "border-white/10 bg-black/60 text-zinc-400" : "border-slate-200 bg-slate-100 text-slate-600"
      }`}>
        <div className="w-full max-w-none flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 xl:px-10 text-[9px] font-normal">
          <div className="flex flex-row items-center gap-1.5 whitespace-nowrap text-left">
            <span>{t("systemPulse")}: {t("synchronized")}</span>
            <span className="opacity-30 mx-1.5">•</span>
            <span>{t("confidence")}: {confidenceScore.toFixed(2)}%</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-right">
            <span>{t("suiteFooter")}</span>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="text-cyan-600 dark:text-cyan-500">Version 2.5.0 (Iter-Build: 2026.05.24)</span>
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
