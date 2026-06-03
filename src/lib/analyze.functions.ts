import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a master cosmetic chemistry analyzer for a high-end beauty app. Read the product label in the image and identify the brand, product name, and the key active compounds / ingredients listed.

Return STRICTLY a raw JSON object with this schema:

{
  "brand": "string",
  "productName": "string",
  "benefits": [{ "name": "string", "description": "string" }],
  "hazards": [{ "name": "string", "riskLevel": "High" | "Medium", "description": "string" }]
}

Rules:
- Provide 2 to 4 "benefits". Each "name" is the actual chemical / botanical compound from the label (e.g. "Niacinamide", "Hyaluronic Acid", "Squalane"). Each "description" MUST be a detailed paragraph of 3-5 sentences (around 60-110 words) explaining: (a) what the compound is, (b) the concrete biological mechanism on the skin, (c) which skin types or concerns benefit most, and (d) the visible result the user can expect over time. Be specific, factual, dermatologist-grade — no generic marketing fluff.
- Provide 2 to 4 "hazards". Each "name" is the specific chemical / allergen on the label (e.g. "Parfum / Fragrance Mix", "Methylisothiazolinone", "Denatured Alcohol"). Each "description" MUST be a detailed paragraph of 3-5 sentences (around 60-110 words) explaining: (a) why this chemical is flagged, (b) the documented adverse reaction (irritation, sensitisation, endocrine disruption, photo-toxicity, barrier damage, etc.), (c) the at-risk skin profiles (sensitive, rosacea-prone, pregnant, compromised barrier), and (d) practical advice (patch-test, avoid sun, avoid layering with X).
- "riskLevel" is "High" only for known sensitisers, endocrine disruptors, or strong irritants. Otherwise "Medium".
- Output ONLY the JSON object. No prose, no markdown fences.`;

export const analyzeProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ imageBase64: z.string().min(100).max(2_000_000) }))
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

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
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this cosmetic product label and return strict JSON." },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${data.imageBase64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq error:", res.status, errText);
      return { ok: false as const, error: `Vision service error (${res.status})` };
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";

    try {
      const parsed = JSON.parse(content);
      return { ok: true as const, result: parsed };
    } catch {
      return { ok: false as const, error: "Could not parse formula response" };
    }
  });
