import { createFileRoute } from "@tanstack/react-router";
import scene from "@/assets/scene-both.jpg";
import { SceneLayout } from "@/components/SceneLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وجهاً لوجه — الواجهة الأولى" },
      { name: "description", content: "رجلان بالثوب الأبيض والشماغ الأحمر يقفان قدام بعض بإضاءة متساوية." },
      { property: "og:title", content: "وجهاً لوجه — الواجهة الأولى" },
      { property: "og:description", content: "رجلان بالثوب الأبيض والشماغ الأحمر يقفان قدام بعض بإضاءة متساوية." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SceneLayout
      eager
      image={scene}
      title="وجهاً لوجه"
      caption="اثنان واقفان قدام بعض، ثوب أبيض وشماغ أحمر وعقال، والإضاءة متساوية على الاثنين."
    />
  );
}
