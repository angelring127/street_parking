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
  title: "Vancouver 스트리트 파킹 가격 정보",
  description:
    "Vancouver 시의 거리 주차 미터 가격 정보를 지도와 리스트로 확인하세요. 현재 위치 기반 검색, 필터링, 정렬 기능 제공.",
  keywords: [
    "Vancouver",
    "parking",
    "street parking",
    "주차",
    "밴쿠버",
    "주차 요금",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
