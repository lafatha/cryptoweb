import { fetchWithRetry } from "@/lib/net/fetchWithRetry";
import { mapError } from "@/lib/net/httpError";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { GROQ_API_KEY } = process.env;

    if (!GROQ_API_KEY) {
      return Response.json({
        ok: false,
        code: "NO_API_KEY",
        message: "GROQ_API_KEY not configured"
      });
    }

    const response = await fetchWithRetry(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Jawab HANYA JSON: {\"pong\":true}"
            },
            {
              role: "user",
              content: "ping"
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0
        })
      },
      { timeoutMs: 10000, retries: 1 }
    );

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return Response.json({
        ok: false,
        code: "NO_RESPONSE",
        message: "No response from Groq"
      });
    }

    try {
      const parsed = JSON.parse(content);
      return Response.json({
        ok: true,
        json: parsed
      });
    } catch (parseError) {
      return Response.json({
        ok: false,
        code: "BAD_JSON",
        message: "Invalid JSON response from Groq"
      });
    }

  } catch (error) {
    const mapped = mapError(error, "LLM");
    return Response.json(
      {
        ok: false,
        code: mapped.code,
        message: mapped.message
      },
      { status: mapped.status }
    );
  }
}
