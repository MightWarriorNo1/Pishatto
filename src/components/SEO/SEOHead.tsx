import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  structuredData?: object;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Pishatto - 業界最高水準のメンズエステシャンが登録",
  description = "ピシャッと素敵な空間をご提供。審査通過率10%以下の超難関を突破したメンズエステシャンが24/365でお待ちしています。タイ古式マッサージ、バリ風オイルマッサージ、ロミロミマッサージなど、シーンに合わせてご利用ください。",
  keywords = "メンズエステ, マッサージ, タイ古式, バリ風オイル, ロミロミ, 出張エステ, 24時間, 審査通過率10%, ピシャット, pishatto",
  image = "/hero.webp",
  url = "https://pishatto.jp",
  type = "website",
  siteName = "Pishatto",
  structuredData,
  canonicalUrl,
  noindex = false,
  nofollow = false
}) => {
  const fullTitle = title.includes("Pishatto") ? title : `${title} | Pishatto`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  const fullUrl = url.startsWith('http') ? url : `https://pishatto.jp${url}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Pishatto" />
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Pishatto" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
