import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, profile, product } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { ok: false, error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const skinType = profile?.skinType ?? "Sensitive";
    const age = profile?.age ?? "30-39";

    const brand = product?.brand ?? "Unknown Brand";
    const productName = product?.productName ?? "Unknown Product";
    const isProductSafe = product?.isProductSafe ?? true;
    const benefits = product?.benefits ?? [];
    const hazards = product?.hazards ?? [];
    const usageDetails = product?.usageDetails ?? {};
    const alternativeProduct = product?.alternativeProduct ?? {};

    const systemPrompt = `You are an expert cosmetic chemistry and skincare coach called "Aura Coach". You are consulting a user about their progress with a specific beauty product.

User Profile:
- Skin Type: ${skinType}
- Age: ${age}

Product Details:
- Brand: ${brand}
- Product Name: ${productName}
- Safety Status: ${isProductSafe ? "Safe & Clean" : "Contains Hazards"}
- Benefits: ${JSON.stringify(benefits)}
- Hazards: ${JSON.stringify(hazards)}
- Usage Integration: ${JSON.stringify(usageDetails)}
- Alternative Product (if unsafe): ${JSON.stringify(alternativeProduct)}

Your Task:
- Respond to the user's questions or logs about their routine progress with this product.
- Provide highly personalized, supportive, and scientifically accurate advice.
- Keep your responses relatively concise (1-3 sentences, max 80 words) and direct.
- If they report side effects like dryness, stinging, redness, or burning, give practical advice: explain if it's normal (e.g. purging from retinol/acids vs. barrier damage), advise on reducing frequency or pausing, and point to soothing solutions (like natural botanical oils, soothing honey balms, or organic recovery serums).
- Do not use markdown styling like headers or bullet points; use clean, elegant paragraph prose.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        ],
        temperature: 0.5,
        max_tokens: 250,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq chat error:", res.status, errText);
      return Response.json(
        { ok: false, error: `Chat service error (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Keep tracking your daily routine! Your skin barrier takes roughly 14 days to adjust.";

    return Response.json({ ok: true, reply });
  } catch (err: any) {
    console.error("Chat Route Error:", err);
    return Response.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
