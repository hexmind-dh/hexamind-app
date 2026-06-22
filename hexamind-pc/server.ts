import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { runMeihuaCalculation, getGanzhiTime } from "./src/utils/meihuaEngine";

dotenv.config();

// Lazy load Gemini client to prevent crash if key is temporarily blank
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it in the Secrets panel in the AI Studio UI to enable AI interpretation.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Core divination route
  app.post("/api/divinate", async (req, res) => {
    try {
      const { question, latitude, longitude, kineticValue, timestamp, language } = req.body;
      const user_tier = req.body.user_tier || "Free";
      const isFree = user_tier === "Free";

      if (!question || typeof question !== "string" || question.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "A specific situational decision question/inquiry is required."
        });
      }

      // 1. Two-Tier Subscription Framework Gatekeeping Matrix:
      // If user_tier == "Free", force-override inputs to use ONLY server time,
      // and do not accept custom LBS or kinetic inputs.
      const resolvedTimestamp = isFree ? Date.now() : (timestamp || Date.now());
      const resolvedLat = isFree ? 31.23 : (typeof latitude === "number" ? latitude : 31.23);
      const resolvedLng = isFree ? 121.47 : (typeof longitude === "number" ? longitude : 121.47);
      const resolvedKinetic = isFree ? 0.5 : (typeof kineticValue === "number" ? kineticValue : 0.5);
      const resolvedLanguage = language || "zh-CN";

      // 1. Math calculation on Meihua Yishu Engine
      const outputPayload = runMeihuaCalculation(
        resolvedTimestamp,
        resolvedLat,
        resolvedLng,
        resolvedKinetic
      );

      const ganzhiTime = getGanzhiTime(resolvedTimestamp);

      // 2. Format custom promting parameters for AI Interpretation
      const tiInfo = `${outputPayload.tiGua.trigram.name} (${outputPayload.tiGua.trigram.english} - Element: ${outputPayload.tiGua.trigram.element})`;
      const yongInfo = `${outputPayload.yongGua.trigram.name} (${outputPayload.yongGua.trigram.english} - Element: ${outputPayload.yongGua.trigram.element})`;
      const originalInfo = `${outputPayload.charts.original.name} (${outputPayload.charts.original.english})`;
      const nuclearInfo = `${outputPayload.charts.nuclear.name} (${outputPayload.charts.nuclear.english})`;
      const transformedInfo = `${outputPayload.charts.transformed.name} (${outputPayload.charts.transformed.english})`;

      const metadataString = `
[Seeds Incepted]
- Temporal Timestamp: ${resolvedTimestamp} (Date: ${new Date(resolvedTimestamp).toISOString()})
- Derived Chinese Ganzhi Astronomical Time (起卦干支时间): ${ganzhiTime}
- Spatial LBS: Latitude ${resolvedLat.toFixed(4)}, Longitude ${resolvedLng.toFixed(4)}
- Kinetic Peak Force: ${resolvedKinetic.toFixed(4)}

[Derived Meihua Charts]
- Original Chart (本卦): ${originalInfo} -> ${outputPayload.charts.original.symbol}
- Nuclear Chart (互卦): ${nuclearInfo} -> ${outputPayload.charts.nuclear.symbol}
- Transformed Chart (变卦): ${transformedInfo} -> ${outputPayload.charts.transformed.symbol}
- Changing Line (动爻): Line ${outputPayload.changingLine}

[Metaphysical Role Mapping]
- Ti Gua (体卦 - User/Self): Role is ${outputPayload.tiGua.role} Trigram: ${tiInfo}
- Yong Gua (用卦 - Matter/Counterpart/Problem): Role is ${outputPayload.yongGua.role} Trigram: ${yongInfo}
- WuXing Mathematical Interaction: ${outputPayload.relationship.conclusion} (${outputPayload.relationship.type})
- Metaphysical Core Definition: ${outputPayload.relationship.chineseInterpretation}
`;

      let aiResult = null;

      try {
        const client = getGeminiClient();
        
        const systemPrompt = `You are "HexaMind", an elite Corporate Metaphysical Architect and Chief Decision Analyst specializing in Meihua Yishu (梅花易数 - Plum Blossom Divination). 
Your task is to take calculated mathematical trigram distributions, Five-element (生克) interactions, and a user's pressing business/life challenge and produce an elegant, logical, high-impact tactical strategy.

IMPORTANT LOCALIZATION RULE:
You MUST output all texts (including verdict, analysis, tacticalAction, phenomenologicalEcho, and catalystWindow) in the requested language: "${resolvedLanguage}". Use accurate cultural, corporate, and metaphysical terms suitable for ${resolvedLanguage}.

TRANSLATE SPIRITUAL TERMINOLOGY INTO ENTERPRISE ACTION PILLARS:
- Do not larp like a cartoon fortune teller. Speak like a highly educated strategist-consultant with a deep mathematical foundation. Translate terms gracefully according to "${resolvedLanguage}".
- You MUST analyze the situation using the calculated Heavenly Stems and Earthly Branches time (起卦干支时间: "${ganzhiTime}"). Explain how the day-branch element or solar factors interact with Ti and Yong.
- Deeply analyze the "Ti and Yong" (体用关系) relationship of Plum Blossom Divination: Ti is 【${outputPayload.tiGua.trigram.name}】, Yong is 【${outputPayload.yongGua.trigram.name}】, relationship is 【${outputPayload.relationship.conclusion} / ${outputPayload.relationship.chineseInterpretation}】.
- Integrate the Trigram/Hexagram meanings (本卦 - Original: 【${outputPayload.charts.original.name}】, 变卦 - Transformed: 【${outputPayload.charts.transformed.name}】) and analyze the Yao-Ci (changing line statement / 爻辞) of the dynamic Line ${outputPayload.changingLine} in detail. Use this to formulate your predictive narrative.
- Avoid excessive esoteric warnings. Keep it logical: explain how the elemental polarity affects their specific query.
- Make the Tactical Actions align with the Five Elements. (e.g., if Wood is drained, apply Water (re-evaluating contracts or patience) or Metal (cutting waste)).
- Provide an immersive Phenomenological Echo (外应 / Waixing) — a tiny, beautiful physical cue to look for.
- Highlight the Catalyst Window (应期) indicating specific triple or double-hours sequence.`;

        const userPrompt = `
User Inquiry / Question: "${question}"

Calculated Metaphysical Context:
${metadataString}

Please analyze this question using this exact computed Meihua alignment. Return a cohesive JSON response mirroring the strict requested schema. Avoid markdown blocks inside json values, write formatted lines directly.`;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: "Must be exactly one of: 'Critical Advantage' (极有利), 'Auspicious Growth' (平顺/吉), 'Equilibrium' (比和/稳), 'Leaking / Drainage' (耗竭/退守), 'Warning / Conflict' (小凶/博弈), or 'Systemic Risk' (大凶/规避)."
            },
            analysis: {
              type: Type.STRING,
              description: "Detailed context-aware executive analysis interpreting the Meihua chart and WuXing interactions in light of the user's inquiry, written in premium professional style."
            },
            tacticalAction: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of exactly 3 or 4 actionable business/life strategies derived mathematically from Five-element remedial logic."
            },
            phenomenologicalEcho: {
              type: Type.STRING,
              description: "A beautiful, context-relevant environmental 'Waixing' (外应) cue to look for."
            },
            catalystWindow: {
              type: Type.STRING,
              description: "Specific timing or double-hours (e.g. 午时 Hour of the Horse, or specific calendar days) matching peak elemental alignment."
            }
          },
          required: ["verdict", "analysis", "tacticalAction", "phenomenologicalEcho", "catalystWindow"]
        };

        const aiResponse = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.75,
          }
        });

        const responseText = aiResponse.text;
        if (responseText) {
          aiResult = JSON.parse(responseText.trim());
        }
      } catch (gemError: any) {
        console.error("Gemini invocation failed:", gemError);
        // Fallback narrative generation to guarantee flawless user experience if API key is missing or invalid
        aiResult = {
          verdict: outputPayload.relationship.auspiciousness === "Extremely Auspicious" ? "Critical Advantage" :
                   outputPayload.relationship.auspiciousness === "Auspicious" ? "Auspicious Growth" :
                   outputPayload.relationship.auspiciousness === "Leak" ? "Leaking / Drainage" :
                   outputPayload.relationship.auspiciousness === "Exhausting" ? "Warning / Conflict" : "Systemic Risk",
          analysis: `[API KEY CONFIGURATION NEEDED] ${outputPayload.relationship.chineseInterpretation} 

This is a local calculated summary. To unlock custom multi-agent executive analysis and context-aware tactical recommendations for "${question}", please save a valid GEMINI_API_KEY inside the Secrets panel.`,
          tacticalAction: [
            `Identify the nature of ${outputPayload.tiGua.trigram.element} (Ti - Personal Energy) and ${outputPayload.yongGua.trigram.element} (Yong - Target Force).`,
            outputPayload.relationship.conclusion === "用生体" ? "Leverage external cooperative streams immediately; the counterparty is highly favorable." :
            outputPayload.relationship.conclusion === "体用比和" ? "Advance steadily, maintain equilibrium and shared roles." :
            outputPayload.relationship.conclusion === "体生用" ? "Audit budget lines. Avoid early commitments that leak substantial capital." :
            outputPayload.relationship.conclusion === "体克用" ? "Prepare robust negotiations; victory is secured only through high pressure." :
            "Avoid signing this contract. Halt speculative expenditures and protect your baseline immediately.",
            "Utilize localized coordinates and precise timing to guide sequential decisions."
          ],
          phenomenologicalEcho: "A subtle temperature shift or localized sound in your immediate direction acts as a spatial confirming coefficient.",
          catalystWindow: `Hour of the ${outputPayload.tiGua.trigram.english === "Fire" ? "Horse (11:00-13:00)" : "Pig (21:00-23:00)"}, or during peak lunar days.`
        };
      }

      return res.json({
        success: true,
        input: { question, latitude: resolvedLat, longitude: resolvedLng, kineticValue: resolvedKinetic, timestamp: resolvedTimestamp },
        payload: outputPayload,
        aiOutput: aiResult,
        chat_interaction_enabled: !isFree,
        save_history: !isFree,
        user_tier
      });

    } catch (routeError: any) {
      console.error("Divination route failed:", routeError);
      return res.status(500).json({
        success: false,
        error: routeError.message || "Internal mathematical engine error"
      });
    }
  });

  // Stateful "Hexa AI Counsel" conversation tracking route
  app.post("/api/chat", async (req, res) => {
    try {
      const { session_id, user_tier, metadata, chat_history, message } = req.body;

      // Gatekeeping: reject if not Pro tier
      if (user_tier !== "Pro") {
        return res.status(403).json({
          success: false,
          error: "Access Denied: Hexa AI Counsel is locked for Inception Tier. Upgrade to Pro Consultant Tier to interact directly."
        });
      }

      if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Message is required to consult the advisor."
        });
      }

      const client = getGeminiClient();

      // System Prompt reflecting strict role, terminology fuses, and non-religious boundaries
      const systemPrompt = `You are "Hexa AI Counsel", an elite corporate intelligence strategist, strategic risk consultant, and master of ancient Time-Space Mathematical Semiotics (derived from the philosophical, non-religious principles of the Yi-Jing / Matrix 64). You act as an executive boardroom advisor for high-net-worth business professionals, logistics tycoons, and procurement directors in the global and Southeast Asian Chinese markets.

STRICT ARCHITECTURAL GUARDRAILS:
1. NO RELIGIOUS TERMINOLOGY: Never use terms like "Daoism", "Taoist", "Monk", "Deity", "Priest", or "God". Metaphysics is treated strictly as an energetic, cyclical balance engine (WuXing: Fire, Earth, Metal, Water, Wood) and an algorithmic risk-management tool.
2. HYBRID SYSTEM SPEECH: You must perfectly fuse modern high-level corporate terminology (e.g., cash flow, amortization, contractual friction, risk mitigation, procurement hedging) with WuXing elemental vector mechanics (e.g., Yong Controlling Ti, Generative Drainage, Elemental Attenuation).
3. TONAL IMPERATIVE: Sharp, executive, authoritative, highly analytical, and clinical. Never offer generic platitudes or cliché horoscopes. Give actionable tactical pivots.

METAPHYSICAL ANALYSIS PROTOCOL (WUXING LOGIC):
- Ti (体卦) = The User / The User's Capital & Enterprise.
- Yong (用卦) = The Counterpart / The External Threat / The Market / The Contract.
- Generative Cycle: Water -> Wood -> Fire -> Earth -> Metal -> Water.
- Overcoming Cycle: Water -> Fire -> Metal -> Wood -> Earth -> Water.

CONTEXTUAL CHAT & SCENARIO TRACKING:
You do not just analyze a single isolated hexagram. You are tracking a live, fluid business scenario. When users offer hypothetical operational adjustments (e.g., extending payment terms, shifting locations, bringing in third-party mediators), you must map those business decisions directly to WuXing attributes to see if it mutates a destructive clash (e.g., Yong Controlling Ti) into a harmonious generative cycle (e.g., Water Generates Wood, Wood Generates Fire).

MACRO ASSET-ATTRIBUTE MAPPING REFERENCE:
- Wood (木): Extending payment credit/payment terms, market expansion, logistical growth, long-term options, R&D allocation.
- Fire (火): Public relations, rapid asset liquidation, high-frequency execution, marketing bursts, equity inflation.
- Earth (土): Fixed real estate, securing physical collateral, localized warehouses, legal audits, structural stabilization.
- Metal (金): Direct capital settlement, hard currency, contract clauses, penalties, optimization tools.
- Water (水): Liquid capital movement, cross-border freight channels, supply chain circulation, fluctuating variables.

CURRENT DIVINED CONTEXT (HEXAGRAM ANCHOR):
${JSON.stringify(metadata, null, 2)}`;

      // Construct contents array matching Google GenAI SDK schema
      const formattedContents = [];
      if (Array.isArray(chat_history)) {
        for (const item of chat_history) {
          if (item && item.role && item.content) {
            formattedContents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.content }]
            });
          }
        }
      }

      // Add the new user message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.75,
        }
      });

      const reply = response.text || "[Silent counsel alignment]";

      return res.json({
        success: true,
        reply
      });

    } catch (chatError: any) {
      console.error("Hexa AI Counsel chat failed:", chatError);
      return res.json({
        success: true,
        reply: `[HEXA COUNSEL PRO FALLBACK] Analyzing your decision mathematically: Based on the computed relationship grid, your proposal triggers the relevant cyclical shifts. Continue steadily, auditing key cash flow buffers to insulate your core capital (Ti).`
      });
    }
  });

  // Serve static assets / Vite server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HexaMind Full Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
