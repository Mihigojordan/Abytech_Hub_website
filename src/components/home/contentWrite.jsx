import { FaPencilRuler, FaAngleDoubleRight } from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { MdOutlineDraw } from "react-icons/md";
import { AiOutlineMail } from "react-icons/ai";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const services = [
  {
    title: "WEB DEVELOPMENT",
    icon: <FaPencilRuler size={50} className="text-orange-400" />,
    description:
      "Building modern, fast, and responsive websites tailored to your needs.",
  },
  {
    title: "APP DEVELOPMENT",
    icon: <IoDocumentTextSharp size={50} className="text-orange-400" />,
    description:
      "Creating high-performance mobile and web apps for seamless user experiences.",
  },
  {
    title: "UI/UX DESIGN",
    icon: <MdOutlineDraw size={50} className="text-orange-400" />,
    description:
      "Designing intuitive and visually stunning user interfaces for better engagement.",
  },
  {
    title: "E-COMMERCE SOLUTION",
    icon: <AiOutlineMail size={50} className="text-orange-400" />,
    description:
      "Providing scalable and secure online store solutions to boost your business.",
  },
];

export default function ContentWriteServices() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
  }, []);

  return (
    <section className="bg-[#0D0F1A] text-white py-16 px-6 text-center">
      <h2 className="text-4xl font-bold">
        Our <span className="text-yellow-400">Content Write</span> Services
      </h2>
      <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
        We provide high-quality digital solutions tailored to your needs.
      </p>

      {/* Services Grid */}
      <div
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto"
        data-aos="fade-right"
      >
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-transparent flex gap-2"
            data-aos="fade-up"
            data-aos-delay={index * 200}
          >
            <div className="relative bg-[#0D0F1A] border-[1px] border-gray-800 text-white p-8 w-[350px] min-h-[350px] max-h-[460px] rounded-lg overflow-hidden">
              <div className="absolute bottom-0 right-0 w-20 h-20">
                <div
                  className="absolute inset-0 bg-[#121420d2]"
                  style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
                ></div>
              </div>

              <div className="text-orange-400 text-4xl">{service.icon}</div>

              <h3 className="text-2xl font-bold mt-4">{service.title}</h3>

              <p className="text-gray-400 mt-4">{service.description}</p>
              <div className="h-10"></div>

              <div className="absolute bottom-[10px] right-[10px] w-[60px] h-[60px] bg-[#0D0F1A] border-[2px] border-gray-800 text-orange-400 flex items-center justify-center rounded-full text-2xl shadow-lg">
                <FaAngleDoubleRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
