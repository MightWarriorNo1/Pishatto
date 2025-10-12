import React from 'react';
import { Helmet } from 'react-helmet-async';

interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType: string;
  };
  sameAs?: string[];
}

interface WebSiteData {
  name: string;
  url: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

interface ServiceData {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  areaServed?: string;
  serviceType?: string;
}

interface PersonData {
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const OrganizationStructuredData: React.FC<OrganizationData> = ({
  name,
  url,
  logo,
  description,
  contactPoint,
  sameAs
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    ...(contactPoint && { contactPoint }),
    ...(sameAs && { sameAs })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const WebSiteStructuredData: React.FC<WebSiteData> = ({
  name,
  url,
  potentialAction
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(potentialAction && { potentialAction })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const ServiceStructuredData: React.FC<ServiceData> = ({
  name,
  description,
  provider,
  areaServed,
  serviceType
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider,
    ...(areaServed && { areaServed }),
    ...(serviceType && { serviceType })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const PersonStructuredData: React.FC<PersonData> = ({
  name,
  jobTitle,
  description,
  image,
  url
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(jobTitle && { jobTitle }),
    ...(description && { description }),
    ...(image && { image }),
    ...(url && { url })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

// Default structured data for Pishatto
export const PishattoOrganizationData: React.FC = () => (
  <OrganizationStructuredData
    name="Pishatto"
    url="https://pishatto.jp"
    logo="https://pishatto.jp/favicon-guest.png"
    description="業界最高水準のメンズエステシャンが登録。審査通過率10%以下の超難関を突破したメンズエステシャンが24/365でお待ちしています。タイ古式マッサージ、バリ風オイルマッサージ、ロミロミマッサージなど、シーンに合わせてご利用ください。"
    contactPoint={{
      contactType: "customer service"
    }}
    sameAs={[
      "https://twitter.com/pishatto",
      "https://instagram.com/pishatto"
    ]}
  />
);

export const PishattoWebSiteData: React.FC = () => (
  <WebSiteStructuredData
    name="Pishatto"
    url="https://pishatto.jp"
    potentialAction={{
      target: "https://pishatto.jp/search?q={search_term_string}",
      queryInput: "required name=search_term_string"
    }}
  />
);
