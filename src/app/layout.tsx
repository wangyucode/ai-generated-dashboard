import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import logo from "../../public/logo.png";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AI Generated Dashboard",
  description:
    "Transforms raw database data into valuable data visualization dashboards through an intelligent, AI-driven workflow.",
  icons: {
    icon: logo.src,
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
        className={`${notoSansSC.variable} antialiased min-h-screen bg-zinc-50`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
