import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "drinkjoy.app - Curated Drinks with Recipes & Shopping",
  description: "Find your perfect drink match. Explore curated cocktails, beers, and wines with detailed recipes and shopping links for every occasion.",
  keywords: "drinks, cocktails, beer, wine, recipes, shopping, recommendations, perfect drink, bartender, mixology",
  authors: [{ name: "drinkjoy.app Team" }],
  alternates: {
    canonical: "https://www.drinkjoy.app",
  },
  openGraph: {
    title: "drinkjoy.app - Curated Drinks with Recipes & Shopping",
    description: "Find your perfect drink match with detailed recipes and shopping links.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DrinkJoy",
  },
  other: {
    "google-site-verification": "CUmUB5IiLmsWNTMzNNs-WOhytVbT_fz7HuEZHG5I65U",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "DrinkJoy",
    "msapplication-TileColor": "#f97316",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
