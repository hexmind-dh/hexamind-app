import React, { useState } from "react";
import { X, Sparkles, Check, Crown, ShieldCheck } from "lucide-react";
import { Language, translationDict } from "../utils/translations";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userTier: "Free" | "Pro";
  onUserTierChange: (tier: "Free" | "Pro") => void;
  isDark: boolean;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  language,
  userTier,
  onUserTierChange,
  isDark,
}: SubscriptionModalProps) {
  const t = (key: string) => translationDict[language][key] || key;
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTier = (tier: "Free" | "Pro") => {
    setLoadingTier(tier);
    setTimeout(() => {
      onUserTierChange(tier);
      setLoadingTier(null);
    }, 800);
  };

  // Grayscale Luxury Themes
  const overlayClass = isDark
    ? "bg-black/85 backdrop-blur-xl"
    : "bg-neutral-900/40 backdrop-blur-xl";

  const containerClass = isDark
    ? "bg-[#0b0c0d] border-neutral-800 text-neutral-100 shadow-[0_0_80px_rgba(0,0,0,0.95)]"
    : "bg-white border-neutral-200 text-neutral-900 shadow-[0_25px_60px_rgba(0,0,0,0.12)]";

  return (
    <div 
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${overlayClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-lg border p-6 md:p-8 flex flex-col max-h-[95vh] overflow-y-auto custom-scrollbar relative ${containerClass}`}
      >
        
        {/* Banner decorations for premium high-fidelity aesthetics in absolute grayscale */}
        <div className={`absolute top-0 left-0 w-full h-[4px] ${isDark ? "bg-neutral-700" : "bg-neutral-300"} animate-pulse`} />

        {/* Close button with subtle outline */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full border transition-all duration-200 cursor-pointer ${
            isDark 
              ? "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-100" 
              : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800"
          }`}
          title="Close subscription portal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header containing majestic badge & title */}
        <div className="text-center mt-2 mb-8">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.2em] uppercase font-semibold ${
            isDark
              ? "bg-neutral-900/50 text-neutral-300 border border-neutral-800"
              : "bg-neutral-100 text-neutral-650 border border-neutral-200"
          } mb-3 animate-pulse`}>
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>VIP CLOUD MATRIX LICENSE</span>
          </div>
          <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase font-sans mb-2">
            Hexamind <span className="font-semibold text-neutral-400 dark:text-neutral-300">专属特权顾问</span>
          </h2>
          <p className={`text-xs max-w-lg mx-auto leading-relaxed ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>
            注入专属时空信号轨算力，解锁无限次预测、更高保真数字梅花算法，以及跨时间跨维度的智能决策建议卷轴。
          </p>
        </div>

        {/* Gorgeous Tier Grid Layout in strict grayscale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6 max-w-2xl mx-auto w-full">
          
          {/* FREE TRIAL TIER - Inception Tier */}
          <div className={`rounded-md border p-5 flex flex-col justify-between transition-all relative ${
            userTier === "Free"
              ? isDark
                ? "bg-neutral-900/40 border-neutral-500 ring-2 ring-neutral-500/20"
                : "bg-neutral-50 border-neutral-400 ring-2 ring-neutral-400/20 shadow-sm"
              : isDark
              ? "bg-black/30 border-neutral-900 hover:border-neutral-850"
              : "bg-neutral-50/40 border-neutral-200 hover:border-neutral-300"
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
                    {t("tierFreeTitle") || "Inception Tier (入门体验版)"}
                  </h3>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>核心功能初探体验</p>
                </div>
                {userTier === "Free" && (
                  <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-500/10 text-neutral-400 border border-neutral-500/30 tracking-widest uppercase">
                    CURRENT
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-light tracking-tight font-mono text-neutral-400">$0.00</span>
                <span className={`text-[10px] font-mono ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>/ 永久免费</span>
              </div>

              <ul className="space-y-2.5 mb-6 pt-4 border-t border-neutral-800 dark:border-neutral-900">
                {[
                  t("tierFreePerk1") || "每天获取最多 3 次决策推演配额",
                  "固定的服务器时间和固定地理位置 (限制自定义 LBS)",
                  "锁定微波动能 (Kinetic Pad) 以防止混噪编译",
                  "会话记录仅在内存中保留 (无持久化数据库)",
                  "限制 Hexa AI Counsel 智能决策参谋阁聊天"
                ].map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs leading-snug">
                    <Check className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                    <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={userTier === "Free" || loadingTier !== null}
              onClick={() => handleSelectTier("Free")}
              className={`w-full py-2.5 rounded-sm text-[10px] font-mono tracking-widest uppercase font-bold transition-all cursor-pointer ${
                userTier === "Free"
                  ? "bg-neutral-500/10 text-neutral-500/70 border border-neutral-500/20 cursor-default"
                  : isDark
                  ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700"
                  : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
              }`}
            >
              {loadingTier === "Free" ? "同步中..." : userTier === "Free" ? "当前活跃套餐" : "重置为体验版"}
            </button>
          </div>

          {/* PRO UNLIMITED TIER (PREMIUM) - Pro Consultant Tier */}
          <div className={`rounded-md border p-5 flex flex-col justify-between transition-all relative ${
            userTier === "Pro"
              ? isDark
                ? "bg-neutral-900/60 border-neutral-400 ring-2 ring-neutral-400/30"
                : "bg-neutral-50 border-neutral-500 ring-2 ring-neutral-500/30 shadow-[0_0_20px_rgba(0,0,0,0.05)]"
              : isDark
              ? "bg-black/30 border-neutral-900 hover:border-neutral-700"
              : "bg-white border-neutral-200 hover:border-neutral-400"
          }`}>
            {/* Recommended Badge */}
            <div className={`absolute top-0 right-5 transform -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest font-bold uppercase shadow-sm ${
              isDark 
                ? "bg-neutral-800 text-neutral-200 border border-neutral-700" 
                : "bg-neutral-900 text-white"
            }`}>
              EXECUTIVE CHOICE
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-mono font-bold tracking-widest text-neutral-300 dark:text-neutral-200 uppercase flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-neutral-400" />
                    {t("tierProTitle") || "Pro Consultant Tier (专业顾问版)"}
                  </h3>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>商业战略预测及决策顾问级别</p>
                </div>
                {userTier === "Pro" && (
                  <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-sm bg-neutral-400/10 text-neutral-300 border border-neutral-400/20 tracking-widest uppercase animate-pulse">
                    PRO PRESTIGE
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-2xl font-light tracking-tight font-mono text-neutral-300 dark:text-white">$49.99</span>
                <span className={`text-[10px] font-mono ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>/ 卓越无限</span>
              </div>

              <ul className="space-y-2.5 mb-6 pt-4 border-t border-neutral-800 dark:border-neutral-900">
                {[
                  "解锁全功能 San-Cai 三才定位起步种子",
                  "支持自定义高精 LBS 地理与实时微波矢量",
                  "解锁 Hexa AI Chat Counsel Stateful 决策参谋阁",
                  "每月1日后台进行企业资产星曜矩阵算力编译",
                  "历史记录永久云持久化与 MAX_ADV 特种商业分类",
                  "附带7天免费体验期 (需要预绑定 Stripe 或 订阅支付)"
                ].map((perk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs leading-snug">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span className={isDark ? "text-neutral-400" : "text-neutral-700"}>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={userTier === "Pro" || loadingTier !== null}
              onClick={() => handleSelectTier("Pro")}
              className={`w-full py-2.5 rounded-sm text-[10px] font-mono tracking-widest uppercase font-bold transition-all cursor-pointer ${
                userTier === "Pro"
                  ? "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-default"
                  : "bg-neutral-900 hover:bg-black text-white border border-neutral-800 shadow-sm"
              }`}
            >
              {loadingTier === "Pro" ? "激活尊贵凭证..." : userTier === "Pro" ? "当前活跃套餐" : "升级专业顾问版"}
            </button>
          </div>

        </div>

        {/* Security / Assurance bar */}
        <div className={`mt-2 p-3.5 border rounded-sm flex flex-col md:flex-row items-center gap-3.5 justify-between ${
          isDark ? "bg-white/[0.01] border-neutral-900" : "bg-neutral-50 border-neutral-200"
        }`}>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-neutral-400 shrink-0" />
            <div className="text-left">
              <span className="block text-[11px] font-bold font-sans">100% 安全交易保障</span>
              <span className={`block text-[9px] font-mono ${isDark ? "text-neutral-500" : "text-neutral-500"}`}>全流程采用端到端量子非对称强加密进行授权，绝不泄露个人提问。</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-mono opacity-60">支付支持:</span>
            <span className="text-xs font-bold font-mono tracking-widest bg-neutral-400/10 text-neutral-400 px-1.5 py-0.5 rounded-sm">Stripe</span>
            <span className="text-xs font-bold font-mono tracking-widest bg-neutral-400/10 text-neutral-400 px-1.5 py-0.5 rounded-sm">ApplePay</span>
          </div>
        </div>

        {/* Console Footing Actions */}
        <div className="mt-6 border-t pt-4 flex justify-end gap-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          <button
            onClick={onClose}
            className={`px-5 py-2 text-[9px] font-mono font-bold uppercase tracking-widest border rounded-sm transition-all active:scale-[0.98] cursor-pointer ${
              isDark 
                ? "border-neutral-800 hover:bg-neutral-900/50 text-neutral-400 hover:text-neutral-100"
                : "border-neutral-350 hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {t("close")}
          </button>
        </div>

      </div>
    </div>
  );
}
