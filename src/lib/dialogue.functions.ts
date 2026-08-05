import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ topic: z.string().min(1).max(300) });

export type Dialogue = { first: string; second: string };

export const generateDialogue = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<Dialogue> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content:
              "أنت كاتب حوار سعودي قصير. رجلان يتناقشان في موضوع. اكتب جملة واحدة لكل واحد باللهجة السعودية العامية، قصيرة (أقصى 18 كلمة)، الأول يطرح رأيه والثاني يرد عليه برأي مختلف. أعد JSON فقط بالشكل {\"first\":\"...\",\"second\":\"...\"} بدون أي نص إضافي.",
          },
          { role: "user", content: `الموضوع: ${data.topic}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("الطلبات كثيرة، جرّب بعد شوي.");
      if (res.status === 402) throw new Error("انتهى رصيد الذكاء الاصطناعي.");
      throw new Error(`فشل توليد الحوار: ${res.status} ${text}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: { first?: unknown; second?: unknown } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }

    const first = typeof parsed.first === "string" ? parsed.first.trim() : "";
    const second = typeof parsed.second === "string" ? parsed.second.trim() : "";
    if (!first || !second) throw new Error("ما قدرنا نطلع حوار، جرّب موضوع ثاني.");

    return { first, second };
  });
