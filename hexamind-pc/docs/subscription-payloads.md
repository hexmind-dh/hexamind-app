# Subscription Monetization & Payload Integration Reference

This document catalogs the official federated identity rules, tier monetization matrix, and backend payload response schemas representing standard client-server contracts for **HexaMind (New Gen)**.

---

## 1. Authentication & Federated SSO Identity Overhaul

To strictly eliminate free-tier trial manipulation through disposable temporary email addresses, the HexaMind interface operates under a **Strict No-Email Registration Policy**. Users can initialize identity mapping via social Single Sign-On (SSO) providers only.

### Identity Providers (SSO Only)
1. **Google Sign-In**
2. **Apple Sign-In**
3. **Facebook Login**

### Social Token Architecture Map
Upon client-side authentication callback, the backend validates the OAuth token and registers a secure User ID (UUID V4) mapping directly to the platform's social identifier:

```json
{
  "user_id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "identity": {
    "provider": "google",
    "provider_uid": "116523953401587563029",
    "email_verified": true,
    "role": "tier_unlocked_customer"
  }
}
```

---

## 2. Dynamic 3-Tier Monetization Matrix

| Feature Dimension | Free Tier | Standard Plan ($19.99/mo) | Professional Plan ($49.99/mo) |
| :--- | :--- | :--- | :--- |
| **Daily Inquiries** | Max 2 queries / day | Max 10 queries / day | Max 50 queries / day |
| **Cooldown Interval** | 1 Hour (3,600s) | 10 Minutes (600s) | 60 Seconds (Rapid iteration) |
| **Local Retention** | 7 Days chronological pruning | Max 100 entries capacity | Unlimited query logger |
| **YingQi Granularity** | Hidden / Blurred with lock notice | Unmasked Date (e.g., "May 28") | Double-Hour window (e.g. "05:00-07:00") |
| **Hardware Core Seed** | Time + Basic LBS | Time + Precision High-Res LBS | Custom Kinetic Vector + Micro-vibrations |
| **System Cloud Sync** | Gated / Locked | Gated with upgrade banner | One-touch Apple & Google Calendar integration |

---

## 3. Standard Model Schemas & Paywall Payload Reference

The metaphysical calculation engine returns the following payload structures to represent subscription boundaries.

### A. Free Tier Payload (YingQi Blurred / Masked)
```json
{
  "success": true,
  "tier": "Free",
  "limits": {
    "daily_quota": 2,
    "cooldown_seconds": 3600
  },
  "input": {
    "question": "Will we convert client acquisitions in Europe this quarter?",
    "latitude": 31.23,
    "longitude": 121.47,
    "kineticValue": 1.200
  },
  "payload": {
    "meihua": {
      "gual_name": "Lake over Fire (革 - Revolution)",
      "conclusion": "用生体 (Auspicious support)"
    }
  },
  "aiOutput": {
    "verdict": "Auspicious Growth",
    "analysis": "The gua represents transformation. Conserve power for strategic execution.",
    "tacticalAction": [
      "Gather localized insights",
      "Draft low-risk transition models"
    ],
    "phenomenologicalEcho": "A faint wind from the East marks the alignment of coordinates.",
    "yingqi_masked": true,
    "catalystWindow": null
  }
}
```

### B. Standard Tier Payload (Date Unveiled / Hours Blurred)
```json
{
  "success": true,
  "tier": "Standard",
  "limits": {
    "daily_quota": 10,
    "cooldown_seconds": 600
  },
  "input": {
    "question": "Launch critical SaaS server redesign projects tonight?",
    "latitude": 31.2307,
    "longitude": 121.4729,
    "kineticValue": 11.890
  },
  "payload": {
    "meihua": {
      "gual_name": "Wind over Earth (观 - Contemplation)",
      "conclusion": "体用比和 (Balanced harmony)"
    }
  },
  "aiOutput": {
    "verdict": "Critical Advantage",
    "analysis": "Sustained observation of technical requirements aligns with current structural windows.",
    "tacticalAction": [
      "Deploy unit tests incrementally",
      "Monitor cache memory utilization thresholds"
    ],
    "phenomenologicalEcho": "An unexpected server status ding sounds as spatial calculations finish.",
    "yingqi_masked": false,
    "exact_date": "2026-05-28",
    "catalystWindow": "May 28 [🔒 Hour Masked - Go Pro]"
  }
}
```

### C. Professional Tier Payload (Fully Unmasked + Sync Enabled)
```json
{
  "success": true,
  "tier": "Pro",
  "limits": {
    "daily_quota": 50,
    "cooldown_seconds": 60
  },
  "input": {
    "question": "Establish Series A fundraising round valuations with Singapore VC?",
    "latitude": 31.230712,
    "longitude": 121.472985,
    "kineticValue": 118.945
  },
  "payload": {
    "meihua": {
      "gual_name": "Heaven over Wind (姤 - Meeting)",
      "conclusion": "体克用 (Assertive dominance)"
    }
  },
  "aiOutput": {
    "verdict": "Strategic Dominion",
    "analysis": "Unmatched kinetic speed patterns and sub-meter precision GPS validate structural negotiations. Success is backed by the supportive element alignment.",
    "tacticalAction": [
      "Present complete multi-year financial ledgers",
      "Execute bilateral term-sheet signatures immediately",
      "Synthesize final consensus parameters with advisors"
    ],
    "phenomenologicalEcho": "Sudden bright reflection upon the main digital display validates your decision path.",
    "yingqi_masked": false,
    "exact_date": "2026-05-28",
    "exact_hour_window": "05:00 - 07:00 (Rabbit)",
    "catalystWindow": "Rabbit Hour (05:00-07:00) 2026.05.28",
    "calendar_sync_available": true,
    "calendar_payload": {
      "summary": "HexaMind Strategic Milestone: VC Valuation Integration",
      "description": "Metaphysically modeled optimum window for execution. Calculated under Strategic Dominion element alignments.",
      "start": "2026-05-28T05:00:00Z",
      "end": "2026-05-28T07:00:00Z"
    }
  }
}
```
