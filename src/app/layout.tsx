import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Hub",
  description: "Alimentación complementaria, sin complicarse la vida.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-white text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50">
        {children}
      </body>
    </html>
  );
}
