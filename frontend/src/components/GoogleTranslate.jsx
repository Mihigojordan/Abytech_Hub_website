import { useEffect } from "react";

export default function GoogleTranslate() {
  useEffect(() => {
    // Define the callback function that Google expects
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "rw,es,fr,de,zh-CN",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Dynamically load the Google Translate script
    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    // Add CSS to hide the banner
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        top: 0 !important;
        position: static !important;
      }
      
      .goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
      }
      
      iframe.skiptranslate {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
      }
      
      .goog-logo-link,
      .goog-te-gadget span {
        display: none !important;
      }
      
      .goog-te-gadget {
        color: transparent !important;
      }
      
      #goog-gt-tt, .goog-te-balloon-frame {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Continuously check and hide the banner
    const interval = setInterval(() => {
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
      }
      
      document.body.style.top = '0';
      document.body.style.position = 'static';
      
      const iframes = document.querySelectorAll('iframe.skiptranslate');
      iframes.forEach(iframe => {
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
      });
    }, 100);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div id="google_translate_element" style={{ display: "inline-block" }}></div>
  );
}