import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bosque de Restauración",
  description:
    "Reprograma lo que se grabó en el subconsciente: verdades, calma, cuerpo y propósito — un día a la vez. Práctica diaria, no un chat.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Bosque",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Bosque de Restauración",
    description:
      "El poder de la repetición para reescribir la mente. Protocolo de pánico, verdades, ancla y rutina.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#071a12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
