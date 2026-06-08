import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { SettingsProvider } from "@/app/context/SettingsContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-var",
  weight: ["400", "700", "900"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-var",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "NanaFood — Authentic African Cuisine in Denver",
  description: "Order authentic Ivorian and West African food delivered to your door in Denver, CO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable}`}>
        <SettingsProvider>
          <CartProvider>{children}</CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}