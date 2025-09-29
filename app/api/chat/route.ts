import { NextRequest } from "next/server";
import { systemPrompt, moderateInput } from "@/lib/guardrails";
import { checkRateLimit } from "@/lib/rateLimit";

type Message = { role: "user" | "assistant" | "system"; content: string };

// Edge runtime'da encoding sorunları olabilir, Node.js runtime kullan
// export const runtime = "edge";

function securityHeaders() {
  return {
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  } as Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Sunucu yapılandırması eksik", code: "NO_API_KEY" }),
        { status: 500, headers: { "Content-Type": "application/json", ...securityHeaders() } }
      );
    }

    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      "";
    const ip = ipHeader.split(",")[0]?.trim() || "";
    const rl = checkRateLimit(ip);
    if (rl.limited) {
      return new Response(
        JSON.stringify({ error: "Çok fazla istek, lütfen sonra tekrar deneyin", code: "RATE_LIMIT" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((rl.resetAt - Date.now()) / 1000).toString(),
            ...securityHeaders(),
          },
        }
      );
    }

    const body = (await req.json()) as { messages?: Message[] };
    const userContent = body?.messages?.findLast((m) => m.role === "user")?.content ?? "";
    const mod = moderateInput(userContent);
    if (!mod.allowed) {
      const safe =
        "Bu isteği karşılayamam. Güvenliğiniz için bu tür talepleri yanıtlamıyorum. Gerekliyse profesyonel destek alın.";
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(safe));
          controller.close();
        },
      });
      return new Response(stream, { status: 200, headers: { ...securityHeaders() } });
    }

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...((body.messages ?? []).filter((m) => m.role !== "system") as Message[]),
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: "OpenAI isteği başarısız", code: "UPSTREAM", detail: errText }),
        { status: 502, headers: { "Content-Type": "application/json", ...securityHeaders() } }
      );
    }

    // SSE benzeri chunk text akışı
    const decoder = new TextDecoder("utf-8");

    const stream = new ReadableStream({
      async start(controller) {
        const reader = resp.body!.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            // Buffer'ı UTF-8 olarak decode et
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split(/\n/).filter(Boolean);
            
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const data = line.replace(/^data:\s*/, "");
              if (data === "[DONE]") {
                continue;
              }
              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  // UTF-8 encoding ile encode et
                  const encoded = new TextEncoder().encode(delta);
                  controller.enqueue(encoded);
                }
              } catch {
                // yoksay
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
        ...securityHeaders(),
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Geçersiz istek", code: "BAD_REQUEST" }),
      { status: 400, headers: { "Content-Type": "application/json", ...securityHeaders() } }
    );
  }
}


