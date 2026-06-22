import React, { useState } from "react";
import { Trash2, Search, Calendar, Lock, Sparkles, Clock } from "lucide-react";
import { DivinationHistoryItem } from "../types";
import { Language, translationDict } from "../utils/translations";
import { getAutomatedMonthlyPushes } from "../utils/automatedPushes";

interface HistoryPanelProps {
  historyItems: DivinationHistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  language: Language;
  isDark: boolean;
  onCollapse?: () => void;
  isFullscreen?: boolean;
  userTier: "Free" | "Pro";
  onOpenSubscription?: () => void;
  hiddenAutoIds?: string[];
}

export default function HistoryPanel({
  historyItems,
  activeId,
  onSelect,
  onDelete,
  onClearAll,
  language,
  isDark,
  onCollapse,
  isFullscreen = false,
  userTier,
  onOpenSubscription,
  hiddenAutoIds = [],
}: HistoryPanelProps) {
  const [search, setSearch] = useState("");
  const t = (key: string) => translationDict[language][key] || key;

  const getVectorSummary = (concl: string, lang: Language) => {
    const isZh = lang.startsWith("zh");
    switch (concl) {
      case "用生体":
        return isZh ? "用生体 — 外部赋能 / 供能通畅 (Yong Generates Ti)" : "Yong Generates Ti — Generative Input";
      case "体用比和":
        return isZh ? "体用比和 — 平衡共生 / 双向赋能 (Equal Cohesion)" : "Equal Cohesion — Balanced Synergy";
      case "体生用":
        return isZh ? "体生用 — 资本支出 / 动能外泄 (Ti Generates Yong)" : "Ti Generates Yong — Capital Outflow";
      case "体克用":
        return isZh ? "体克用 — 强力掌控 / 控制局面 (Ti Controls Yong)" : "Ti Controls Yong — Mastered Capture";
      case "用克体":
        return isZh ? "用克体 — 高危摩擦 / 外部压制 (Yong Controls Ti)" : "Yong Controls Ti — High Risk Clash";
      default:
        return concl;
    }
  };

  const getAuspBadgeLabel = (aStr: string) => {
    if (aStr === "Extremely Auspicious" || aStr === "大吉") return t("badgeMaxAdv");
    if (aStr === "Auspicious" || aStr === "吉") return t("badgeAdv");
    if (aStr === "Highly Inauspicious" || aStr === "凶") return t("badgeHighRisk");
    if (aStr === "Leak" || aStr === "泄") return t("badgeLeak");
    if (aStr === "Exhausting" || aStr === "平") return t("badgeExhausting");
    try {
      return aStr.replace("Inauspicious", t("badgeHighRisk")).replace("Auspicious", t("badgeAdv")).replace("Extremely", t("badgeMaxAdv"));
    } catch (_) {
      return aStr;
    }
  };

  // Build the list of items
  let displayItems = [...(historyItems || [])];

  // For Pro user: prepend the background-generated record if not hidden
  if (userTier === "Pro") {
    const automatedMonthlyPushes = getAutomatedMonthlyPushes(language);
    // Prevent duplicate entries and don't show if hidden/deleted
    automatedMonthlyPushes.forEach(item => {
      const isHidden = hiddenAutoIds.includes(item.id);
      if (!isHidden && !displayItems.some(existing => existing.id === item.id)) {
        displayItems = [item, ...displayItems];
      }
    });
  }

  const filteredItems = displayItems.filter(item => {
    if (!item) return false;
    const q = (item.question || "").toLowerCase();
    const og = (item.originalGua || "").toLowerCase();
    const c = (item.conclusion || "").toLowerCase();
    const s = (search || "").toLowerCase();
    return q.includes(s) || og.includes(s) || c.includes(s);
  });

  const mainClass = isDark
    ? "bg-transparent text-neutral-100"
    : "bg-white text-neutral-800";

  const mutedTextClass = isDark ? "text-neutral-500" : "text-neutral-400";
  
  const searchBgClass = isDark
    ? "bg-black/40 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:border-neutral-700"
    : "bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-400";

  return (
    <div className={`p-4 flex flex-col h-full transition-all duration-300 ${mainClass}`}>
      {/* Search Bar */}
      <div className="relative mb-4 shrink-0">
        <Search className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${mutedTextClass}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={`w-full rounded-sm py-1.5 pl-9 pr-4 text-xs focus:outline-none font-sans transition-colors ${searchBgClass}`}
        />
      </div>

      {/* Scrollable Ledger Area */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {userTier === "Free" ? (
          /* Free tier lock state card display */
          <div className="space-y-3">
            <div 
              onClick={onOpenSubscription}
              className={`cursor-pointer border border-dashed p-4 rounded-sm transition-all duration-300 relative text-center overflow-hidden min-h-[170px] flex flex-col justify-center items-center ${
                isDark 
                  ? "bg-[#0d1322] border-rose-500/20 hover:border-rose-500/50" 
                  : "bg-slate-50 border-rose-450/30 hover:border-rose-450/60"
              }`}
            >
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-4">
                <Lock className="w-5 h-5 text-rose-500 mb-2 animate-bounce" />
                <h4 className="text-[11px] font-mono tracking-wider font-bold text-rose-400 uppercase">🔒 {language.startsWith("zh") ? "历史决断卷轴闭锁" : "Locked History Ledger"}</h4>
                <p className="text-[9px] leading-relaxed mt-1.5 max-w-[210px] text-center text-slate-350 font-sans">
                  {language.startsWith("zh") 
                    ? "升级至 专业顾问版 (Pro) 即可解锁历史决策卷轴、月度企业资产矩阵自动盘点及 Hexa AI 决策参谋阁上下文追踪。"
                    : "Upgrade to Professional Plan to unlock the Historical Judgment Ledger, automated monthly matrix calculations, and deep Hexa AI context tracking."}
                </p>
                <button 
                  type="button"
                  className="mt-3.5 text-[8px] font-mono font-bold bg-gradient-to-r from-orange-500 to-purple-600 text-white px-3 py-1 rounded-sm uppercase tracking-wider hover:opacity-95 cursor-pointer"
                >
                  {language.startsWith("zh") ? "开阁解锁顾问版" : "Upgrade to Pro"}
                </button>
              </div>
            </div>

            {/* In-memory Temporary Recents if any, clearly stating they are volatile */}
            {filteredItems.length > 0 && (
              <div className="border-t border-neutral-800/60 pt-3">
                <p className="text-[9px] font-mono text-center text-slate-500 uppercase tracking-wider mb-2">
                  ⚠️ {language.startsWith("zh") ? "未存档临时最近查询" : "Temporary Session (Volatile)"}
                </p>
                {filteredItems.slice(0, 1).map((item) => {
                  const isActive = activeId === item.id;
                  const ausp = item.auspiciousness || "Exhausting";
                  return (
                    <div 
                      key={item.id}
                      className={`border p-3 text-left rounded-sm relative opacity-60 pointer-events-none ${
                        isDark ? "bg-[#0d1322]/20 border-neutral-900" : "bg-neutral-150 border-neutral-200"
                      }`}
                    >
                      <div className="text-[8.5px] font-mono text-neutral-500">
                        {new Date(item.date).toLocaleDateString()} | {item.originalGua}
                      </div>
                      <div className="text-[10px] font-sans text-neutral-400 line-clamp-1 truncate mt-1">
                        {item.question}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={`text-center py-12 px-4 border border-dashed rounded-sm ${isDark ? "border-neutral-800" : "border-neutral-200"}`}>
            <p className={`text-xs font-mono ${mutedTextClass}`}>{t("noRecords")}</p>
          </div>
        ) : (
          /* Interactive Ledger Cards for Pro Consultant Tier */
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const isActive = activeId === item.id;
              const isAutomated = item.id.startsWith("auto-monthly");
              
              let formattedDate = "";
              try {
                formattedDate = new Date(item.date || Date.now()).toLocaleDateString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } catch (e) {
                formattedDate = String(item.date || "");
              }

              const ausp = item.auspiciousness || "Exhausting";

              let badgeStyle = isDark ? "bg-neutral-800 text-neutral-300 border border-neutral-700" : "bg-neutral-100 text-neutral-600 border border-neutral-200";
              if (ausp === "Extremely Auspicious" || ausp === "大吉") {
                badgeStyle = "bg-emerald-950/30 text-emerald-400 border border-emerald-500/30";
              } else if (ausp === "Auspicious" || ausp === "吉") {
                badgeStyle = "bg-cyan-950/20 text-cyan-400 border border-cyan-500/20";
              } else if (ausp === "Highly Inauspicious" || ausp === "凶") {
                badgeStyle = "bg-rose-950/30 text-rose-400 border border-rose-500/30";
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className={`group cursor-pointer border rounded-sm p-4 text-left transition-all relative flex flex-col justify-between overflow-hidden min-h-[145px] ${
                    isActive 
                      ? isDark 
                        ? "bg-[#161f32] border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                        : "bg-cyan-50/50 border-cyan-500 shadow-sm"
                      : isDark
                        ? "bg-[#0d1322] border-neutral-850 hover:bg-[#161f32] hover:border-[#06b6d4] hover:shadow-[0_0_12px_rgba(6,182,212,0.1)]"
                        : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100/60 hover:border-cyan-400"
                  }`}
                >
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className={`absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 rounded transition-all z-10 ${
                      isDark ? "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800" : "text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Pulsing Glowing Dot Notification for unread / automated periodic pushes */}
                  {isAutomated && (
                    <div className="absolute right-4 top-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </div>
                  )}

                  <div>
                    {/* Header: DateTime or Automated Tag */}
                    <div className="flex items-center gap-1.5 text-[8.5px] font-mono mb-2">
                      <Calendar className="w-2.5 h-2.5 text-cyan-500/70" />
                      <span className={isAutomated ? "text-[#06b6d4] font-bold tracking-wider" : mutedTextClass}>
                        {isAutomated ? "[ PERIODIC BRIEFING / 定期分析 ]" : formattedDate}
                      </span>
                    </div>

                    {/* Question prompt */}
                    <div className={`text-[11px] font-normal line-clamp-2 mb-3.5 pr-4 leading-relaxed font-sans ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                      {item.question}
                    </div>
                  </div>

                  {/* Mathematical Vector alignment & rating pill */}
                  <div className={`flex flex-col gap-1.5 pt-2.5 border-t ${isDark ? "border-neutral-850" : "border-neutral-200/60"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold font-serif ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                          {item.originalGua}
                        </span>
                      </div>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider leading-none shrink-0 font-bold ${badgeStyle}`}>
                        {getAuspBadgeLabel(ausp)}
                      </span>
                    </div>

                    {/* Vector mapping speech summary */}
                    <div className="text-[8.8px] font-mono opacity-85 text-cyan-400/90 leading-relaxed font-semibold">
                      {getVectorSummary(item.conclusion, language)}
                    </div>

                    {/* Resume Consultation Context Trigger button (Slides up beautifully inside card bounds on hover) */}
                    <div className="mt-1 flex justify-center max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                      <span className="text-[9.2px] font-mono tracking-wider font-extrabold text-cyan-400 animate-[pulse_2s_infinite] flex items-center gap-1 uppercase">
                        ⚡ {language.startsWith("zh") ? "[ 追踪事态 / Resume Consultation ]" : "[ Resume Consultation ]"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
