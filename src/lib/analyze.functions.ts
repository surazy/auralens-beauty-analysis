import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a master cosmetic chemistry analyzer for a high-end beauty app. Analyze the text visible on the captured product bottle label. Isolate the key synthetic or raw compounds. Extract 1 to 3 distinct Skin Benefits and 1 to 3 Chemical Hazards or Allergen warning markers. Return strictly a raw JSON document following this JSON architecture:

{
  "brand": "string",
  "productName": "string",
  "benefits": [{"name": "string", "description": "string"}],
  "hazards": [{"name": "string", "riskLevel": "High" | "Medium", "description": "string"}]
}`;

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
        max_tokens: 800,
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
