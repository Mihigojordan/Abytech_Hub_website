import React, { useRef, useEffect } from "react";
import { ArrowRight, Sparkles, Code, Zap } from "lucide-react";
import banner1 from "../../assets/banners/banner-img1.png";
import banner2 from "../../assets/banners/banner-img3.png";
import banner3 from "../../assets/banners/main-pic1.png"

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      tag: "SOFTWARE SOLUTIONS",
      title: (
        <>
          Empowering Innovation <br /> Through <span className="text-blue-300">Technology</span>
        </>
      ),
      description: (
        <>
          Delivering cutting-edge software solutions that drive businesses forward. Innovating since <span className="text-blue-300 font-bold">2022</span>, we transform ideas into impactful digital products at Abytech Hub Ltd.
        </>
      ),
      buttonText: "Get in Touch",
      buttonPath: "/contact-us",
         image: banner1,
      icon: Sparkles,
    },
    {
      tag: "IT TRAINING & EDUCATION",
      title: (
        <>
          Empowering <span className="text-blue-300">Local Talent</span> <br /> Through Education
        </>
      ),
      description:
        "Abytech Hub Ltd provides comprehensive coding workshops and digital skills programs to support innovation within Rwanda's growing tech ecosystem. Join our community of learners.",
      buttonText: "Learn More",
      buttonPath: "/services",
      image: banner2,
      icon: Code,
    },
    {
      tag: "WEB DEVELOPMENT",
      title: (
        <>
          Building Modern <br /> <span className="text-blue-300">Responsive Applications</span>
        </>
      ),
      description:
        "Kigali-based experts at Abytech Hub Ltd specializing in web development using React, JavaScript, and cutting-edge frameworks to create high-impact digital solutions.",
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
    <div className="w-full min-h-screen md:h-[400px] pt-6 relative overflow-hidden py-10" style={{ backgroundColor: '#37517e' }}>
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="flex items-center justify-center h-screen px-4 md:px-8 relative z-10">
        <div className="w-full max-w-8xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Section */}
          <div className="flex flex-col justify-center space-y-6 overflow-hidden relative">
            {/* Decorative Side Line */}
            <div className="hero-animate absolute left-0 top-0 w-1 h-32 bg-blue-400 opacity-0 animate-slideInLeft" style={{ animationDelay: "0.3s" }}></div>

            <div className="space-y-4 relative pl-6">
              {/* Icon Badge */}
              <div
                key={`icon-${currentSlide}`}
                className="hero-animate inline-flex items-center gap-2 opacity-0 animate-slideInUp"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h5 className="text-blue-200 letter-spacing-wide font-semibold text-sm md:text-base">
                  {slide.tag}
                </h5>
              </div>

              {/* Animated Block Element */}
              <div className="hero-animate absolute -left-4 top-20 w-20 h-20 border-2 border-blue-300 opacity-20 animate-rotateBlock" style={{ animationDelay: "0.5s" }}></div>

              <h1
                key={`title-${currentSlide}`}
                className="hero-animate text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight opacity-0 animate-slideInLeft"
                style={{ animationDelay: "0.4s" }}
              >
                {slide.title}
              </h1>

              <p
                key={`desc-${currentSlide}`}
                className="hero-animate text-blue-50 text-base md:text-lg leading-relaxed max-w-md opacity-0 animate-slideInRight"
                style={{ animationDelay: "0.6s" }}
              >
                {slide.description}
              </p>
            </div>

            {/* CTA with Enhanced Animation */}
            <div
              className="hero-animate pl-6 opacity-0 animate-slideInUp"
              style={{ animationDelay: "0.8s" }}
            >
              <button className="relative inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold py-3 px-6 rounded-lg group overflow-hidden">
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                <span className="relative">{slide.buttonText}</span>
                <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-center h-full relative">
            {/* Decorative Frame */}
            {/* <div className="hero-animate absolute inset-0 border-4 border-blue-400 opacity-20 rounded-2xl animate-pulse-slow" style={{ animationDelay: "0.7s" }}></div> */}
            
            {/* Floating Particles */}
            <div className="hero-animate absolute top-10 right-10 w-3 h-3 bg-blue-300 rounded-full animate-float" style={{ animationDelay: "1.2s" }}></div>
            <div className="hero-animate absolute bottom-20 left-10 w-2 h-2 bg-blue-200 rounded-full animate-float" style={{ animationDelay: "1.5s" }}></div>
            <div className="hero-animate absolute top-1/2 right-20 w-2 h-2 bg-blue-300 rounded-full animate-float" style={{ animationDelay: "1.8s" }}></div>

            <div className="relative">
              <img
                key={`img-${currentSlide}`}
                src={slide.image}
                alt={slide.tag}
                className="hero-animate w-full h-96 md:h-96 lg:h-[70vh] object-cover   animate-scaleIn relative z-10"
                style={{ animationDelay: "0.5s" }}
              />
              {/* Glow Effect */}
              {/* <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-2xl blur-2xl"></div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-blue-300 scale-125'
                : 'bg-blue-400 opacity-50 hover:opacity-75'
            }`}
          />
        ))}
      </div>

      <style>{`
        /* Animations */
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-80px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(80px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotateBlock {
          from { opacity: 0; transform: rotate(0deg); }
          to { opacity: 0.2; transform: rotate(45deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.02); }
        }

        .animate-slideInUp { animation: slideInUp 0.8s ease forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease forwards; }
        .animate-scaleIn { animation: scaleIn 1s ease forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-rotateBlock { animation: rotateBlock 1s ease forwards; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

        /* Grid Pattern */
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .letter-spacing-wide {
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  );
}