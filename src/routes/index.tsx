import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import sceneBoth from "@/assets/scene-both.jpg";
import sceneLeft from "@/assets/scene-left.jpg";
import sceneRight from "@/assets/scene-right.jpg";
import { generateDialogue, type Dialogue } from "@/lib/dialogue.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Debate — نقاش بالذكاء الاصطناعي" },
      {
        name: "description",
        content:
          "اكتب موضوعاً وشاهد متحدثين يتناقشان فيه بحجّة ورد على مسرح واحد، بصياغة من الذكاء الاصطناعي.",
      },
      { property: "og:title", content: "AI Debate — نقاش بالذكاء الاصطناعي" },
      {
        property: "og:description",
        content:
          "اكتب موضوعاً وشاهد متحدثين يتناقشان فيه بحجّة ورد على مسرح واحد، بصياغة من الذكاء الاصطناعي.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Stage = 0 | 1 | 2;

const readingTime = (text: string) =>
  Math.min(14000, Math.max(4500, text.trim().split(/\s+/).length * 520));

function Bubble({ text, side }: { text: string; side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[10%] w-[42%] max-w-md ${
        side === "left" ? "left-[30%]" : "right-[30%]"
      }`}
    >
      <div className="relative rounded-2xl border border-border/60 bg-card/95 px-6 py-5 text-center text-sm leading-loose tracking-wide text-card-foreground shadow-2xl backdrop-blur-sm md:text-base">
        {text}
        <span
          className={`absolute -bottom-2 h-4 w-4 rotate-45 border-b border-l border-border/60 bg-card/95 ${
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

  // الرد الثاني يجي تلقائي بعد وقت كافي لقراءة كلام الأول
  useEffect(() => {
    if (stage !== 1 || !dialogue) return;
    const timer = setTimeout(() => setStage(2), readingTime(dialogue.first));
    return () => clearTimeout(timer);
  }, [stage, dialogue]);

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
    <main dir="rtl" className="min-h-screen bg-background px-5 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Powered by AI
          </p>
          <h1
            dir="ltr"
            className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
          >
            AI Debate
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            اطرح الموضوع، وسيتناقش المتحدثان فيه: حجّة ثم رد، بالتسلسل.
          </p>
        </header>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-border/40">
          <img
            src={image}
            alt="متحدثان يتناقشان على المسرح"
            width={1280}
            height={800}
            className="block w-full"
          />
          {stage === 1 && dialogue && <Bubble text={dialogue.first} side="left" />}
          {stage === 2 && dialogue && <Bubble text={dialogue.second} side="right" />}

          {stage !== 0 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {[1, 2].map((n) => (
                <span
                  key={n}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    stage === n ? "w-8 bg-primary" : "w-3 bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {stage === 0 ? (
          <form onSubmit={start} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: العمل عن بُعد أفضل من الحضور المكتبي"
              className="flex-1 rounded-xl border border-input bg-card px-5 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "جاري التحضير…" : "ابدأ النقاش"}
            </button>
          </form>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {stage === 1 ? "المتحدث الأول يتكلّم… الرد بعد قليل" : "انتهى النقاش"}
            </p>
            <button
              onClick={reset}
              className="rounded-xl border border-border bg-card px-8 py-3 text-base font-medium text-card-foreground transition-colors hover:bg-secondary"
            >
              موضوع جديد
            </button>
          </div>
        )}

        {error && <p className="mt-5 text-center text-sm text-destructive">{error}</p>}
      </div>
    </main>
  );
}
