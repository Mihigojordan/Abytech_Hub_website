import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaQuoteRight, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const testimonials = [
  {
    rating: 5,
    title: "Software Engineer",
    emoji: "🚀",
    text: "AbyTech has been a game-changer for my career. Their mentorship and resources helped me scale my skills to new heights!",
    name: "Nsanzimana Fabrice",
    date: "15 March 2025"
  },
  {
    rating: 4,
    title: "IT Manager",
    emoji: "💡",
    text: "Working with AbyTech was an eye-opening experience. Their expertise and professional approach to IT solutions impressed me greatly.",
    name: "Nkaka Jean Doumour",
    date: "5 Feb 2025"
  },
  {
    rating: 5,
    title: "Data Analyst",
    emoji: "📊",
    text: "AbyTech provided powerful tools and insights that helped optimize our data processing at Kigali City Archive. Highly recommend their services!",
    name: "Mihigo Guillaume",
    date: "28 Jan 2025"
  },
  {
    rating: 5,
    title: "Full Stack Developer",
    emoji: "💻",
    text: "AbyTech transformed my approach to web and backend development. Their hands-on guidance was invaluable.",
    name: "Habineza Patrick",
    date: "10 March 2025"
  },
  {
    rating: 4,
    title: "Cloud Engineer",
    emoji: "☁️",
    text: "Their cloud solutions are top-notch! AbyTech helped us implement secure and scalable architectures.",
    name: "Rugamba Eric",
    date: "3 Feb 2025"
  },
  {
    rating: 5,
    title: "UX/UI Designer",
    emoji: "🎨",
    text: "Amazing experience! The design team at AbyTech has a keen eye for user experience and creativity.",
    name: "Umutoni Grace",
    date: "18 Feb 2025"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerSlide) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - itemsPerSlide < 0 ? testimonials.length - itemsPerSlide : prevIndex - itemsPerSlide
    );
  };

  return (
    <section className="bg-[#0d0f15] py-16 px-4 text-white text-center relative">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">
        What My <span className="text-yellow-400">Clients</span> Say
      </h2>
      <p className="text-gray-400 mb-8">Different customers sharing their experience with AbyTech.</p>

      {/* Testimonials Slider */}
      <div className="relative w-[80%] mx-auto">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerSlide)}%)` }}
          >
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="w-full md:w-1/2 lg:w-1/3 px-4"
                style={{ flex: `0 0 ${100 / itemsPerSlide}%` }}
                data-aos="zoom-in"
              >
                <div className="bg-[#13151b] p-6 rounded-lg shadow-lg">
                  {/* Star Ratings */}
                  <div className="flex justify-center mb-3 text-yellow-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t.title} {t.emoji}
                  </h3>
                  <p className="text-gray-400 mb-4">{t.text}</p>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.date}</p>
                  <FaQuoteRight className="text-red-400 text-2xl mt-4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-900 p-2 rounded-full"
          onClick={prevSlide}
        >
          <FaChevronLeft className="text-white text-lg" />
        </button>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-900 p-2 rounded-full"
          onClick={nextSlide}
        >
          <FaChevronRight className="text-white text-lg" />
        </button>
      </div>
    </section>
  );
}
