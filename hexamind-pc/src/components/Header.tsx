import React, { useState, useEffect } from "react";
import { Settings, UserCheck, ShieldAlert, History } from "lucide-react";
import { Language, translationDict } from "../utils/translations";

interface HeaderProps {
  timestamp?: number | null;
  latitude?: number | "";
  longitude?: number | "";
  kineticSpeed?: number;
  language: Language;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
  onOpenHistory: () => void;
  user: { name: string; email: string; provider: string } | null;
  isDark: boolean;
  userTier: "Free" | "Pro";
}

export default function Header({
  timestamp,
  latitude = "",
  longitude = "",
  kineticSpeed = 1.23,
  language,
  onOpenSettings,
  onOpenSubscription,
  onOpenHistory,
  user,
  isDark,
  userTier,
}: HeaderProps) {
  const [liveTime, setLiveTime] = useState<number>(Date.now());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setLiveTime(Date.now());
    }, 100);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const activeTimestamp = timestamp || liveTime;
  const t = (key: string) => translationDict[language][key] || key;

  const displayLat = typeof latitude === "number" ? latitude.toFixed(2) : "N/A";
  const displayLng = typeof longitude === "number" ? longitude.toFixed(2) : "N/A";

  // Base configurations
  const headerBg = isDark 
    ? "bg-[#050608]/95 text-white" 
    : "bg-[#FAF9F6]/95 text-slate-900";

  const brandTitle = isDark ? "text-white" : "text-slate-950";
  const brandSub = isDark ? "text-white/40" : "text-slate-500";
  const borderCol = isDark ? "border-white/10" : "border-slate-200";
  const valueColor = isDark ? "text-white" : "text-slate-900";

  return (
    <header className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 z-20 sticky top-0 backdrop-blur-md pb-4 pt-4 px-4 md:px-6 rounded-b-sm ${headerBg}`}>
      {/* Brand Title */}
      <div className="flex flex-col md:flex-row md:items-baseline md:gap-4 md:flex-wrap">
        <h1 className={`text-2xl md:text-3xl font-light tracking-widest uppercase pb-1 md:pb-0 ${brandTitle}`}>
          HexaMind{' '}
          <span className="relative inline-block ml-1">
            <span className="absolute -inset-1 rounded bg-gradient-to-r from-red-500 via-orange-500 via-cyan-500 to-purple-500 opacity-20 blur-sm font-bold" />
            <span className="relative bg-gradient-to-r from-red-500 via-orange-500 via-cyan-500 to-purple-600 bg-clip-text text-transparent font-bold">
              易道流光
            </span>
          </span>
        </h1>
        <p className={`text-[10px] tracking-[0.16em] uppercase font-mono md:whitespace-nowrap ${brandSub}`}>
          {t("engineDesc")}
        </p>
      </div>

      {/* Action console & member status */}
      <div className="flex items-center gap-4 ml-auto w-full lg:w-auto justify-end">
          {/* Subscriber plan badge */}
          <button
            onClick={onOpenSubscription}
            className={`px-2.5 py-1.5 rounded-sm border text-[9px] font-mono font-bold tracking-widest cursor-pointer transition-all uppercase flex items-center gap-1 ${
              userTier === "Pro"
                ? "bg-purple-500/10 border-purple-500/50 text-purple-400 dark:text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:bg-purple-500/20"
                : "bg-slate-500/10 border-slate-500/30 text-slate-500 dark:text-slate-400 hover:bg-slate-500/20"
            }`}
          >
            {userTier === "Pro" ? t("statusProBadge") : t("statusFreeBadge")}
          </button>

          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer relative group keep-round ${
              isDark 
                ? "bg-white/5 border-white/10 hover:border-white/20 text-white/80 hover:text-white" 
                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
            title="Open Configuration Console"
            id="settings-trigger-btn"
          >
            {user ? (
              <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold font-mono">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            ) : (
              <Settings className="w-4 h-4 transition-transform" />
            )}
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#f59e0b]" />
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#f59e0b]" />
          </button>

          <button
            onClick={onOpenHistory}
            className={`p-2 rounded-sm border transition-all duration-300 flex items-center justify-center cursor-pointer group ${
              isDark 
                ? "bg-white/5 border-white/10 hover:border-white/20 text-white/80 hover:text-white" 
                : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
            }`}
            title={translationDict[language]["historyArchive"] || "History"}
            id="history-trigger-btn"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
    </header>
  );
}

