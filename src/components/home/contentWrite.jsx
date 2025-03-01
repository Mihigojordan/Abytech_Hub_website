import { FaPencilRuler } from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { MdOutlineDraw } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";import { useNavigate } from "react-router-dom";


const services = [
  { title: "WEB DEVELOPMENT", icon: <FaPencilRuler size={50} className="text-orange-400" /> },
  { title: "APP DEVELOPMENT", icon: <IoDocumentTextSharp size={50} className="text-orange-400" /> },
  { title: "UI/UX DESIGN", icon: <MdOutlineDraw size={50} className="text-orange-400" /> },
  { title: "E-COMMERCE SOLUTION", icon: <AiOutlineMail size={50} className="text-orange-400" /> },
];

export default function ContentWriteServices() {
  return (
    <section className="bg-[#0D0F1A] text-white py-16 px-6 text-center">
      <h2 className="text-4xl font-bold">
        Our <span className="text-yellow-400">Content Write</span> Services
      </h2>
      <p className="mt-4 text-gray-300 max-w-2xl mx-auto" >
        We provide high-quality digital solutions tailored to your needs.
      </p>

      {/* Services Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto" data-aos="fade-right">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-6 bg-[#151726] rounded-lg shadow-lg hover:shadow-xl transition duration-300"
          >
            {service.icon}
            <h3 className="mt-4 text-lg font-semibold">{service.title}</h3>
          </div>
        ))}
      </div>

      
    </section>
  );
}
