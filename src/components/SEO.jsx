import { Helmet } from "react-helmet-async";

const SITE_URL = "https://aryan-kaushik-portfolio.vercel.app";
const DEFAULT_KEYWORDS =
  "Aryan Kaushik, Aryan Kaushik portfolio, Aryan Kaushik developer, Aryan Kaushik full stack developer, Aryan Kaushik MERN developer, Aryan Kaushik React developer, Aryan Kaushik CEH, Aryan Kaushik ethical hacker";

export default function SEO({ title, description, path = "/", keywords }) {
  const fullTitle = title
    ? `${title} — Aryan Kaushik`
    : "Aryan Kaushik — Full-Stack Developer & CEH | Portfolio";
  const url = `${SITE_URL}${path}`;
  const image = `${SITE_URL}/og-image.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
