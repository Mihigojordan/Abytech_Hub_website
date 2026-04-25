import { useTheme } from "../context/ThemeContext";
import { GLOBAL_CSS } from "../utils/homeConstants";

import Hero from "../components/home/Hero";
import Partners from "../components/home/Partners";
import About from "../components/home/About";
import Services from "../components/home/Services";
import Quote from "../components/home/Quote";
import Solutions from "../components/home/Solutions";
import Process from "../components/home/Process";
import Workshop from "../components/home/Workshop";
import Testimonials from "../components/home/Testimonials";
import NewsSection from "../components/home/NewsSection";
import Hire from "../components/home/Hire";
import CTA from "../components/home/CTA";

export default function AbyTechHome() {
  const { isDark } = useTheme();

  return (
    <>

      <div style={{
        fontFamily: "'Barlow',sans-serif",
        background: isDark ? "#071418" : "#f5efe6",
        color: isDark ? "#fff" : "#071418",
        transition: "background .35s, color .35s",
        overflowX: "hidden",
      }}>
        <Hero />
        <Partners />
        <About />
        <Services />
        <Quote />
        <Solutions />
        <Process />
        <Workshop />
        <Testimonials />
        <NewsSection />
        <Hire />
        <CTA />
      </div>
    </>
  );
}