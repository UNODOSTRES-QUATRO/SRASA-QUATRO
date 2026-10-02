import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Project Quatro — A Cozy Narrative Driving & Exploration Experience",
  description:
    "Project Quatro: A warm, low-cortisol narrative driving adventure with retro-voxel aesthetics, pocket car puzzles, and contemplative spaces.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Project Quatro — A Cozy Narrative Driving Experience",
    description:
      "A small, warm world where something strange is happening — and the player is allowed to simply be there.",
    url: "/",
    siteName: "Project Quatro",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Project Quatro Semicolon Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Quatro — A Cozy Narrative Driving Experience",
    description:
      "A small, warm world where something strange is happening — and the player is allowed to simply be there.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-quatro-navy text-quatro-cream min-h-screen w-screen overflow-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-quatro-amber focus:text-quatro-navy focus:rounded focus:font-mono text-xs"
        >
          Skip to main content
        </a>
        <div id="main-content" className="w-full h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
