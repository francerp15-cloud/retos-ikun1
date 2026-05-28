import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, system } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.includes("PEGA_TU_KEY")) {
      return NextResponse.json(
        { error: { type: "authentication_error", message: "API key no configurada." } },
        { status: 401 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward Anthropic's error structure so the client can parse it
      return NextResponse.json({ error: data.error ?? data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: { type: "server_error", message: "Error interno del servidor." } },
      { status: 500 }
    );
  }
}
