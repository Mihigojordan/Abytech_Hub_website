import React from "react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { IoMdArrowRoundUp } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";


const FooterContent = () => {

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
  return (
    <footer className="bg-[#0F1015] text-white py-2 relative">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-10">
        {/* Left Section */}
        <div className="text-left max-w-lg">
        <span className="text-xl font-semibold ml-3">AbyTech</span>
          <h2 className="text-5xl font-bold">
            Let’s Work  <span className="text-[#FFD44D]">Together</span>
          </h2>
          {/* Social Icons */}
      <div className="absolute bottom-10 py-4 flex space-x-4">
        <FaFacebookF className="text-gray-400 hover:text-white cursor-pointer" />
        <RxCross2 className="text-gray-400 hover:text-white cursor-pointer" />
        <FaLinkedinIn className="text-gray-400 hover:text-white cursor-pointer" />
      </div>
        </div>

        {/* Right Section - Image and Call to Action */}
        <div className="relative flex items-center justify-center mt-10 lg:mt-0">
          <img
            src="../image/landing.png"
            alt="Person"
            className="w-96 grayscale"
          />
          
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 text-center border-t border-gray-700 py-2">
      <p className="text-gray-400 text-sm">
            &copy;{new Date().getFullYear()} Abytech Hub - All Rights Reserved by Abytech Team
        </p>

      </div>

     

      {/* Scroll to Top */}
      <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-[#FFD44D] p-3 rounded-full shadow-md hover:bg-yellow-500 transition"
      aria-label="Scroll to Top"
    >
      <IoMdArrowRoundUp className="text-black text-xl" />
    </button>
    </footer>
  );
};

export default FooterContent;
