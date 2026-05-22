"use client";

import { useEffect } from "react";

interface AdBannerProps {
  dataAdSlot?: string;
  dataAdFormat?: string;
  className?: string;
}

// Google AdSense の型定義
interface WindowWithAdSense extends Window {
  adsbygoogle?: unknown[];
}

/**
 * Google AdSense 広告バナーコンポーネント
 */
export default function AdBanner({
  dataAdSlot,
  dataAdFormat = "auto",
  className = "",
}: AdBannerProps) {
  useEffect(() => {
    // Google AdSense 스크립트가 로드되면 광고 초기화
    try {
      if (typeof window !== "undefined") {
        const windowWithAdSense = window as WindowWithAdSense;
        if (windowWithAdSense.adsbygoogle) {
          (windowWithAdSense.adsbygoogle =
            windowWithAdSense.adsbygoogle || []).push({});
        }
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-banner-container ${className}`}>
      {dataAdSlot ? (
        // 実際のAdSense広告ユニット
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-5555878466921311"
          data-ad-slot={dataAdSlot}
          data-ad-format={dataAdFormat}
          data-full-width-responsive="true"
        ></ins>
      ) : (
        // 自動広告の場合はプレイスホルダー
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-5555878466921311"
          data-ad-format={dataAdFormat}
          data-full-width-responsive="true"
        ></ins>
      )}
    </div>
  );
}
