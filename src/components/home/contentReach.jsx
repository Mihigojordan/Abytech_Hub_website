import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const ContentReach = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative h-[400px] text-white py-16 px-8 bg-cover bg-center"
    >
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-100"
        style={{
          backgroundImage: "url('../image/bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-2/3">
          <h2 className="text-4xl font-bold">
            <span className="text-yellow-400">Content Reaches</span>
            <br /> your audience’s audience.
          </h2>
        </div>
        <div className="md:w-1/3 flex flex-col gap-4 mt-6 md:mt-0">
          <button className="border border-white text-white py-2 px-6 rounded-lg hover:bg-white hover:text-black transition">
            Working With Us
          </button>
          <button className="bg-red-400 text-white py-2 px-6 rounded-lg hover:bg-red-500 transition">
            Trust Us To Get New
          </button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 bg-yellow-400 p-3 rounded-full shadow-lg hover:bg-yellow-500 transition"
        >
          <FaArrowUp className="text-black" />
        </button>
      )}
    </section>
  );
};

export default ContentReach;
