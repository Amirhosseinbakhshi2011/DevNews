import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevNews | اخبار برنامه‌نویسی",
  description: "جمع‌آوری اخبار و مقالات برنامه‌نویسی از Hacker News، Dev.to و Reddit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}