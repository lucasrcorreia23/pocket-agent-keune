import type { Metadata } from "next";
import { Inter, Raleway } from "next/font/google";
import "./globals.css";
import { PageTransition } from "./components/page-transition";
import { DiamondWrapper } from "./components/diamond-wrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Perfecting Voice Agent",
  description: "Converse com nosso agente de voz inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className={`${inter.variable} ${raleway.variable} antialiased`}>
        <div className="relative min-h-screen">
          <div className="absolute inset-0 z-0">
            <DiamondWrapper />
          </div>
          <div className="relative z-10 min-h-screen">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
      </body>
    </html>
  );
}
