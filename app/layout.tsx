import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import MarketingTags from "@/components/MarketingTags";
import { prisma } from "@/lib/prisma";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Espaco Vida Saudavel NISI",
  description: "Shakes, bebidas funcionais e opcoes proteicas para uma rotina mais leve.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let brandColor: string | null = null;
  // Avoid crashing builds/prerender when DATABASE_URL isn't configured (e.g., CI/build-only).
  if (process.env.DATABASE_URL) {
    try {
      const restaurant = await prisma.restaurant.findFirst({
        select: { primaryColor: true },
      });
      brandColor = restaurant?.primaryColor ?? null;
    } catch {
      brandColor = null;
    }
  }

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider brandColor={brandColor}>
          <CartProvider>
            <MarketingTags />
            <AnalyticsTracker />
            {children}
            <CartSidebar />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
