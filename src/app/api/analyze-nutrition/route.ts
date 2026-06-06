import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { profile, products, locale } = await request.json();

    const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json(
        { ok: false, error: "No API key configured on the server (GROQ_API_KEY / OPENROUTER_API_KEY)." },
        { status: 500 }
      );
    }

    const endpoint = isOpenRouter 
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.groq.com/openai/v1/chat/completions";

    const skinType = profile?.skinType ?? "Sensitive";
    const age = profile?.age ?? "30-39";
    const productsList = (products || []).map((p: any) => `${p.brand} ${p.productName} (Safe: ${p.isProductSafe})`).join(", ");

    let systemPrompt = `You are a premium cosmetic dietician and cosmetic chemist analyst. 
Your goal is to evaluate the user's active skin profile and the cosmetic products they use on their body to identify internal nutrient deficits. 
Recommend internal dietary guidelines and traditional Ethiopian superfoods to maximize skin, hair, and nail health.

User Context:
- Skin Type: ${skinType}
- Age: ${age}
- Used Products: [${productsList}]

Your Guidelines:
- Evaluate potential internal deficits linked to the skin type and current cosmetic chemical exposures.
- Recommend traditional Ethiopian superfoods that target these concerns:
  - Telba (Flaxseed) for dry skin, barrier repair, and moisture.
  - Habba Soda (Black Seed / Tikur Azmud) for hair growth, anti-inflammatory scalp health, and sebum balance.
  - Shiferaw (Moringa) for nutrient density, nail strength, and body detox.
  - Besso / Teff extracts for gut health, cell restoration, and skin glow.
- Renders:
  1. "focus": A concise sentence (10-20 words) detailing the main dietary focus area (e.g. "Replenishing omega fatty acids internally to calm dry skin and rebuild barrier lipids").
  2. "nutrients": 2-3 essential nutrients. For each, specify "name" (e.g. "Omega-3 Fatty Acids"), "why" (a clear explanation of how it helps skin/hair/nails), and "foods" (an array of common, accessible foods that contain this nutrient, e.g. ["Walnuts", "Chia Seeds", "Flaxseed", "Salmon"]).
  3. "superfoods": 2-3 traditional superfoods. For each, specify "name" (the English/scientific name, e.g. "Moringa Oleifera"), "localName" (the Amharic traditional name, e.g. "Shiferaw"), and "prep" (a quick description of how to prepare and eat it, e.g. "Mix 1 teaspoon of moringa leaf powder into warm water or green smoothies daily").
  4. "outerBodySynergy": A short summary (15-25 words) linking this diet to hair, scalp, or nail health (e.g. "Moringa and black seed nutrients stimulate keratin synthesis, strengthening nail plates and fortifying hair strands at the root").

Return STRICTLY a raw JSON object with this schema:
{
  "focus": "string",
  "nutrients": [
    { "name": "string", "why": "string", "foods": ["string"] }
  ],
  "superfoods": [
    { "name": "string", "localName": "string", "prep": "string" }
  ],
  "outerBodySynergy": "string"
}

Rules:
- Output ONLY the JSON object. No prose, no markdown formatting outside the JSON, no notes.
- Dynamic Variation: To ensure that the user gets fresh, varied, and engaging recommendations when they click refresh, please dynamically vary the selected nutrients, why descriptions, and food examples on subsequent requests (e.g., rotating between different relevant vitamins, minerals, and healthy fats). Do not repeat the exact same set of recommendations.`;

    if (locale === "am") {
      systemPrompt += `

- CRITICAL LOCALIZATION INSTRUCTION: Since the active locale is Amharic ('am'), you MUST translate the string values for "focus", nutrient names/whys/foods (each food item in the array), superfood names/localNames/preps, and "outerBodySynergy" into natural, grammatically correct Amharic script.
- Keep the JSON keys ("focus", "nutrients", "name", "why", "foods", "superfoods", "localName", "prep", "outerBodySynergy") STRICTLY in English exactly as defined in the schema above so that parsing logic remains unbroken.`;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (isOpenRouter) {
      headers["HTTP-Referer"] = "https://auralens.beauty";
      headers["X-Title"] = "AuraLens Nutrition Insights";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        response_format: { type: "json_object" },
        temperature: 0.85,
        max_tokens: 1500,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Generate internal cosmetic nutrition insights based on my skin type and vanity shelf.",
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Nutrition API error:", res.status, errText);
      return Response.json(
        { ok: false, error: `Nutrition analysis service error (${res.status})` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";

    try {
      const parsed = JSON.parse(content);
      return Response.json({ ok: true, result: parsed });
    } catch {
      return Response.json(
        { ok: false, error: "Could not parse nutrition insights response" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Nutrition Route Error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
