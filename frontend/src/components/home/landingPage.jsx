import React, { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import banner1 from "../../assets/banners/banner-img1.png";
import banner2 from "../../assets/banners/banner-img3.png";
import banner3 from "../../assets/banners/main-pic1.png";


export default function HeroSection() {
  const swiperRef = useRef(null);

  const slides = [
    {
      tag: "SOFTWARE SOLUTIONS",
      title: (
        <>
          Empowering Innovation <br /> Through <span className="text-primary-500">Technology</span>
        </>
      ),
      description: (
        <>
          Delivering cutting-edge software solutions that drive businesses forward. Innovating since <span className="text-primary-500 font-bold">2022</span>, we transform ideas into impactful digital products.
        </>
      ),
      buttonText: "Get in Touch",
      buttonPath: "/contact-us",
      image: banner1,
    },
    {
      tag: "IT TRAINING",
      title: (
        <>
          Empowering <span className="text-primary-500">Local Talent</span> <br /> Through Education
        </>
      ),
      description:
        "Providing coding workshops and digital skills programs to support innovation within Rwanda’s growing tech ecosystem.",
      buttonText: "Learn More",
      buttonPath: "/services",
      image: banner2,
    },
    {
      tag: "WEB DEVELOPMENT",
      title: (
        <>
          Building Modern <br /> <span className="text-primary-500">Responsive Applications</span>
        </>
      ),
      description:
        "Kigali-based experts in web development using React, JavaScript, and related frameworks to create high-impact digital solutions.",
      buttonText: "Explore Services",
      buttonPath: "/services",
      image: banner3,
    },
  ];

  useEffect(() => {
    if (!swiperRef.current) return;
    const swiper = swiperRef.current.swiper;

    swiper.on("slideChangeTransitionStart", () => {
      // Reset animations
      document
        .querySelectorAll(".hero-animate")
        .forEach((el) => (el.style.animation = "none"));
      // Force reflow and restart animations
      setTimeout(() => {
        document.querySelectorAll(".hero-animate").forEach((el) => {
          el.style.animation = "";
        });
      }, 10);
    });
  }, []);

  return (
    <div className="w-full min-h-screen ">
      <Swiper
        ref={swiperRef}
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="w-full h-screen"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="flex items-center justify-center h-full px-4 md:px-16 py-12">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ">
                {/* Left Section */}
                <div className="flex flex-col justify-center space-y-6 overflow-hidden">
                  <div className="space-y-4">
                    <h5
                      className="hero-animate text-primary-500 letter-spacing-wide font-semibold text-sm md:text-base opacity-0 animate-slideInUp"
                      style={{ animationDelay: "0.2s" }}
                    >
                      {slide.tag}
                    </h5>

                    <h1
                      className="hero-animate text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight opacity-0 animate-slideInLeft"
                      style={{ animationDelay: "0.4s" }}
                    >
                      {slide.title}
                    </h1>

                    <p
                      className="hero-animate text-gray-600 text-base md:text-lg leading-relaxed max-w-md opacity-0 animate-slideInRight"
                      style={{ animationDelay: "0.6s" }}
                    >
                      {slide.description}
                    </p>
                  </div>

                  <div
                    className="hero-animate opacity-0 animate-slideInUp"
                    style={{ animationDelay: "0.8s" }}
                  >
                    <Link to={slide.buttonPath}>
                      <button className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 transition-all text-white font-semibold py-3 px-6 rounded-lg group">
                        <span>{slide.buttonText}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-center h-full">
                  <img
                    src={slide.image}
                    alt={slide.tag}
                    className="hero-animate w-full h-96 md:h-96 lg:h-[70vh] object-cover opacity-0 animate-scaleIn"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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

        .animate-slideInUp { animation: slideInUp 0.8s ease forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease forwards; }
        .animate-slideInRight { animation: slideInRight 0.8s ease forwards; }
        .animate-scaleIn { animation: scaleIn 1s ease forwards; }

        /* Pagination styling */
        .swiper-pagination-bullet {
          background-color: #0a56ae !important;
          width: 12px !important;
          height: 12px !important;
          opacity: 0.5 !important;
        }

        .swiper-pagination-bullet-active {
          opacity: 1 !important;
          background-color: #0a56ae !important;
        }

        .letter-spacing-wide {
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}