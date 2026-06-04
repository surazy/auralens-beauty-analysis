import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageBase64, skinType, age } = await request.json();

    if (!imageBase64) {
      return Response.json(
        { ok: false, error: "Image is required for scanning." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { ok: false, error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a master cosmetic chemistry analyzer for a high-end beauty app. Read the product label in the image and identify the brand, product name, and the key active compounds / ingredients listed.

Analyze these ingredients specifically for someone with ${skinType} skin, aged ${age}. Adjust the risk levels and hazard descriptions to match their profile (e.g., if a product has heavy oils and they have oily skin, flag it as a hazard; if it has drying alcohols and they have dry skin, elevate the risk to High).

Return STRICTLY a raw JSON object with this schema:

{
  "brand": "string",
  "productName": "string",
  "isProductSafe": boolean,
  "benefits": [{ "name": "string", "description": "string", "details": "string" }],
  "hazards": [{ "name": "string", "riskLevel": "High" | "Medium", "description": "string", "details": "string" }],
  "alternativeProduct": {
    "name": "string",
    "brand": "string",
    "reason": "string"
  },
  "usageDetails": {
    "howToUse": "string",
    "whenToUse": "string",
    "timeline": {
      "day3": "string",
      "day14": "string",
      "day30": "string"
    }
  }
}

Rules:
- "isProductSafe" is a boolean. Set to false if there are any "High" risk hazards, or if there are ingredients that directly clash with their skin profile (like heavy oils for oily skin, drying alcohols for dry skin). Otherwise, true.
- Provide 2 to 4 "benefits". Each "name" is the chemical / botanical compound (e.g. "Niacinamide"). Each "description" MUST be a single concise, punchy sentence of 10-20 words summarizing its direct action. Each "details" MUST be a brief 2-3 sentence scientific breakdown of its biological mechanism and expected skin concerns benefit (around 45-70 words).
- Provide 2 to 4 "hazards". Each "name" is the specific chemical / allergen (e.g. "Denatured Alcohol"). Each "description" MUST be a single concise, punchy sentence of 10-20 words summarizing the direct risk. Each "details" MUST be a brief 2-3 sentence scientific explanation of the adverse reaction and practical advice (around 45-70 words).
- "riskLevel" is "High" only for known sensitisers, endocrine disruptors, or strong irritants. Otherwise "Medium".
- "alternativeProduct" is a safer, organic recommendation. The brand should be a realistic organic/clean beauty brand (e.g. "Tata Harper", "The Ordinary", "Herbivore Botanicals", "Indie Lee"). The name should be a realistic organic product (e.g. "Pure Nile Shea Butter", "Teff Seed Soothing Serum", "Rosehip Recovery Oil"). The reason must be a detailed sentence explaining why this alternative is excellent for someone with ${skinType} skin aged ${age}.
- "usageDetails" specifies how to integrate this scanned product (or its alternative if unsafe) into a daily routine. Provide instructions for "howToUse", "whenToUse" (e.g., "Night routine, 3 times a week"), and realistic expectations in the "timeline" for "day3", "day14", and "day30" (e.g., skin barrier restoration, hydration levels, redness reduction).
- Output ONLY the JSON object. No prose, no markdown fences.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 2400,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this cosmetic product label and return strict JSON.",
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq error:", res.status, errText);
      return Response.json(
        { ok: false, error: `Vision service error (${res.status})` },
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
        { ok: false, error: "Could not parse formula response" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Analyze Route Error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
