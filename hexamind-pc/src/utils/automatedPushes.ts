import { DivinationHistoryItem } from "../types";
import { Language } from "./translations";

export function getAutomatedMonthlyPushes(language: Language): DivinationHistoryItem[] {
  return [
    {
      id: "auto-monthly-may-2026",
      date: "2026-05-01T00:00:00Z",
      question: language.startsWith("zh") 
        ? "系统月度自动校准：Q2 宏观战略平衡评估与跨境资本流控制矩阵" 
        : "AUTOMATED SYSTEM MATRIX ANALYSIS: Q2 Strategic Balance Check & External Cash Flow Amortization Matrix",
      originalGua: language.startsWith("zh") ? "天火同人" : "HEXAGRAM 13 (Fellowship)",
      conclusion: "体用比和",
      auspiciousness: "Extremely Auspicious",
      confidenceScore: 98.66,
      latitude: 31.23,
      longitude: 121.47,
      kineticValue: 0.500,
      timestamp: new Date("2026-05-01T00:00:00Z").getTime(),
      aiOutput: {
        verdict: "Critical Advantage",
        analysis: language.startsWith("zh")
          ? "### 宏观资本平衡监测：同人卦气协调\n当前周期中，企业的金属性资本与火属性执行频率达到同步共振。跨境货运通道畅通无阻，现金流摊销计划整体稳健。\n\n### 战术应对方案：\n* 保持硬通货结算资产比例，巩固体卦（自身）。\n* 对主要物流合约实施套期保值，缓释用卦折旧摩擦。"
          : "### Enterprise Balance Check: Equilateral Air Coordination\nDuring the initial month segment, the Metal and Fire components of the business operation reached dual-amplitude resonance. Fluid channels remain uninhibited. Amortization schedules for logistics expansion are stable.\n\n### Tactical Action Items:\n* Retain hard currency balances to maintain liquidity.\n* Shift standard credit periods outward for strategic partners.",
        tacticalAction: language.startsWith("zh")
          ? [
              "💡 审计现有现金储备以防范下半年金属属性波动摩擦。 [SIMULATE_TRIGGER: 审计现有现金储备以防范下半年金属属性波动摩擦。]",
              "💡 通过长期仓储合约对物流运力支出进行对冲锁定。 [SIMULATE_TRIGGER: 通过长期仓储合约对物流运力支出进行对冲锁定。]"
            ]
          : [
              "💡 Audit existing cash reserves against systemic metal volatility. [SIMULATE_TRIGGER: Audit existing cash reserves against systemic metal volatility.]",
              "💡 Hedging logistics expenditure through long-term storage options. [SIMULATE_TRIGGER: Hedging logistics expenditure through long-term storage options.]"
            ],
        phenomenologicalEcho: language.startsWith("zh")
          ? "西方交通枢纽发生高频共鸣，预示货运通道无阻。"
          : "A resonant vibration is felt in the Western transport artery, signaling a smooth passage of freight.",
        catalystWindow: language.startsWith("zh") ? "辰时 (07:00-09:00)" : "HOUR OF THE DRAGON (07:00-09:00)"
      }
    }
  ];
}
