import { RouterProvider } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GLOBAL_CSS } from "./utils/homeConstants";
import router from "./routes";

function App() {
  return (
    <>
      <Helmet>
        {/* ================= BASIC SEO ================= */}
        <title>Abytech Hub | Software Development & IT Solutions</title>
        <meta
          name="description"
          content="Abytech Hub is a technology company offering software development, web apps, mobile apps, and IT solutions for businesses worldwide."
        />
        <meta
          name="keywords"
          content="Abytech Hub, software company, web development, mobile app development, IT services, SaaS, cloud solutions, tech startup"
        />
        <meta name="author" content="Abytech Hub" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* ================= TECHNICAL ================= */}
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.abytechhub.com/" />

        {/* ================= SITE VERIFICATION ================= */}
        <meta name="google-site-verification" content="-LMjiH9KxsBHfNQlrwQ_74lrOnEhnoo20txjfX8Q-YM" />
        <meta name="msvalidate.01" content="46612E2DF0D2FF38E493BF6AF1D32223" />
        <meta name="yandex-verification" content="f1047e0f1c4393af" />

        {/* ================= OPEN GRAPH ================= */}
        <meta property="og:site_name" content="Abytech Hub" />
        <meta property="og:title" content="Abytech Hub | Software Development & IT Solutions" />
        <meta
          property="og:description"
          content="We design and build scalable software solutions that help businesses grow."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.abytechhub.com/" />
        <meta property="og:image" content="https://www.abytechhub.com/assets/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* ================= TWITTER ================= */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@abytechhub" />
        <meta name="twitter:creator" content="@abytechhub" />
        <meta name="twitter:title" content="Abytech Hub | Software Development & IT Solutions" />
        <meta
          name="twitter:description"
          content="Innovative software, web, and mobile solutions by Abytech Hub."
        />
        <meta name="twitter:image" content="https://www.abytechhub.com/assets/og-image.png" />

        {/* ================= MOBILE & UI ================= */}
        <meta name="theme-color" content="#0d6efd" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Abytech Hub" />

        {/* ================= ICONS ================= */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ================= SECURITY ================= */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <script type="application/ld+json">{`
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Abytech Hub",
  "url": "https://www.abytechhub.com/",
  "logo": "https://www.abytechhub.com/assets/og-image.png",
  "sameAs": [
    "https://www.linkedin.com/company/abytechhub",
    "https://twitter.com/abytechhub",
    "https://www.facebook.com/abytechhub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "Customer Service"
  }
}
`}</script>
        <link rel="alternate" href="https://www.abytechhub.com/" hrefLang="en-us" />
      </Helmet>

      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
