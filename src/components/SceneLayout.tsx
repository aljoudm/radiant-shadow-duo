import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "الواجهة الأولى" },
  { to: "/scene-2", label: "الواجهة الثانية" },
  { to: "/scene-3", label: "الواجهة الثالثة" },
] as const;

export function SceneLayout({
  image,
  title,
  caption,
  eager,
  children,
}: {
  image: string;
  title: string;
  caption: string;
  eager?: boolean;
  children?: ReactNode;
}) {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-background">
      <img
        src={image}
        alt={caption}
        width={1280}
        height={832}
        {...(eager ? {} : { loading: "lazy" as const })}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between p-6 md:p-12">
        <nav className="flex flex-wrap gap-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground data-[status=active]:border-accent data-[status=active]:text-accent-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">{caption}</p>
          {children}
        </div>
      </div>
    </main>
  );
}
