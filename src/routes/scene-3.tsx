import { createFileRoute } from "@tanstack/react-router";
import scene from "@/assets/scene-right.jpg";
import { SceneLayout } from "@/components/SceneLayout";

export const Route = createFileRoute("/scene-3")({
  head: () => ({
    meta: [
      { title: "الضوء على الثاني — الواجهة الثالثة" },
      { name: "description", content: "الرجل الثاني منوّر بالضوء، والأول والخلفية في الظل." },
      { property: "og:title", content: "الضوء على الثاني — الواجهة الثالثة" },
      { property: "og:description", content: "الرجل الثاني منوّر بالضوء، والأول والخلفية في الظل." },
    ],
  }),
  component: Scene3,
});

function Scene3() {
  return (
    <SceneLayout
      image={scene}
      title="الضوء على الثاني"
      caption="الرجل الثاني منوّر، والأول والخلفية عليهم ظل."
    />
  );
}
