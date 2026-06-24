import React, { useState } from "react";
import { 
  User, Mail, ShieldCheck, 
  Settings, LogOut, CheckCircle2, ChevronRight, X, Sparkles, Loader2, ChevronDown 
} from "lucide-react";
import { Language, LANGUAGES, translationDict } from "../utils/translations";

const autoDetectLabels: Record<string, string> = {
  "en": "Auto Detect",
  "zh-CN": "自动检测",
  "zh-TW": "自動檢測",
  "ja": "自動検出",
  "ko": "자동 감지",
  "es": "Detección Automática",
  "id": "Deteksi Otomatis",
  "ms": "Pengesanan Automatik",
  "th": "ตรวจจับอัตโนมัติ"
};

const detectBrowserLanguage = (): Language => {
  const browserLanguage = navigator.language || "en";
  if (browserLanguage.includes("zh-CN") || browserLanguage.startsWith("zh-Hans")) {
    return "zh-CN";
  } else if (browserLanguage.includes("zh-TW") || browserLanguage.includes("zh-HK") || browserLanguage.startsWith("zh-Hant")) {
    return "zh-TW";
  } else if (browserLanguage.startsWith("ja")) {
    return "ja";
  } else if (browserLanguage.startsWith("ko")) {
    return "ko";
  } else if (browserLanguage.startsWith("es")) {
    return "es";
  } else if (browserLanguage.startsWith("id")) {
    return "id";
  } else if (browserLanguage.startsWith("ms")) {
    return "ms";
  } else if (browserLanguage.startsWith("th")) {
    return "th";
  }
  return "en";
};

const getFlagIcon = (code: string) => {
  switch (code) {
    case "auto": return "🌐";
    case "en": return "🇺🇸";
    case "zh-CN": return "🇨🇳";
    case "zh-TW": return "🇹🇼";
    case "ja": return "🇯🇵";
    case "ko": return "🇰🇷";
    case "es": return "🇪🇸";
    case "id": return "🇮🇩";
    case "ms": return "🇲🇾";
    case "th": return "🇹🇭";
    default: return "🌐";
  }
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: "dark" | "light" | "system";
  onThemeChange: (theme: "dark" | "light" | "system") => void;
  user: { name: string; email: string; avatarUrl?: string; provider: string } | null;
  onLogin: (user: { name: string; email: string; provider: string }) => void;
  onLogout: () => void;
  isDark: boolean;
}

export default function SettingsModal({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  user,
  onLogin,
  onLogout,
  isDark,
}: SettingsModalProps) {
  const t = (key: string) => translationDict[language][key] || key;

  // Auth states
  const [authLoading, setAuthLoading] = useState<string | null>(null); // name of provider loading
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const savedValue = localStorage.getItem("hexamind_lang");
  const selectedValue = (savedValue === null || savedValue === "auto") ? "auto" : language;

  if (!isOpen) return null;

  // Realistic mock login flow
  const handleSocialLogin = (provider: string) => {
    setAuthLoading(provider);
    setTimeout(() => {
      let mockName = "";
      let mockEmail = "";
      if (provider === "Google") {
        mockName = "Alex Rivera (Google ID)";
        mockEmail = "alex.rivera@gmail.com";
      } else if (provider === "Facebook") {
        mockName = "Shao Yang (FB Exec)";
        mockEmail = "shaoyang.executive@fb.com";
      } else {
        mockName = "Apple Crypt Leader";
        mockEmail = "crypt.master@icloud.com";
      }

      onLogin({
        name: mockName,
        email: mockEmail,
        provider: provider,
      });
      setAuthLoading(null);
      setSuccessMsg(t("loginSuccess"));
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 1500);
  };

  // Base theme dependent classes
  const modalOverlayClass = isDark 
    ? "bg-black/80 backdrop-blur-md" 
    : "bg-slate-900/40 backdrop-blur-md";

  const modalContentClass = isDark
    ? "bg-[#0b0c10] border-white/10 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]"
    : "bg-white border-slate-200 text-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.08)]";

  const itemBgClass = isDark
    ? "bg-white/5 border-white/10 hover:border-white/20 text-white/95"
    : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800";

  const inputClass = isDark
    ? "bg-black/60 border-white/10 text-white focus:border-[#06b6d4] placeholder-white/20"
    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#06b6d4] placeholder-slate-400";

  return (
    <div 
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${modalOverlayClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-sm border p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar relative ${modalContentClass}`}
      >
        
        {/* Banner decorations for aesthetic high fidelity */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#f59e0b] to-[#06b6d4]" />

        {/* Exit Button */}
        <button 
          onClick={onClose}
          title="Close modal"
          className={`absolute top-5 right-5 p-2 rounded-full cursor-pointer transition-all ${isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-800"}`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-400 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body - Grid spacing */}
        <div className="space-y-6">
          
          {/* Section 1: Language Switcher */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider ${isDark ? "text-[#06b6d4]" : "text-cyan-600"}`}>
              {t("language")}
            </label>
            <div className="relative">
              <select
                value={selectedValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "auto") {
                    localStorage.setItem("hexamind_lang", "auto");
                    const detected = detectBrowserLanguage();
                    onLanguageChange(detected);
                  } else {
                    localStorage.setItem("hexamind_lang", val);
                    onLanguageChange(val as Language);
                  }
                }}
                className={`w-full p-2.5 pr-10 text-xs rounded-sm border font-mono appearance-none transition-all cursor-pointer ${
                  isDark
                    ? "bg-black/60 border-white/10 text-white focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]/50"
                }`}
              >
                <option value="auto">
                  🌐 {autoDetectLabels[language] || "Auto Detect"}
                </option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {getFlagIcon(lang.code)} {lang.name}
                  </option>
                ))}
              </select>
              {/* Custom Dropdown Chevron arrow */}
              <div className={`absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none ${isDark ? "text-white/40" : "text-slate-500"}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Section 3: User Authentication Gate */}
          <div className="border-t pt-6" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-2.5 ${isDark ? "text-white" : "text-slate-800"}`}>
              {t("registration")}
            </label>

            {user ? (
              /* Already Signed In Card */
              <div className={`p-4 rounded-sm border ${isDark ? "bg-white/5 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#06b6d4] p-[1.5px] shadow-sm">
                      <div className={`h-full w-full rounded-full flex items-center justify-center font-bold text-xs uppercase ${isDark ? "bg-black text-white" : "bg-white text-slate-800"}`}>
                        {user.name.slice(0, 2)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-sans">
                        {user.name} 
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </h4>
                      <p className={`text-[10px] font-mono ${isDark ? "text-white/40" : "text-slate-500"}`}>{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={onLogout}
                    title={t("signOut")}
                    className="p-2.5 border border-rose-500/20 hover:border-rose-500/50 bg-rose-500/10 text-rose-400 hover:text-rose-300 rounded-sm transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
                  >
                    <LogOut className="w-4 h-4 transition-transform group-hover:scale-105" />
                  </button>
                </div>
              </div>
            ) : (
              /* Authentication forms & Social integrations */
              <div className="space-y-4">
                <p className={`text-[11px] font-serif leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>
                  {t("signUpDesc")}
                </p>

                {/* Social Login Buttons Bar */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Google OAuth Option */}
                    <button
                      type="button"
                      disabled={authLoading !== null}
                      onClick={() => handleSocialLogin("Google")}
                      className={`p-2.5 rounded-sm border text-[10px] font-mono flex items-center justify-center gap-2 transition-all ${
                        authLoading === "Google" ? "brightness-75 cursor-not-allowed opacity-60" : itemBgClass
                      }`}
                    >
                      {authLoading === "Google" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06b6d4]" />
                      ) : (
                        <div className="w-3 h-3 text-[#06b6d4] font-bold">G</div>
                      )}
                      <span>Google</span>
                    </button>

                    {/* Facebook OAuth Option */}
                    <button
                      type="button"
                      disabled={authLoading !== null}
                      onClick={() => handleSocialLogin("Facebook")}
                      className={`p-2.5 rounded-sm border text-[10px] font-mono flex items-center justify-center gap-2 transition-all ${
                        authLoading === "Facebook" ? "brightness-75 cursor-not-allowed opacity-60" : itemBgClass
                      }`}
                    >
                      {authLoading === "Facebook" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06b6d4]" />
                      ) : (
                        <div className="w-3 h-3 text-[#06b6d4] font-bold">F</div>
                      )}
                      <span>Facebook</span>
                    </button>

                    {/* Apple Provider */}
                    <button
                      type="button"
                      disabled={authLoading !== null}
                      onClick={() => handleSocialLogin("Apple")}
                      className={`p-2.5 rounded-sm border text-[10px] font-mono flex items-center justify-center gap-2 transition-all ${
                        authLoading === "Apple" ? "brightness-75 cursor-not-allowed opacity-60" : itemBgClass
                      }`}
                    >
                      {authLoading === "Apple" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#06b6d4]" />
                      ) : (
                        <div className="w-3 h-3 text-[#06b6d4] font-bold"></div>
                      )}
                      <span>Apple ID</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
