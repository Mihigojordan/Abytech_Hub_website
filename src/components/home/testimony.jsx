import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaQuoteRight, FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    rating: 4,
    title: "Full Stack Developer",
    emoji: "😍",
    text: "It was a great experience working with AbyTech because they boosted my career and helped me build my technology today.",
    name: "Mihigo Prince",
    date: "20 Feb 2025",
  },
  {
    rating: 5,
    title: "Web Developer",
    emoji: "👍",
    text: "AbyTech provided outstanding support that helped me grow as a developer. Highly recommend!",
    name: "Ngenzi Serge",
    date: "12 Jan 2025",
  },
  {
    rating: 5,
    title: "Backend Developer",
    emoji: "😍",
    text: "Excellent experience working with AbyTech. They have a great team that understands business needs!",
    name: "Iragena Egide",
    date: "22 Feb 2025",
  },
  {
    rating: 4,
    title: "Full Stack Developer",
    emoji: "😍",
    text: "It was a great experience working with AbyTech because they boosted my career and helped me build my technology today.",
    name: "Mihigo Prince",
    date: "20 Feb 2025",
  },
  {
    rating: 5,
    title: "Web Developer",
    emoji: "👍",
    text: "AbyTech provided outstanding support that helped me grow as a developer. Highly recommend!",
    name: "Ngenzi Serge",
    date: "12 Jan 2025",
  },
  {
    rating: 5,
    title: "Backend Developer",
    emoji: "😍",
    text: "Excellent experience working with AbyTech. They have a great team that understands business needs!",
    name: "Iragena Egide",
    date: "22 Feb 2025",
  },
  
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 1 ? 0 : prevIndex + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const getVisibleTestimonials = () => {
    const itemsPerSlide = 3;
    const startIndex = currentIndex * itemsPerSlide;
    return testimonials.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <section className="bg-[#0d0f15] py-16 px-4 w-full text-white text-center relative">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        What My <span className="text-yellow-400">Clients</span> Say
      </h2>
      <p className="text-gray-400 mb-8">
        Different customers sharing their experience with AbyTech.
      </p>

      <div className="flex justify-center w-full overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex"
          >
            {getVisibleTestimonials().map((t, index) => (
              <div
                key={index}
                className="bg-[#1b1e24] w-[300px] p-6 rounded-lg mx-4 shadow-md"
                data-aos="fade-down"
              >
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
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-6">
        {[0, 1].map((index) => (
          <button
            key={index}
            className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
              currentIndex === index ? "bg-red-500 w-4" : "bg-gray-600"
            }`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>
    </section>
  );
}
