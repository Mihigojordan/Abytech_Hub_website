import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { LuNotebookPen } from "react-icons/lu";
import { MdOutlineContentPaste, MdRestore, MdVerifiedUser } from "react-icons/md";

const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true }); // Initialize AOS with animation duration
  }, []);

  return (
    <section className="bg-black text-white px-10 md:px-20 lg:px-32 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Title & Image */}
        <div
          className="bg-gray-900 p-8 rounded-lg relative"
          data-aos="fade-right"
        >
          <h2 className="text-3xl font-bold text-yellow-400">
            Why Choose <span className="text-white">Our Services</span>
          </h2>
          <p className="text-gray-300 mt-4">
            At Abytech Hub, we are committed to delivering top-tier digital solutions that drive success.
          </p>
          <div className="mt-6 relative">
            <img
              src="../image/working.png"
              alt="Working"
              className="rounded-lg"
              data-aos="zoom-in"
            />
          </div>
        </div>

        {/* Right Side - Features List */}
        <div className="space-y-6">
          {/* SEO Optimized */}
          <div className="flex items-start space-x-4" data-aos="fade-up">
            <LuNotebookPen className="w-10 h-10 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">GET SEO OPTIMIZED CONTENT</p>
              <h3 className="text-xl font-bold">SEO Optimized</h3>
              <p className="text-gray-300">Pretium non faucibus morbi diam felis bibendum in.</p>
            </div>
          </div>

          {/* Original Content */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="200">
            <MdOutlineContentPaste className="w-10 h-10 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">FRESH AUTHENTIC CONTENT</p>
              <h3 className="text-xl font-bold">Original Content</h3>
              <p className="text-gray-300">Commodo molestie sit etiam commodo nunc.</p>
            </div>
          </div>

          {/* Quick Delivery Time */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="400">
            <MdVerifiedUser className="w-10 h-10 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">DELIVERY WITHIN 7 DAYS</p>
              <h3 className="text-xl font-bold">Quick Delivery Time</h3>
              <p className="text-gray-300">Sed tortor et ultrices sit arcu.</p>
            </div>
          </div>

          {/* Unlimited Revisions */}
          <div className="flex items-start space-x-4" data-aos="fade-up" data-aos-delay="600">
            <MdRestore className="w-10 h-10 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-sm">REVISION & CUSTOMER SUPPORT</p>
              <h3 className="text-xl font-bold">Unlimited Revisions</h3>
              <p className="text-gray-300">Ipsum montes sit tortor sollicitudin tempus nulla turpis.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
