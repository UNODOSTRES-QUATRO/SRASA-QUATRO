"use client";

import dynamic from "next/dynamic";

const ProjectQuatroApp = dynamic(
  () => import("@/components/game/ProjectQuatroApp"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center w-full h-full bg-quatro-navy text-quatro-cream font-mono">
        <div className="text-quatro-amber text-2xl animate-pulse mb-2">;</div>
        <div className="text-xs text-quatro-cream/60 tracking-widest uppercase">
          Warming up engine...
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-quatro-navy">
      <ProjectQuatroApp />
      <footer className="sr-only">
        <nav aria-label="Quick links">
          <a href="/about">About Project Quatro</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
      </footer>
    </main>
  );
}
