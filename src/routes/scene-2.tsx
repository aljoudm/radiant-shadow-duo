import { createFileRoute } from "@tanstack/react-router";
import scene from "@/assets/scene-left.jpg";
import { SceneLayout } from "@/components/SceneLayout";

export const Route = createFileRoute("/scene-2")({
  head: () => ({
    meta: [
      { title: "الضوء على الأول — الواجهة الثانية" },
      { name: "description", content: "الرجل الأول منوّر بالضوء، والرجل الثاني والخلفية في الظل." },
      { property: "og:title", content: "الضوء على الأول — الواجهة الثانية" },
      { property: "og:description", content: "الرجل الأول منوّر بالضوء، والرجل الثاني والخلفية في الظل." },
    ],
  }),
  component: Scene2,
});

function Scene2() {
  return (
    <SceneLayout
      image={scene}
      title="الضوء على الأول"
      caption="الرجل الأول منوّر، والثاني والخلفية غارقين في الظل."
    />
  );
}
