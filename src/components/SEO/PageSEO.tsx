import React from 'react';
import SEOHead from './SEOHead';
import { PishattoOrganizationData, PishattoWebSiteData } from './StructuredData';

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object;
}

// Landing Page SEO
export const LandingPageSEO: React.FC<PageSEOProps> = (props) => (
  <>
    <SEOHead
      title="Pishatto - 業界最高水準のメンズエステシャンが登録"
      description="ピシャッと素敵な空間をご提供。審査通過率10%以下の超難関を突破したメンズエステシャンが24/365でお待ちしています。タイ古式マッサージ、バリ風オイルマッサージ、ロミロミマッサージなど、シーンに合わせてご利用ください。"
      keywords="メンズエステ, マッサージ, タイ古式, バリ風オイル, ロミロミ, 出張エステ, 24時間, 審査通過率10%, ピシャット, pishatto"
      image="/hero.webp"
      url="/welcome"
      type="website"
      {...props}
    />
    <PishattoOrganizationData />
    <PishattoWebSiteData />
  </>
);

// Role Select Page SEO
export const RoleSelectPageSEO: React.FC<PageSEOProps> = (props) => (
  <>
    <SEOHead
      title="Pishatto - ゲストまたはキャストとして始める"
      description="Pishattoでゲストとして利用するか、キャストとして登録するかを選択してください。業界最高水準のメンズエステシャンとの出会いをお約束します。"
      keywords="ピシャット, ゲスト, キャスト, メンズエステ, 出張, マッサージ, 登録, 選択"
      image="/hero.webp"
      url="/"
      type="website"
      {...props}
    />
    <PishattoOrganizationData />
  </>
);

// Cast Detail Page SEO
export const CastDetailPageSEO: React.FC<{ castName: string; castDescription?: string } & PageSEOProps> = ({ 
  castName, 
  castDescription, 
  ...props 
}) => (
  <>
    <SEOHead
      title={`${castName} - メンズエステシャン | Pishatto`}
      description={castDescription || `${castName}のプロフィールをご覧ください。審査通過率10%以下の超難関を突破したメンズエステシャンです。指名でお呼びいただけます。`}
      keywords={`${castName}, メンズエステシャン, 指名, 出張, マッサージ, ピシャット, pishatto`}
      image="/hero.webp"
      type="profile"
      {...props}
    />
    <PishattoOrganizationData />
  </>
);

// Legal Pages SEO
export const LegalPageSEO: React.FC<{ pageType: 'terms' | 'privacy' | 'commercial' } & PageSEOProps> = ({ 
  pageType, 
  ...props 
}) => {
  const pageData = {
    terms: {
      title: "利用規約 | Pishatto",
      description: "Pishattoの利用規約をご確認ください。プラットフォームのルール、ユーザーの責任、サービス条件について説明しています。",
      keywords: "利用規約, サービス, 法的, ピシャット, 条件, ルール"
    },
    privacy: {
      title: "プライバシーポリシー | Pishatto",
      description: "Pishattoがどのようにあなたのプライバシーを保護するかをご確認ください。包括的なプライバシーポリシーとデータ保護対策について説明しています。",
      keywords: "プライバシー, ポリシー, データ, 保護, ピシャット, セキュリティ"
    },
    commercial: {
      title: "特定商取引法に基づく表記 | Pishatto",
      description: "Pishattoの特定商取引法に基づく表記。ビジネス慣行と商業ポリシーについて説明しています。",
      keywords: "特定商取引, 取引, ビジネス, ピシャット, 商取引法"
    }
  };

  const data = pageData[pageType];

  return (
    <>
      <SEOHead
        title={data.title}
        description={data.description}
        keywords={data.keywords}
        url={`/legal/${pageType === 'commercial' ? 'specified-commercial' : pageType}`}
        type="article"
        {...props}
      />
      <PishattoOrganizationData />
    </>
  );
};

// Dashboard SEO (for authenticated users)
export const DashboardSEO: React.FC<{ userType: 'guest' | 'cast' } & PageSEOProps> = ({ 
  userType, 
  ...props 
}) => (
  <>
    <SEOHead
      title={`${userType === 'guest' ? 'ゲスト' : 'キャスト'}ダッシュボード | Pishatto`}
      description={`Pishattoの${userType === 'guest' ? 'ゲスト' : 'キャスト'}ダッシュボードにアクセスしてください。プロフィール、予約、エンターテイメント体験を管理できます。`}
      keywords={`${userType === 'guest' ? 'ゲスト' : 'キャスト'}, ダッシュボード, プロフィール, 管理, ピシャット`}
      noindex={true}
      nofollow={true}
      {...props}
    />
  </>
);

// Registration Pages SEO
export const RegistrationPageSEO: React.FC<{ pageType: 'guest' | 'cast' } & PageSEOProps> = ({ 
  pageType, 
  ...props 
}) => (
  <>
    <SEOHead
      title={`${pageType === 'guest' ? 'ゲスト' : 'キャスト'}登録 | Pishatto`}
      description={`Pishattoに${pageType === 'guest' ? 'ゲスト' : 'キャスト'}として参加してください。登録を完了し、業界最高水準のメンズエステシャンプラットフォームでの旅を始めましょう。`}
      keywords={`${pageType === 'guest' ? 'ゲスト' : 'キャスト'}, 登録, 参加, サインアップ, ピシャット, メンズエステ`}
      url={`/${pageType === 'guest' ? 'register' : 'cast/register'}`}
      type="website"
      {...props}
    />
    <PishattoOrganizationData />
  </>
);

// Login Pages SEO
export const LoginPageSEO: React.FC<{ pageType: 'cast' | 'line' } & PageSEOProps> = ({ 
  pageType, 
  ...props 
}) => (
  <>
    <SEOHead
      title={`${pageType === 'cast' ? 'キャスト' : 'LINE'}ログイン | Pishatto`}
      description={`Pishattoの${pageType === 'cast' ? 'キャスト' : 'LINE'}アカウントにサインインしてください。ダッシュボードにアクセスし、エンターテイメント体験を管理できます。`}
      keywords={`${pageType === 'cast' ? 'キャスト' : 'LINE'}, ログイン, サインイン, アカウント, ピシャット, ダッシュボード`}
      url={`/${pageType === 'cast' ? 'cast/login' : 'line-login'}`}
      type="website"
      {...props}
    />
    <PishattoOrganizationData />
  </>
);
