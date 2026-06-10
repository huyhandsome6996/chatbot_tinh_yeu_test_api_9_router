import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tình Yêu AI - Chatbot Tư Vấn Tình Yêu 💕",
  description: "Chatbot tư vấn tình yêu thông minh, sử dụng 9Router API. Lắng nghe và chia sẻ mọi tâm sự tình cảm.",
  keywords: ["tình yêu", "chatbot", "tư vấn", "9Router", "AI", "tình cảm"],
  authors: [{ name: "Tình Yêu AI" }],
  icons: {
    // icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Tình Yêu AI 💕",
    description: "Chatbot tư vấn tình yêu thông minh",
    url: "https://tinh-yeu-ai.app",
    siteName: "Tình Yêu AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tình Yêu AI 💕",
    description: "Chatbot tư vấn tình yêu thông minh",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
