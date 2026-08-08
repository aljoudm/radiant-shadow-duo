import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import bishtAsset from "@/assets/bisht.png.asset.json";
import sceneBoth from "@/assets/scene-both.jpg";
import sceneLeft from "@/assets/scene-left.jpg";
import sceneRight from "@/assets/scene-right.jpg";
import { generateDialogue, type Dialogue } from "@/lib/dialogue.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Debate — Two Speakers, One Topic" },
      {
        name: "description",
        content:
          "Enter any topic and watch two speakers deliver a formal argument and rebuttal, written and voiced by AI.",
      },
      { property: "og:title", content: "AI Debate — Two Speakers, One Topic" },
      {
        property: "og:description",
        content:
          "Enter any topic and watch two speakers deliver a formal argument and rebuttal, written and voiced by AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Stage = 0 | 1 | 2;

const readingTime = (text: string) =>
  Math.min(16000, Math.max(5000, text.trim().split(/\s+/).length * 520));

function Bubble({ text, side }: { text: string; side: "left" | "right" }) {
  return (
    <div
      className={`absolute top-[8%] w-[34%] max-w-xs ${
        side === "left" ? "left-1/2 -translate-x-1/4" : "right-1/2 translate-x-1/4"
      }`}
    >
      <div className="relative rounded-2xl border border-border/60 bg-card/95 px-6 py-5 text-center text-sm leading-relaxed tracking-wide text-card-foreground shadow-2xl backdrop-blur-sm md:text-base">
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
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      if (audio.src.startsWith("blob:")) URL.revokeObjectURL(audio.src);
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  // Voice the current line, then advance to the rebuttal automatically.
  useEffect(() => {
    if (stage === 0 || !dialogue) return;
    const text = stage === 1 ? dialogue.first : dialogue.second;
    let cancelled = false;
    let fallback: ReturnType<typeof setTimeout> | undefined;

    const advance = () => {
      if (!cancelled && stage === 1) setStage(2);
    };

    const speak = async () => {
      try {
        const res = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: stage === 1 ? "onyx" : "echo" }),
        });
        if (!res.ok || cancelled) throw new Error("speech unavailable");
        const url = URL.createObjectURL(await res.blob());
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeaking(false);
          fallback = setTimeout(advance, 1200);
        };
        setSpeaking(true);
        await audio.play();
      } catch {
        setSpeaking(false);
        fallback = setTimeout(advance, readingTime(text));
      }
    };

    void speak();

    return () => {
      cancelled = true;
      if (fallback) clearTimeout(fallback);
      stopAudio();
    };
  }, [stage, dialogue, stopAudio]);

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
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    stopAudio();
    setStage(0);
    setDialogue(null);
    setError(null);
  };

  const image = stage === 0 ? sceneBoth : stage === 1 ? sceneLeft : sceneRight;

  return (
    <main className="min-h-screen bg-background px-5 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Powered by AI
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <img
              src={bishtAsset.url}
              alt="Traditional bisht cloak"
              className={`pointer-events-none h-11 w-auto origin-bottom transition-all duration-700 ease-out md:h-14 ${
                stage === 0
                  ? "w-0 translate-y-4 scale-75 opacity-0"
                  : "translate-y-0 -rotate-3 scale-100 opacity-100"
              }`}
            />
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              AI Debate
            </h1>
          </div>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            Submit a topic. Two speakers will present a formal argument and rebuttal, spoken aloud.
          </p>
        </header>

        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-border/40">
          <img
            src={image}
            alt="Two speakers facing each other on a debate stage"
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
          <form onSubmit={start} className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-end">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Remote work is more productive than office work"
              className="flex-1 rounded-xl border border-input bg-card px-5 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
            />
            <div className="relative">
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-[calc(100%-14px)] left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-primary/15 blur-xl transition-opacity duration-500 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              />
              <img
                src={bishtAsset.url}
                alt="Traditional bisht cloak resting on the start button"
                className={`pointer-events-none absolute bottom-[calc(100%-8px)] left-1/2 h-20 w-auto origin-bottom -translate-x-1/2 [filter:drop-shadow(0_8px_12px_rgb(0_0_0/0.5))] transition-all duration-500 ease-out md:h-24 ${
                  loading ? "-translate-y-10 rotate-3 scale-90 opacity-0" : "opacity-100"
                }`}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="w-full rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Preparing…" : "Start debate"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {stage === 1
                ? speaking
                  ? "First speaker is presenting the argument…"
                  : "Rebuttal coming up…"
                : speaking
                  ? "Second speaker is delivering the rebuttal…"
                  : "Debate concluded."}
            </p>
            <button
              onClick={reset}
              className="rounded-xl border border-border bg-card px-8 py-3 text-base font-medium text-card-foreground transition-colors hover:bg-secondary"
            >
              New topic
            </button>
          </div>
        )}

        {error && <p className="mt-5 text-center text-sm text-destructive">{error}</p>}
      </div>
    </main>
  );
}
