import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeGuard AI — Predict Problems. Prevent Costs.",
  description: "AI-powered preventive household intelligence platform. Monitor, learn, detect, predict, explain, and prevent household issues.",
  keywords: "smart home, AI, electricity prediction, appliance health, energy monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
