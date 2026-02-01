import React, { useRef, useEffect } from "react";
import { ArrowRight, Sparkles, Code, Zap } from "lucide-react";
import banner1 from "../../assets/banners/banner-img1.png";
import banner2 from "../../assets/banners/banner-img3.png";
import banner3 from "../../assets/banners/main-pic1.png"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      tag: "ACCELERATED GROWTH",
      title: "Empowering business with modern rules and insights",
      description: "Welcome to Lerony—business consulting and software solutions accelerating African enterprises where success is not just a destination.",
      buttonText: "Let's talk to our team",
      buttonPath: "/contact-us",
      image: banner1,
      icon: Sparkles,
    },
    {
      tag: "IT TRAINING & EDUCATION",
      title: "Empowering Local Talent Through Education",
      description: "Abytech Hub Ltd provides comprehensive coding workshops and digital skills programs to support innovation within Rwanda's growing tech ecosystem.",
      buttonText: "Learn More",
      buttonPath: "/services",
      image: banner2,
      icon: Code,
    },
    {
      tag: "WEB DEVELOPMENT",
      title: "Building Modern Responsive Applications",
      description: "Kigali-based experts at Abytech Hub Ltd specializing in web development using React, JavaScript, and cutting-edge frameworks.",
      buttonText: "Explore Services",
      buttonPath: "/services",
      image: banner3,
      icon: Zap,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];
  const IconComponent = slide.icon;

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden py-20 px-4" style={{ backgroundColor: '#f0f4ff' }}>
      {/* Animated Dot Pattern Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="dot-pattern"></div>
        <div className="dot-pattern-overlay"></div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Content Container */}
      <div className="w-full max-w-5xl text-center relative z-10">
        <div className="space-y-8">
          {/* Tag */}
          <div
            key={`tag-${currentSlide}`}
            className="hero-animate opacity-0 animate-fadeInDown"
            style={{ animationDelay: "0.1s" }}
          >
            <p className="text-blue-600 letter-spacing-wide font-semibold text-xs md:text-sm uppercase tracking-widest">
              {slide.tag}
            </p>
          </div>

          {/* Main Title */}
          <h1
            key={`title-${currentSlide}`}
            className="hero-animate text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight opacity-0 animate-fadeInUp px-4"
            style={{ animationDelay: "0.3s" }}
          >
            {slide.title}
          </h1>

          {/* Description */}
          <p
            key={`desc-${currentSlide}`}
            className="hero-animate text-gray-600 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto opacity-0 animate-fadeInUp px-4"
            style={{ animationDelay: "0.5s" }}
          >
            {slide.description}
          </p>

          {/* CTA Button */}
          <div
            className="hero-animate opacity-0 animate-fadeInUp"
            style={{ animationDelay: "0.7s" }}
          >
            <button className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 border-2 border-blue-600 transition-all text-blue-600 font-semibold py-3 px-8 rounded-full group shadow-sm hover:shadow-md">
              <span>{slide.buttonText}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-slate-800 w-8'
                : 'bg-gray-400 w-2 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      <style>{`
        /* Animations */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes dotMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        .animate-fadeInDown { animation: fadeInDown 0.8s ease forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        /* Dot Pattern Background */
        .dot-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
          background-size: 30px 30px;
          animation: dotMove 20s linear infinite;
        }

        .dot-pattern-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(circle, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: dotMove 30s linear infinite reverse;
        }

        .letter-spacing-wide {
          letter-spacing: 3px;
        }
      `}</style>
    </div>
  );
}