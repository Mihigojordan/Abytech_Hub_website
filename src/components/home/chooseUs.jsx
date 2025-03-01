import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { LuNotebookPen } from "react-icons/lu";
import { MdOutlineContentPaste, MdRestore, MdVerifiedUser, MdOutlineWeb } from "react-icons/md";
import { FaLaptopCode, FaServer } from "react-icons/fa";

const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true }); // Initialize AOS with animation duration
  }, []);

  return (
    <section className="bg-[#171B224D] text-white px-10 md:px-20 lg:px-32 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* Left Side - Title & Image */}
        <div className="bg-gray-900 p-8 rounded-lg relative" data-aos="fade-right">
          <h2 className="text-3xl font-bold text-yellow-400">
            Why Choose <span className="text-white">Abytech Hub?</span>
          </h2>
          <p className="text-gray-300 mt-4">
            We provide cutting-edge digital solutions, ensuring high-quality, fast, and scalable results tailored to your business needs.
          </p>
          <div className="mt-6 relative">
            <img
              src="../image/working.png"
              alt="Working"
              className="rounded-lg shadow-lg"
              data-aos="zoom-in"
            />
          </div>
        </div>

        {/* Right Side - Features List */}
        <div className="space-y-8">
          {/* SEO Optimized */}
          <div className="flex items-start space-x-4" data-aos="fade-up">
            <LuNotebookPen className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold">SEO Optimized Solutions</h3>
              <p className="text-gray-300">We create content and websites that rank higher on search engines, driving organic traffic and visibility.</p>
            </div>
          </div>

       

          {/* Software Development */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="400">
            <FaLaptopCode className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold">Custom Software Development</h3>
              <p className="text-gray-300">We develop scalable and efficient** software solutions for businesses, startups, and enterprises.</p>
            </div>
          </div>

          {/* Website Design */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="600">
            <MdOutlineWeb className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold">Professional Website Design</h3>
              <p className="text-gray-300">We create visually stunning, user-friendly, and responsive websites tailored to your business needs.</p>
            </div>
          </div>

          {/* Web Hosting */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="800">
            <FaServer className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold">Secure & Reliable Web Hosting</h3>
              <p className="text-gray-300">We offer *fast, secure, and scalable* hosting solutions for businesses of all sizes.</p>
            </div>
          </div>

          {/* Quick Delivery */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="1000">
            <MdVerifiedUser className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold">Timely & Reliable Delivery</h3>
              <p className="text-gray-300">We ensure that every project is delivered *on time* without compromising quality.</p>
            </div>
          </div>

      
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;