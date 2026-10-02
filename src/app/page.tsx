import dynamic from "next/dynamic";

const ProjectQuatroApp = dynamic(
  () => import("@/components/game/ProjectQuatroApp"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-quatro-navy">
      <ProjectQuatroApp />
    </main>
  );
}
