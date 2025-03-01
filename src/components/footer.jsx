import React from "react";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { IoMdArrowRoundUp } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";


const FooterContent = () => {

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
  return (
    <footer className="bg-[#171B224D] text-white  relative">
        <section className="bg-[#171B224D] text-white py-12 px-6 md:px-16 lg:px-24">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
        {/* Left Section */}
        <div className="text-left max-w-2xl space-y-6">
          <span className="text-2xl font-semibold text-[#FFD44D]">AbyTech Hub</span>
          <h2 className="text-6xl font-bold leading-tight">
            Let’s Work <span className="text-[#FFD44D]">Together</span>
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed" style={{lineHeight:"3"}}>
            Thank you for visiting AbyTech Hub! We are dedicated to delivering 
            top-notch technology solutions tailored to your needs. Let’s build 
            something great together. Follow us on social media and stay 
            updated with our latest innovations!
          </p>
          
         
        </div>

        {/* Right Section - Image */}
        <div className="relative flex items-center justify-center">
          <img
              src="../image/landing.png"
            alt="AbyTech Team"
            className="w-[450px] lg:w-[550px] grayscale hover:grayscale-0 transition duration-500"
          />
        </div>
      </div>
    </section>

      {/* Footer Bottom */}
      <div className=" pt-4 pr-18 pl-22 pb-4 border-t border-gray-700 bg-[#171B224D] flex flex-col md:flex-row justify-between items-center">
  {/* Left Section - Social Media */}
  <div className="flex space-x-4">


  <a href="https://x.com/AbytechHUB" target="_blank" rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#FFD44D] bg-[#FFD44D] text-gray-900 hover:bg-transparent hover:text-[#FFD44D] transition">
    <RxCross2 className="text-sm" />
  </a>

  <a href="https://www.linkedin.com/in/aby-tech-9b8947174/" target="_blank" rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#FFD44D] bg-[#FFD44D] text-gray-900 hover:bg-transparent hover:text-[#FFD44D] transition">
    <FaLinkedinIn className="text-sm" />
  </a>
  <a href="https://www.instagram.com/abytech_hub/" target="_blank" rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#FFD44D] bg-[#FFD44D] text-gray-900 hover:bg-transparent hover:text-[#FFD44D] transition">
    <FaInstagram className="text-sm" />
  </a>

  <a href="https://wa.me/+250791813289" target="_blank" rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#FFD44D] bg-[#FFD44D] text-gray-900 hover:bg-transparent hover:text-[#FFD44D] transition">
    <FaWhatsapp className="text-sm" />
  </a>

  <a href="mailto:abytechhubllc@gmail.com" target="_blank" rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#FFD44D] bg-[#FFD44D] text-gray-900 hover:bg-transparent hover:text-[#FFD44D] transition">
    <FaEnvelope className="text-sm" />
  </a>
</div>


  {/* Right Section - Copyright */}
  <p className="text-gray-400 text-sm mt-3 md:mt-0">
    &copy; {new Date().getFullYear()} Abytech Hub LLC - All Rights Reserved by Abytech Team
  </p>
</div>

     

      {/* Scroll to Top */}
      <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-[#FFD44D] p-3 rounded-full shadow-md hover:bg-yellow-500 transition"
      aria-label="Scroll to Top"
    >
      <IoMdArrowRoundUp className="text-white text-xl" />
    </button>
    </footer>
  );
};

export default FooterContent;
