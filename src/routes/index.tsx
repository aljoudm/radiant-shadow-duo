import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import sceneBoth from "@/assets/scene-both.jpg";
import sceneLeft from "@/assets/scene-left.jpg";
import sceneRight from "@/assets/scene-right.jpg";
import { generateDialogue, type Dialogue } from "@/lib/dialogue.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "نقاش الرجّالين — حوار بالذكاء الاصطناعي" },
      {
        name: "description",
        content: "اكتب موضوع، وشاهد رجّالين بالثوب والشماغ يتناقشون فيه بثلاث مشاهد متتابعة.",
      },
      { property: "og:title", content: "نقاش الرجّالين — حوار بالذكاء الاصطناعي" },
      {
        property: "og:description",
        content: "اكتب موضوع، وشاهد رجّالين بالثوب والشماغ يتناقشون فيه بثلاث مشاهد متتابعة.",
      },
    ],
  }),
  component: Index,
});

type Stage = 0 | 1 | 2;

function Bubble({ text, side }: { text: string; side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[6%] w-[46%] max-w-sm ${side === "left" ? "right-[6%]" : "left-[6%]"}`}
    >
      <div className="relative rounded-3xl border-2 border-foreground/15 bg-card px-5 py-4 text-center text-sm font-medium leading-relaxed text-card-foreground shadow-xl md:text-base">
        {text}
        <span
          className={`absolute -bottom-3 h-6 w-6 rotate-45 border-b-2 border-l-2 border-foreground/15 bg-card ${
            side === "left" ? "left-8" : "right-8"
          }`}
        />
      </div>
    </div>
  );
}

function Index() {
  const run = useServerFn(generateDialogue);
  const [topic, setTopic] = useState("");
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [stage, setStage] = useState<Stage>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await run({ data: { topic: topic.trim() } });
      setDialogue(result);
      setStage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "صار خطأ، جرّب مرة ثانية.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage(0);
    setDialogue(null);
    setError(null);
  };

  const image = stage === 0 ? sceneBoth : stage === 1 ? sceneLeft : sceneRight;

  return (
    <main dir="rtl" className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">نقاش الرجّالين</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            اكتب الموضوع، وخلّهم يتناقشون فيه مشهد ورا مشهد.
          </p>
        </header>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          <img
            src={image}
            alt="رجلان بالثوب الأبيض والشماغ الأحمر يتناقشان"
            width={1280}
            height={832}
            className="block w-full"
          />
          {stage === 1 && dialogue && <Bubble text={dialogue.first} side="left" />}
          {stage === 2 && dialogue && <Bubble text={dialogue.second} side="right" />}
        </div>

        {stage === 0 ? (
          <form onSubmit={start} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: الدوام عن بعد أفضل من الحضور؟"
              className="flex-1 rounded-2xl border border-input bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {loading ? "جاري التوليد..." : "ابدأ النقاش"}
            </button>
          </form>
        ) : (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {stage === 1 && (
              <button
                onClick={() => setStage(2)}
                className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground"
              >
                رد الثاني
              </button>
            )}
            <button
              onClick={reset}
              className="rounded-2xl border border-border bg-card px-6 py-3 text-base font-semibold text-card-foreground"
            >
              موضوع جديد
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        )}
      </div>
    </main>
  );
}
