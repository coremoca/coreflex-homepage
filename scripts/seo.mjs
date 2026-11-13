/** Search metadata only: visible page content and styling are unchanged. */
const origin = "https://www.crflx.com";
const descriptions = {
  "index.html": ["코어플렉스는 금융솔루션과 고객경험 솔루션을 제공합니다. 국내외 금융기관 프로젝트 실적, 회사소개와 채용 정보를 확인하세요.", "Coreflex delivers financial technology and customer experience solutions. Explore our company, domestic and international projects, and careers."],
  "company.html": ["코어플렉스의 금융 업무 전문성, 개발 경험, 기술력과 플랫폼 지원 역량을 소개합니다.", "Discover Coreflex's financial expertise, development experience, technology and platform capabilities."],
  "financial-solutions.html": ["코어플렉스의 해외주식, 외화채권, 외화RP 등 금융솔루션과 금융 시스템 구축 역량을 소개합니다.", "Explore Coreflex financial solutions, including overseas equities, foreign-currency bonds and foreign-currency repo systems."],
  "customer-experience.html": ["코어플렉스의 Medallia 고객경험 솔루션을 소개합니다. 고객의 의견을 분석하고 서비스 개선으로 연결하는 방법을 확인하세요.", "Explore Coreflex's Medallia customer experience solutions for analyzing customer feedback and improving service."],
  "client-projects.html": ["코어플렉스의 국내외 고객사별 금융 시스템 납품 및 구축 실적을 확인하세요.", "Browse Coreflex's financial system delivery and implementation projects by domestic and international client."],
  "yearly-projects.html": ["코어플렉스의 금융 시스템 구축 및 납품 실적을 연도별로 확인하세요.", "Explore Coreflex's financial system implementation and delivery project history by year."],
  "careers.html": ["코어플렉스의 채용분야, 지원방법과 복지제도를 확인하고 금융 기술의 미래를 함께 만들어 가세요.", "Explore career opportunities, application information and employee benefits at Coreflex."],
  "contact.html": ["코어플렉스의 연락처와 오시는 길을 확인하세요. 금융솔루션 및 고객경험 솔루션 관련 문의를 안내합니다.", "Contact Coreflex for financial technology and customer experience solutions. Find our contact details and office location."],
};
const escape = (text) => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const canonicalUrl = (file, lang) => `${origin}/${lang === "en" ? "en/" : ""}${file === "index.html" ? "" : file}`;
export function seoHead(file, lang, fallbackTitle) {
  if (!descriptions[file]) throw new Error(`Missing SEO description: ${file}`);
  const description = descriptions[file][lang === "en" ? 1 : 0];
  const title = file === "index.html"
    ? (lang === "ko" ? "코어플렉스 COREFLEX | 금융솔루션·고객경험 솔루션" : "COREFLEX | Financial Technology & Customer Experience Solutions")
    : `${fallbackTitle} | ${lang === "ko" ? "코어플렉스 COREFLEX" : "COREFLEX"}`;
  const organization = {
    "@context": "https://schema.org", "@type": "Organization",
    "@id": `${origin}/#organization`, name: "코어플렉스", alternateName: "COREFLEX",
    legalName: "주식회사 코어플렉스", url: `${origin}/`,
    logo: `${origin}/assets/brand/coreflex-wordmark.svg`,
    email: "admin@crflx.com", telephone: "+82-2-782-3960",
    address: { "@type": "PostalAddress", addressCountry: "KR", addressRegion: "서울특별시", addressLocality: "영등포구", streetAddress: "경인로 775, 1-613(문래동3가, 에이스하이테크시티)" }
  };
  const openGraph = `<meta property="og:type" content="website"><meta property="og:site_name" content="COREFLEX"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonicalUrl(file, lang)}"><meta property="og:locale" content="${lang === "en" ? "en_US" : "ko_KR"}"><meta property="og:locale:alternate" content="${lang === "en" ? "ko_KR" : "en_US"}"><meta name="twitter:card" content="summary">`;
  return `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${canonicalUrl(file, lang)}">` + openGraph +
    ["ko", "en", "x-default"].map(language => `<link rel="alternate" hreflang="${language}" href="${canonicalUrl(file, language === "en" ? "en" : "ko")}">`).join("") +
    (file === "index.html" ? `<script type="application/ld+json">${JSON.stringify(organization).replace(/</g, "\\u003c")}</script>` : "");
}
export const robots = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
export function sitemap(files) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ["ko", "en"].flatMap(lang => files.map(file => `  <url><loc>${canonicalUrl(file, lang)}</loc></url>`)).join("\n") + '\n</urlset>\n';
}
