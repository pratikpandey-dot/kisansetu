"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { createVlyIntegrations } from "@vly-ai/integrations";

const MODEL = "gpt-4o-mini";
const HELPLINE = "1800-180-1551";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिंदी)",
  mr: "Marathi (मराठी)",
  bn: "Bengali (বাংলা)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
};

function vlyAi() {
  const key = process.env.VLY_INTEGRATION_KEY;
  if (!key) return null;
  return createVlyIntegrations({ deploymentToken: key }).ai;
}

async function complete(prompt: string, system: string): Promise<string | null> {
  const ai = vlyAi();
  if (!ai) return null;
  try {
    const res = await ai.completion({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      maxTokens: 550,
    });
    if (!res.success || !res.data?.choices?.[0]?.message?.content) return null;
    return res.data.choices[0].message.content.trim();
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Kisan Mitra chatbot                                                */
/* ------------------------------------------------------------------ */

export const askMitra = action({
  args: {
    question: v.string(),
    lang: v.string(),
  },
  handler: async (ctx, args) => {
    const [farmer, booking, txs, rates] = await Promise.all([
      ctx.runQuery(api.farmers.getMyFarmer),
      ctx.runQuery(api.bookings.getMyBooking),
      ctx.runQuery(api.dashboard.getMyTransactions),
      ctx.runQuery(api.dashboard.getRates),
    ]);

    const lines: string[] = [];
    if (farmer) {
      lines.push(
        `Farmer: ${farmer.name}, ${farmer.village}, ${farmer.district} (${farmer.state}); land ${farmer.landSizeAcres} acres; verification: ${farmer.verificationStatus}`,
      );
    } else {
      lines.push("Farmer has not completed registration yet.");
    }
    if (booking?.active) {
      lines.push(
        `Active booking: token ${booking.active.booking.queueToken} at ${booking.active.centerName}, slot ${booking.active.slot?.label ?? "-"}, position ${booking.active.position} of ${booking.active.totalInQueue}`,
      );
    } else {
      lines.push("No active booking.");
    }
    for (const tx of (txs ?? []).slice(0, 5)) {
      lines.push(
        `Transaction ${tx.reference}: ${tx.crop}, ${tx.quantityQuintal} q @ ₹${tx.ratePerQuintal}/q = ₹${tx.amount} (${tx.status})`,
      );
    }
    if (rates.length > 0) {
      lines.push(
        `MSP rates per quintal: ${rates
          .slice(0, 8)
          .map((r: { crop: string; pricePerQuintal: number }) => `${r.crop} ₹${r.pricePerQuintal}`)
          .join(", ")}`,
      );
    }

    const system = [
      "You are Kisan Mitra, the friendly help assistant inside Kisan Setu,",
      "a government crop-procurement platform (farmer registration, document verification, slot booking, live queue, MSP prices, payment tracking).",
      `Always reply in ${LANG_NAMES[args.lang] ?? "English"}.`,
      "Use very simple words a first-time smartphone user understands. 2-5 short sentences max.",
      "Use the CONTEXT below for the farmer's personal data; never invent personal numbers.",
      "Only answer questions about farming, crops, procurement, slots, documents or payments.",
      `For anything else politely say you can't help and suggest calling the helpline ${HELPLINE}.`,
      "CONTEXT:",
      ...lines,
    ].join("\n");

    const answer = await complete(args.question, system);
    if (answer) return { answer, online: true };
    return { answer: offlineChat(args.question, args.lang, rates), online: false };
  },
});

/* ------------------------------------------------------------------ */
/* Offline fallback (rule-based, bilingual)                           */
/* ------------------------------------------------------------------ */

function offlineChat(
  question: string,
  lang: string,
  rates: { crop: string; pricePerQuintal: number }[],
): string {
  const q = question.toLowerCase();
  const hi = lang === "hi";
  const topRates = rates
    .slice(0, 4)
    .map((r) => `${r.crop} — ₹${r.pricePerQuintal}/quintal`)
    .join(" | ");

  if (/(price|rate|msp|bhav|भाव|दाम|कीमत|क़ीमत|मूल्य)/.test(q)) {
    return hi
      ? `आज के मुख्य भाव: ${topRates || "अभी उपलब्ध नहीं"}। पूरी सूची Prices पेज पर देखें।`
      : `Today's key MSP rates: ${topRates || "not available right now"}. See the full list on the Prices page.`;
  }
  if (/(book|slot|booking|बुक|स्लॉट)/.test(q)) {
    return hi
      ? "स्लॉट बुक करने के लिए: पहले दस्तावेज़ अपलोड करके सत्यापन कराएं, फिर Book Slot में केंद्र, दिन और समय चुनें। टोकन और कतार स्थिति तुरंत मिल जाएगी।"
      : "To book a slot: first upload documents and get verified, then open Book Slot and pick a centre, day and time. You get a queue token instantly.";
  }
  if (/(document|aadhaar|aadhar|pan|doc|दस्तावेज़|कागद|आधार)/.test(q)) {
    return hi
      ? "आपको आधार कार्ड, पैन कार्ड, भू-अभिलेख (खतौनी) और बैंक पासबुक चाहिए। दस्तावेज़ पेज पर अपलोड करें — OCR अपने आप सत्यापन कर देगा।"
      : "You need Aadhaar, PAN, land record (khatauni) and bank passbook. Upload them on the Documents page — OCR verifies them automatically.";
  }
  if (/(pay|payment|paise|भुगतान|पैसा|रकम|रसीद)/.test(q)) {
    return hi
      ? "भुगतान खरीद के 3 कार्य दिवसों में आपके बैंक खाते में DBT से आता है। Transaction history में स्थिति देखें और रसीद डाउनलोड करें।"
      : "Payment is transferred by DBT within 3 working days of procurement. Track the status in Transaction history and download the receipt there.";
  }
  if (/(queue|kataar|कतार|लाइन|position|बारी)/.test(q)) {
    return hi
      ? "Live Queue पेज पर देखें कि आपसे आगे कितने किसान हैं। आपकी बारी आने पर हम SMS भेजेंगे — तब तक केंद्र न जाएं।"
      : "Check the Live Queue page to see how many farmers are ahead of you. We send an SMS when your turn is near — don't go to the centre before that.";
  }
  return hi
    ? `मैं ऑफ़लाइन सीमित मोड में हूँ। कृपया ${HELPLINE} पर कॉल करें या बाद में फिर पूछें।`
    : `I'm in limited offline mode. Please call ${HELPLINE} or try again later.`;
}

/* ------------------------------------------------------------------ */
/* AI insights                                                        */
/* ------------------------------------------------------------------ */

export const askInsights = action({
  args: { lang: v.string() },
  handler: async (ctx, args) => {
    const [farmer, txs, docs, rates, booking] = await Promise.all([
      ctx.runQuery(api.farmers.getMyFarmer),
      ctx.runQuery(api.dashboard.getMyTransactions),
      ctx.runQuery(api.dashboard.getMyDocuments),
      ctx.runQuery(api.dashboard.getRates),
      ctx.runQuery(api.bookings.getMyBooking),
    ]);

    const langName = LANG_NAMES[args.lang] ?? "English";

    if (!farmer) {
      const msg =
        args.lang === "hi"
          ? "पहले अपना किसान पंजीकरण पूरा करें, फिर एआई इनसाइट्स उपलब्ध होंगी।"
          : "Complete your farmer registration first — AI insights will unlock after that.";
      await ctx.runMutation(internal.dashboard.saveInsight, { text: msg, online: false });
      return;
    }

    const paid = (txs ?? []).filter((t) => t.status === "paid");
    const pending = (txs ?? []).filter((t) => t.status === "pending");
    const totalPaid = paid.reduce((s, t) => s + t.amount, 0);
    const totalPending = pending.reduce((s, t) => s + t.amount, 0);
    const byCrop = new Map<string, number>();
    for (const t of txs ?? []) byCrop.set(t.crop, (byCrop.get(t.crop) ?? 0) + t.amount);
    const topCrop = [...byCrop.entries()].sort((a, b) => b[1] - a[1])[0];

    const stats = [
      `Verification: ${farmer.verificationStatus}; documents uploaded: ${docs?.length ?? 0}`,
      `Transactions: ${txs?.length ?? 0} (paid ${paid.length}, pending ${pending.length})`,
      `Total received: ₹${totalPaid}; awaiting payment: ₹${totalPending}`,
      topCrop ? `Top crop by value: ${topCrop[0]} (₹${topCrop[1]})` : "No sales recorded yet",
      booking?.active
        ? `Active booking: position ${booking.active.position} at ${booking.active.centerName}`
        : "No active booking",
      `MSP sample: ${rates
        .slice(0, 4)
        .map((r: { crop: string; pricePerQuintal: number }) => `${r.crop} ₹${r.pricePerQuintal}/q`)
        .join(", ")}`,
    ].join("\n");

    const system = [
      "You are an agricultural market analyst for the Kisan Setu procurement platform.",
      `Write the response in ${langName} using very simple words.`,
      "Output exactly 3-4 bullet lines, each starting with '• '.",
      "Cover: total earnings vs pending payments, best-performing crop, verification/booking status,",
      "and one short practical tip (e.g. when to sell, or what to upload next).",
      "No headings, no markdown, no numbers other than the given figures.",
      "FARMER DATA:",
      stats,
    ].join("\n");

    const text = await complete("Generate today's insights for this farmer.", system);
    const finalText =
      text ??
      (args.lang === "hi"
        ? `• कुल प्राप्त भुगतान: ₹${totalPaid.toLocaleString("en-IN")}\n• लंबित भुगतान: ₹${totalPending.toLocaleString("en-IN")}\n• सबसे अच्छी फ़सल: ${topCrop?.[0] ?? "—"}\n• सत्यापन स्थिति: ${farmer.verificationStatus}`
        : `• Total received: ₹${totalPaid.toLocaleString("en-IN")}\n• Awaiting payment: ₹${totalPending.toLocaleString("en-IN")}\n• Best crop: ${topCrop?.[0] ?? "—"}\n• Verification: ${farmer.verificationStatus}`);

    await ctx.runMutation(internal.dashboard.saveInsight, {
      text: finalText,
      online: text !== null,
    });
  },
});
