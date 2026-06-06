import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, profile, product, locale } = await request.json();

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

    let systemPrompt = `You are an expert cosmetic chemistry and skincare coach called "Bloomy Coach". You are consulting a user about their progress with a specific beauty product.

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
- Keep your responses relatively concise (1-4 sentences, max 100 words) and direct.
- If they attach an image of their skin symptom:
  - Analyze the photo for visible signs of irritation, redness, dry patches, flakiness, breakouts, or allergic reactions.
  - Explain whether this could be a temporary reaction (purging) to the product ingredients, or a sign of contact dermatitis/barrier damage.
  - Suggest simple, natural soothing alternatives (like flaxseed/Telba gel, black seed oil, honey balm, or moringa leaf extract).
  - Explicitly advise if they should pause using the current product.
- If they report symptoms in text without an image, give practical advice: explain if it's normal (e.g. purging from retinol/acids vs. barrier damage), advise on reducing frequency or pausing, and point to soothing solutions.
- Do not use markdown styling like headers or bullet points; use clean, elegant paragraph prose.`;

    if (locale === "am") {
      systemPrompt += `

- CRITICAL LOCALIZATION INSTRUCTION: The user has selected the Amharic ('am') locale. You MUST write your entire response strictly in natural, grammatically correct Amharic script. Maintain the elegant, supportive, and expert tone.`;
    }

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
          ...messages.map((m: any) => {
            const role = m.sender === "user" ? "user" : "assistant";
            if (m.image) {
              const imageUrl = m.image.startsWith("data:")
                ? m.image
                : `data:image/jpeg;base64,${m.image}`;
              return {
                role,
                content: [
                  { type: "text", text: m.text || "Analyze this skin symptom." },
                  { type: "image_url", image_url: { url: imageUrl } }
                ]
              };
            }
            return {
              role,
              content: m.text
            };
          }),
        ],
        temperature: 0.5,
        max_tokens: 350,
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
