import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = body?.code;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid code input" }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OpenRouter API key" }, { status: 500 });
    }

    const prompt = `
Fix and improve the following code.

STRICT RULES:
- Return ONLY valid code
- Do NOT explain anything
- Do NOT include markdown
- No extra text before or after

Code:
${code}
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openrouter/free", // 🟢 Free Models Router
          messages: [
            { role: "system", content: "Only return corrected code. No explanations." },
            { role: "user", content: prompt },
          ],
          max_tokens: 800,
          temperature: 0,
        }),
      }
    );

    const text = await response.text();
    console.log("STATUS:", response.status);
    console.log("RAW TEXT:", text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON", raw: text },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "API error", raw: data },
        { status: response.status }
      );
    }

    let aiCode = "";

    const choice = data?.choices?.[0];
    if (typeof choice?.message?.content === "string") {
      aiCode = choice.message.content;
    } else if (typeof choice?.text === "string") {
      aiCode = choice.text;
    }

    // Clean out markdown if any
    aiCode = aiCode
      .replace(/```[a-zA-Z]*\n?/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json({ result: aiCode });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}