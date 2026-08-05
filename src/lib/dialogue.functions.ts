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
              'You write formal debate exchanges in English. Two speakers debate a topic: the first states a formal argument, the second delivers a formal rebuttal with a different position. Each statement must be one or two polished sentences (max 35 words), formal register, no slang, no names, no stage directions. Return JSON only in the form {"first":"...","second":"..."}.',
          },
          { role: "user", content: `Debate topic: ${data.topic}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Too many requests. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits have been exhausted.");
      throw new Error(`Failed to generate the debate: ${res.status} ${text}`);
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
