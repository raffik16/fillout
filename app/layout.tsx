import type { Metadata } from "next";
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
  title: "WeatherBar - Drinks for Every Forecast",
  description: "Discover the perfect drink based on your local weather. From refreshing cocktails on hot days to warming spirits on cold nights.",
  keywords: "weather, drinks, cocktails, beer, wine, recommendations, bartender",
  authors: [{ name: "WeatherBar Team" }],
  openGraph: {
    title: "WeatherBar - Drinks for Every Forecast",
    description: "Discover the perfect drink based on your local weather.",
    type: "website",
  },
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
