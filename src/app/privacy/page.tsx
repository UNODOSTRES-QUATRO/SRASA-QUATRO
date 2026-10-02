import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Project Quatro",
  description: "Privacy policy and data retention details for Project Quatro.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-quatro-navy text-quatro-cream p-8 font-sans max-w-3xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-quatro-amber hover:underline font-mono text-sm">
          ← Return to Game
        </Link>
      </nav>

      <h1 className="text-3xl font-serif font-bold text-quatro-cream mb-4">Privacy Policy</h1>
      
      <p className="text-quatro-cream/80 leading-relaxed mb-4">
        Project Quatro prioritizes privacy. We do not track, sell, or collect personal advertising data.
      </p>

      <h2 className="text-xl font-bold text-quatro-cream mt-6 mb-2">Data Storage</h2>
      <p className="text-quatro-cream/80 leading-relaxed mb-4">
        Player progress and vehicle states are stored locally in the browser or via authenticated Supabase sessions.
        No third-party advertising trackers or unauthorized tracking cookies are utilized.
      </p>

      <footer className="mt-12 pt-6 border-t border-quatro-cream/10 text-xs text-quatro-cream/50 flex justify-between">
        <span>Project Quatro © 2026</span>
        <Link href="/about" className="hover:underline">
          About
        </Link>
      </footer>
    </main>
  );
}
