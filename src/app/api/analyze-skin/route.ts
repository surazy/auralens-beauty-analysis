import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageBase64, locale } = await request.json();

    if (!imageBase64) {
      return Response.json(
        { ok: false, error: "Image is required for skin analysis." },
        { status: 400 }
      );
    }

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

    let systemPrompt = `You are a visual dermatologist and aesthetic skincare analyst for a high-end beauty app.
Analyze the user's face selfie in the image and perform a detailed skincare assessment.

CRITICAL FACE DETECTION RULE:
First, inspect the image to verify if it contains a clearly visible human face.
- If there is NO human face in the image, or if the image is too dark, blurry, or showing a non-face object (e.g. a wall, hand, product bottle, or table), you MUST NOT perform any skin analysis. Instead, return a JSON object with only a single "error" key:
  { "error": "No human face detected. Please capture a clear selfie inside the oval face guide under good lighting." }
- If a human face is clearly present, proceed with the analysis.

If a human face is detected, evaluate their face image to determine:
1. Skin Type (Select strictly one from: "Dry", "Oily", "Sensitive", "Acne-Prone").
2. Hydra Score (Provide a single integer score out of 100 based on visible moisture, plumpness, or dry scaling).
3. Glow Score (Provide a single integer score out of 100 based on skin radiance, light reflection, and overall glow).
4. Primary Focus (Provide a brief, single-sentence summary of 10-20 words describing the main skin condition observed, e.g. "Mild redness around the cheeks requiring barrier replenishment" or "Optimal hydration with slight surface oiliness in the T-zone").

Return STRICTLY a raw JSON object with this schema when a face is detected:
{
  "skinType": "string",
  "hydraScore": number,
  "glowScore": number,
  "primaryFocus": "string"
}

If no human face is detected:
{
  "error": "string"
}

Rules:
- "skinType" must be exactly "Dry", "Oily", "Sensitive", or "Acne-Prone".
- "hydraScore" must be a number between 0 and 100.
- "glowScore" must be a number between 0 and 100.
- "primaryFocus" must be a short concise sentence.
- Output ONLY the JSON object. No markdown, no notes, no prose outside the JSON.`;

    if (locale === "am") {
      systemPrompt += `

- CRITICAL LOCALIZATION INSTRUCTION: Since the active locale is Amharic ('am'), you MUST translate the text string values for "skinType", "primaryFocus", and any "error" message into flawless Amharic Ge'ez script (e.g. translate "Oily" to "ቅባታማ" or "Sensitive" to "ስሜታዊ").
- Keep the JSON keys ("skinType", "hydraScore", "glowScore", "primaryFocus", "error") STRICTLY in English exactly as defined in the schema above so that parsing logic does not break.`;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (isOpenRouter) {
      headers["HTTP-Referer"] = "https://auralens.beauty";
      headers["X-Title"] = "Bloomy Beauty Analysis";
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Perform skin dermatology analysis and return structured JSON.",
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
      console.error("Skin Scanner API error:", res.status, errText);
      return Response.json(
        { ok: false, error: `Skin analysis service error (${res.status})` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "{}";

    try {
      const parsed = JSON.parse(content);
      if (parsed.error) {
        return Response.json({ ok: false, error: parsed.error });
      }
      return Response.json({ ok: true, result: parsed });
    } catch {
      return Response.json(
        { ok: false, error: "Could not parse skin analysis response" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Skin Analyze Route Error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
