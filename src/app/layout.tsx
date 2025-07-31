import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "Cku Trading | Trading Alerts",
  description: "Binance Usdt trading pairs",
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
        <Toaster
          toastOptions={{
            style: {
              background: "#1b1f27",
              color: "#fff",
              border: "1px solid #333",
            },
            className: "rounded-md shadow",
          }}
          position="top-center"
        />
      </body>
    </html>
  );
}
