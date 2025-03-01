import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";

const Home = () => {

  const [scrolling, setScrolling] = useState(false);
  
    useEffect(() => {
      AOS.init({ duration: 200, easing: "ease-in-out", once: false });
  
      const handleScroll = () => {
        setScrolling(window.scrollY > 80); // Change background when scrolled past 50px
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
      { path: "/", name: "Home" },
      { path: "/services", name: "Services" },
      { path: "/blogs", name: "Blog" },
      { path: "/contact-us", name: "Contact Us" },
    ];

  return (

    <section className="relative  text-white min-h-screen bg-black px-2 md:px-2 lg:px-2">
     
    
    <section className="flex flex-col md:flex-row items-center justify-center w-full px-6 md:px-12 py-12 bg-gray-900 text-white">
      {/* Image Container */}
      <div className="relative w-full md:w-1/2 flex justify-center">
        <img
          src="../image/footer.png"
          alt="Emily Anderson"
          className="w-64 md:w-96 lg:w-[400px] object-cover rounded-lg "
        />
      </div>

      {/* Text Content */}
      <div className="w-full md:w-1/2 mt-8 md:mt-24 text-center md:text-left">
        <button className="bg-gray-700 text-white px-6 py-2 rounded-full mb-4 shadow-md">
          👋 Welcome to  Abytech Hub
        </button>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          I’m <span className="text-yellow-400">Prince Henry</span>
        </h1>
        <h2 className="text-yellow-400 text-2xl md:text-3xl font-semibold mt-2">
         CEO AbyTech
        </h2>
        <p className="text-gray-300 mt-4 max-w-md mx-auto md:mx-0 leading-relaxed">
            Since 2022,we are delivering softwares services and solutions towards new technology.
        </p>
        <button className="mt-6 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-md text-white font-bold transition duration-300 shadow-md">
          Connect To Us
        </button>
      </div>
    </section>
      
     
    </section>
  );
};

export default Home;
