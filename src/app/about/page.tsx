import Link from "next/link";

export const metadata = {
  title: "About — Project Quatro",
  description: "Learn about Project Quatro, the philosophy of The Semicolon, and the development vision.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-quatro-navy text-quatro-cream p-8 font-sans max-w-3xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-quatro-amber hover:underline font-mono text-sm">
          ← Return to Game
        </Link>
      </nav>

      <h1 className="text-3xl font-serif font-bold text-quatro-cream mb-4">About Project Quatro</h1>
      
      <p className="text-quatro-cream/90 leading-relaxed mb-4 text-base italic border-l-2 border-quatro-amber/60 pl-4 py-1 bg-quatro-slate/20 rounded-r-lg">
        “Sebuah game eksplorasi naratif low-cortisol yang memadukan kenyamanan berkendara mobil Quatro dengan teka-teki point-and-click di dimensi voxel yang hangat. Pemain diajak mengamati pergeseran realitas secara perlahan, menyusutkan mobil menjadi ukuran saku untuk memecahkan misteri kastil kuno tanpa tekanan waktu. Sentuhan visual bergaya Animal Crossing dan soundscape akustik yang menenangkan menghadirkan ruang hening dan pemulihan bagi pikiran.”
      </p>

      <p className="text-quatro-cream/80 leading-relaxed mb-4">
        Project Quatro is an exploratory narrative driving experience built around the philosophy of <em>The Semicolon</em>:
        a deliberate pause before continuing. In this game, movement, curiosity, and calm coexist in a warm retro-voxel world.
      </p>

      <h2 className="text-xl font-bold text-quatro-cream mt-6 mb-2">Core Principles</h2>
      <ul className="list-disc pl-5 space-y-2 text-quatro-cream/80">
        <li><strong>Exploration Over Pressure:</strong> No timers, no chase mechanics, and low cortisol.</li>
        <li><strong>Physical Satisfaction:</strong> Driving feels weighted, responsive, and tactile.</li>
        <li><strong>Mystery Without Horror:</strong> Atmospheric anomalies that invite wonder rather than fear.</li>
      </ul>

      <footer className="mt-12 pt-6 border-t border-quatro-cream/10 text-xs text-quatro-cream/50 flex justify-between">
        <span>Project Quatro © 2026</span>
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
      </footer>
    </main>
  );
}
