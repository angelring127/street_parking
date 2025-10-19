"use client";

import { useEffect } from "react";

interface AdBannerProps {
  dataAdSlot?: string;
  dataAdFormat?: string;
  className?: string;
}

/**
 * Google AdSense 広告バナーコンポーネント
 * MVPではプレイスホルダー、後で実際のAdSenseコードに置き換え
 */
export default function AdBanner({
  dataAdSlot: _dataAdSlot,
  dataAdFormat: _dataAdFormat = "auto",
  className = "",
}: AdBannerProps) {
  useEffect(() => {
    // Google AdSense 스크립트가 로드되면 광고 초기화
    // MVP에서는 비활성화
    /*
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
    */
  }, []);

  return (
    <div className={`ad-banner-container ${className}`}>
      {/* MVP: プレイスホルダー広告 */}
      <div className="bg-gray-200 border-2 border-dashed border-gray-400 p-8 text-center rounded-lg">
        <p className="text-gray-600 font-medium">광고 영역</p>
        <p className="text-sm text-gray-500 mt-2">
          향후 Google AdSense 광고가 표시됩니다
        </p>
      </div>

      {/* 실제 사용 시 아래 주석 해제 */}
      {/*
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // 여기에 실제 AdSense 클라이언트 ID 입력
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive="true"
      ></ins>
      */}
    </div>
  );
}
