import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import  HeroImage from '../../assets/images/hero-img.png'

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

    <section className="relative  text-white min-h-screen bg-[#171B224D]  md:px-2">
     
    
    <section className="flex flex-col md:flex-row items-center  justify-center w-[100%]  px-6 md:px-12 py-12 bg-[#171B224D] text-white  h-[700px]">
      {/* Image Container */}
    <div className="relative w-[100%] md:w-[45%] ml-[40px] flex mt-16  justify-center">
        <img
          src={HeroImage}
          alt="Emily Anderson"
          className="w-64 md:w-96 lg:w-[80%] object-cover rounded-lg "
        />
      </div>

      {/* Text Content */}
      <div className="w-[100%] md:w-[70%] md:ml-[80px] leading-tight mt-8 md:mt-24 text-center md:text-left">
  <button className="bg-gray-700 text-white px-6 py-2 rounded-full mb-4 shadow-md">
    👋 Welcome to Abytech Hub
  </button>
  <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{lineHeight:"1.5"}}>
    Empowering Innovation <br /> Through <span className="text-[#FFD44D]">Technology</span>
  </h1>
  <p className="text-gray-300 mb-10 mt-4 max-w-md mx-auto md:mx-0 leading-relaxed">
    Delivering cutting-edge software solutions that drive businesses forward.  
    Innovating since <span className="text-[#FFD44D] font-bold">2022</span>, we transform ideas into impactful digital products.
  </p>
  <Link className="mt-12 bg-[#FFD44D] hover:bg-yellow-600 px-6 py-3 rounded-md text-white font-bold transition duration-300 shadow-md">
    Get in Touch
  </Link>
</div>

    </section>
      
     
    </section>
  );
};

export default Home;
