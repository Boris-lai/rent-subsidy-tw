import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_TC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Noto Sans TC：中文字型主要選擇
// preload: false 避免一次載入巨大的中文字檔
const notoSansTc = Noto_Sans_TC({
  variable: '--font-noto-tc',
  weight: ['400', '500', '600', '700'],
  preload: false,
});

export const metadata: Metadata = {
  title: '租金補貼計算機 — 2026 年 300 億方案 30 秒試算',
  description:
    '依內政部 2026 年最新規則，免註冊、免登入，30 秒算出你能領多少租金補貼。涵蓋 22 縣市、新婚與育兒加碼。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansTc.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
