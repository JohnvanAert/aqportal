import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aqparat.com.kz — Главные новости Казахстана и мира",
  description: "Информационный портал Aqparat.com.kz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}