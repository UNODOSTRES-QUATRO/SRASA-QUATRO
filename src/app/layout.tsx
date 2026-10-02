import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Quatro — A Cozy Narrative Driving Experience",
  description: "A small, warm world where something strange is happening — and the player is allowed to simply be there.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-quatro-navy text-quatro-cream min-h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
