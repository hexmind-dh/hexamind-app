import React from "react";
import { Trigram } from "../types";

interface SeedVisualizerProps {
  lines: number[];      // list of 6 lines, from bottom (index 0) to top (index 5)
  title: string;        // e.g. "Original Chart (本卦)"
  guaName: string;      // e.g. "火风鼎"
  englishName: string;  // e.g. "The Caldron"
  symbol: string;       // e.g. "☲☴"
  changingLine?: number; // 1-6 standard (corresponding to indices 0 to 5)
  upperTrigram?: Trigram;
  lowerTrigram?: Trigram;
  isTransformed?: boolean;
  isDark?: boolean;
  language?: string;
}

const trigramNamesMap: Record<string, Record<string, string>> = {
  "en": {"乾": "Heaven", "兑": "Lake", "离": "Fire", "震": "Thunder", "巽": "Wind", "坎": "Water", "艮": "Mountain", "坤": "Earth"},
  "zh-CN": {"乾": "乾", "兑": "兑", "离": "离", "震": "震", "巽": "巽", "坎": "坎", "艮": "艮", "坤": "坤"},
  "zh-TW": {"乾": "乾", "兑": "兌", "离": "離", "震": "震", "巽": "巽", "坎": "坎", "艮": "艮", "坤": "坤"},
  "ja": {"乾": "乾 (けん)", "兑": "兌 (だ)", "离": "離 (り)", "震": "震 (しん)", "巽": "巽 (そん)", "坎": "坎 (かん)", "艮": "艮 (ごん)", "坤": "坤 (こん)"},
  "ko": {"乾": "건 (Gun)", "兑": "태 (Tae)", "离": "리 (Ri)", "震": "진 (Jin)", "巽": "손 (Son)", "坎": "감 (Gam)", "艮": "간 (Gan)", "坤": "곤 (Gon)"},
  "es": {"乾": "Qian (Cielo)", "兑": "Dui (Estanque)", "离": "Li (Fuego)", "震": "Zhen (Trueno)", "巽": "Xun (Viento)", "坎": "Kan (Agua)", "艮": "Gen (Montaña)", "坤": "Kun (Tierra)"},
  "id": {"乾": "Qian (Langit)", "兑": "Dui (Danau)", "离": "Li (Api)", "震": "Zhen (Guntur)", "巽": "Xun (Angin)", "坎": "Kan (Air)", "艮": "Gen (Gunung)", "坤": "Bumi (Kun)"},
  "ms": {"乾": "Qian (Langit)", "兑": "Dui (Tasik)", "离": "Li (Api)", "震": "Zhen (Guruh)", "巽": "Xun (Angin)", "坎": "Kan (Air)", "艮": "Gen (Gunung)", "坤": "Bumi (Kun)"},
  "th": {"乾": "เฉียน (ฟ้า)", "兑": "ตุ้ย (ทะเลสาบ)", "离": "หลี่ (ไฟ)", "震": "เจิ้น (สายฟ้า)", "巽": "ซวิ่น (ลม)", "坎": "ข่าน (น้ำ)", "艮": "เกิ้น (ภูเขา)", "坤": "คุน (ดิน)"}
};

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

const labelUpperLowerMap: Record<string, { upper: string, lower: string, gua: string }> = {
  "en": { upper: "UPPER", lower: "LOWER", gua: "GUA" },
  "zh-CN": { upper: "上卦", lower: "下卦", gua: "卦" },
  "zh-TW": { upper: "上卦", lower: "下卦", gua: "卦" },
  "ja": { upper: "上卦", lower: "下卦", gua: "卦" },
  "ko": { upper: "상괘", lower: "하괘", gua: "괘" },
  "es": { upper: "SUPERIOR", lower: "INFERIOR", gua: "GUA" },
  "id": { upper: "ATAS", lower: "BAWAH", gua: "GUA" },
  "ms": { upper: "ATAS", lower: "BAWAH", gua: "GUA" },
  "th": { upper: "บน", lower: "ล่าง", gua: "มณฑล" }
};

const lineStatesMap: Record<string, { flip: string, move: string, yang: string, yin: string }> = {
  "en": { flip: "FLIP", move: "MOVE", yang: "YANG", yin: "YIN" },
  "zh-CN": { flip: "变", move: "动", yang: "阳", yin: "阴" },
  "zh-TW": { flip: "變", move: "動", yang: "陽", yin: "陰" },
  "ja": { flip: "変", move: "動", yang: "陽", yin: "陰" },
  "ko": { flip: "변", move: "동", yang: "양", yin: "음" },
  "es": { flip: "CAMBIO", move: "MOVIMIENTO", yang: "YANG", yin: "YIN" },
  "id": { flip: "UBAH", move: "GERAK", yang: "YANG", yin: "YIN" },
  "ms": { flip: "UBAH", move: "GERAK", yang: "YANG", yin: "YIN" },
  "th": { flip: "แปร", move: "ขยับ", yang: "หยาง", yin: "หยิน" }
};

export default function SeedVisualizer({
  lines,
  title,
  guaName,
  englishName,
  symbol,
  changingLine,
  upperTrigram,
  lowerTrigram,
  isTransformed = false,
  isDark = true,
  language = "en",
}: SeedVisualizerProps) {

  const currentLang = language;

  const getTrigramDisplay = (trig: Trigram) => {
    if (currentLang === "en") {
      return trigramNamesMap["en"][trig.name] || trig.english;
    }
    const map = trigramNamesMap[currentLang] || {};
    return map[trig.name] || trig.name;
  };

  const getElementDisplay = (elementName: string) => {
    const map = elementsMap[currentLang] || {};
    return map[elementName] || elementName;
  };

  const getLabelMap = () => {
    return labelUpperLowerMap[currentLang] || labelUpperLowerMap["en"];
  };

  const getLineStates = () => {
    return lineStatesMap[currentLang] || lineStatesMap["en"];
  };

  const lineLabelCreator = (lineNum: number) => {
    if (currentLang === "en") return `Line ${lineNum}`;
    if (currentLang === "es") return `Línea ${lineNum}`;
    if (currentLang === "ja") return `${lineNum}爻`;
    if (currentLang === "ko") return `${lineNum}효`;
    if (currentLang === "th") return `เส้น ${lineNum}`;
    return `爻 ${lineNum}`;
  };

  // Lines are stored bottom-to-top (indices 0 to 5 map to Lines 1 to 6)
  // To render traditionally (top-to-bottom), we reverse the row rendering order but align with proper labels.
  const lineRows = [...lines].reverse();

  // Color classes mapping
  const containerClass = isDark
    ? "bg-white/5 border-white/10 text-white hover:border-white/25"
    : "bg-white border-slate-200 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-300";

  const symbolClass = isDark ? "text-white/5" : "text-slate-200/40";
  const borderClass = isDark ? "border-white/10" : "border-slate-100";
  const titleClass = isDark ? "text-white" : "text-slate-900";
  const subClass = isDark ? "text-white/40" : "text-slate-400";
  const italicClass = isDark ? "text-white/50" : "text-slate-500";
  const tagClass = isDark ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"; 
  const labelClass = isDark ? "text-white/40" : "text-slate-400";
  const trigBgClass = isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100";
  const trigTitleClass = isDark ? "text-white/80" : "text-slate-800";

  return (
    <div className={`border rounded-sm p-4 shadow-xl flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-300 ${containerClass}`}>

      <div className="relative z-10">
        {/* Title */}
        <div className={`flex items-center justify-between border-b pb-2.5 mb-3.5 ${borderClass}`}>
          <div>
            <span className={`tracking-widest text-rose-500 uppercase ${
              (language.startsWith("zh") && (title.includes("卦") || title.includes("本") || title.includes("互") || title.includes("变")))
                ? "font-classic-serif font-extrabold text-[13.5px]"
                : "text-[10px] font-mono font-bold"
            }`}>
              {title}
            </span>
            <h3 className={`text-base mt-0.5 flex items-center gap-1.5 ${titleClass} ${
              language.startsWith("zh") ? "font-classic-serif font-extrabold text-[17px] tracking-wide" : "font-sans font-medium"
            }`}>
              {guaName}
              <span className={`text-[10px] font-mono font-medium ${subClass}`}>({symbol})</span>
            </h3>
          </div>
        </div>

        {/* English Name (only for en language) */}
        {currentLang === "en" && (
          <p className={`text-[11px] italic mb-3.5 font-serif ${italicClass}`}>"{englishName}"</p>
        )}

        {/* 6 Lines representation (Top-to-Bottom list) - Narrower/shorter width, centered */}
        <div className="space-y-1 md:space-y-0.5 mb-4 flex flex-col justify-center max-w-[280px] mx-auto w-full">
          {lineRows.map((lineType, idx) => {
            // idx 0 in reversed list is Line 6 (top, original index 5)
            // idx 5 in reversed list is Line 1 (bottom, original index 0)
            const lineNum = 6 - idx;
            const isChanging = changingLine === lineNum;
            const isFlipped = isTransformed && isChanging;

            // Determine if we show rose/red active indicators for decision alignment
            const lineHighlightClass = isFlipped
              ? "bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.6)]"
              : isChanging
              ? "bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.6)]"
              : isDark 
              ? "bg-white/20 group-hover:bg-white/30" 
              : "bg-slate-200 group-hover:bg-slate-300";

            return (
              <div
                key={lineNum}
                className={`flex items-center justify-center py-0.5 md:py-[1px] px-1 rounded-sm transition-all ${
                  isFlipped
                    ? "bg-[#f43f5e]/10 border border-[#f43f5e]/20"
                    : isChanging
                    ? "bg-[#f43f5e]/10 border border-[#f43f5e]/20"
                    : "border border-transparent"
                }`}
              >
                {/* Line drawing - thickened layout to h-3.5 inside h-5 container */}
                <div className="flex-1 h-5 md:h-4 flex items-center justify-center relative">
                  {lineType === 1 ? (
                    /* Yang - Solid line */
                    <div className={`w-full h-3.5 md:h-2.5 transition-all duration-300 relative ${lineHighlightClass}`}>
                    </div>
                  ) : (
                    /* Yin - Split line with a tighter, precise 6% gap */
                    <div className="w-full flex justify-between h-3.5 md:h-2.5">
                      <div className={`w-[47%] h-full transition-all duration-300 ${lineHighlightClass}`} />
                      <div className={`w-[47%] h-full transition-all duration-300 relative ${lineHighlightClass}`}>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trigrams structural breakdown */}
      {upperTrigram && lowerTrigram && (
        <div className={`border-t pt-3.5 mt-auto ${borderClass}`}>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5 text-[9px] font-mono">
            <div className={`p-1.5 rounded-sm flex flex-col justify-between border ${trigBgClass}`} style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}>
              <span className={`font-semibold mb-0.5 text-[9px] tracking-wider ${subClass}`}>
                {getLabelMap().upper}<span className="inline md:hidden">:</span>
              </span>
              <div className={`flex items-center justify-between font-sans font-bold text-[9px] ${trigTitleClass}`}>
                <span>{getTrigramDisplay(upperTrigram)}</span>
                <span className="text-slate-500 dark:text-white/60 self-end text-[9px] font-mono font-normal">({getElementDisplay(upperTrigram.element)})</span>
              </div>
            </div>
            <div className={`p-1.5 rounded-sm flex flex-col justify-between border ${trigBgClass}`} style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}>
              <span className={`font-semibold mb-0.5 text-[9px] tracking-wider ${subClass}`}>
                {getLabelMap().lower}<span className="inline md:hidden">:</span>
              </span>
              <div className={`flex items-center justify-between font-sans font-bold text-[9px] ${trigTitleClass}`}>
                <span>{getTrigramDisplay(lowerTrigram)}</span>
                <span className="text-slate-500 dark:text-white/60 self-end text-[9px] font-mono font-normal">({getElementDisplay(lowerTrigram.element)})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
