import { FaPencilRuler, FaCode, FaUserGraduate } from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { MdOutlineDraw, MdSupportAgent } from "react-icons/md";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaAngleDoubleRight } from "react-icons/fa";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const services = [
  {
    title: "Web Development",
    icon: <FaPencilRuler size={50} className="text-[#FFD44D]" />,
    description:
      "We design and develop modern, high-performance websites tailored to your brand’s identity. Our solutions ensure responsiveness, speed, and seamless user experience. Whether it’s a corporate site, portfolio, or custom platform, we bring your vision to life. Stay ahead of the competition with cutting-edge web technologies.",
  },
  {
    title: "App Development",
    icon: <IoDocumentTextSharp size={50} className="text-[#FFD44D]" />,
    description:
      "From mobile to web apps, we create high-quality, scalable, and intuitive applications. Our apps offer smooth functionality, stunning UI, and cross-platform compatibility. We focus on performance optimization to ensure seamless experiences for users. Transform your ideas into powerful applications with our expert team.",
  },
  {
    title: "Software Development",
    icon: <FaCode size={50} className="text-[#FFD44D]" />,
    description:
      "We build customized software solutions designed to meet your unique business needs. Our development process ensures security, scalability, and future-proof technology integration. Whether you need enterprise software, automation tools, or cloud-based systems, we have you covered. Let us help you streamline operations and enhance efficiency.",
  },

  {
    title: "E-Commerce Solutions",
    icon: <AiOutlineShoppingCart size={50} className="text-[#FFD44D]" />,
    description:
      "We develop robust, scalable, and secure e-commerce platforms tailored for your business. Our solutions include seamless payment gateways, inventory management, and user-friendly navigation. Enhance customer engagement with optimized shopping experiences and performance-driven designs. Build a profitable online store with cutting-edge technology.",
  },
  {
    title: "IT Support",
    icon: <MdSupportAgent size={50} className="text-[#FFD44D]" />,
    description:
      "Reliable IT support ensures that your business operates smoothly without technical disruptions. We provide troubleshooting, network security, software updates, and infrastructure maintenance. Our experts help optimize your systems for maximum efficiency and uptime. Experience uninterrupted workflows with our proactive IT solutions.",
  },
  {
    title: "Internship Program",
    icon: <FaUserGraduate size={50} className="text-[#FFD44D]" />,
    description:
      "Gain hands-on experience through our well-structured internship program designed for students and graduates. Learn from industry professionals, work on real projects, and enhance your skills. We provide mentorship, training, and career development opportunities in various domains. Start your journey towards a successful career with practical knowledge.",
  },
];



export default function ContentWriteServices() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
  }, []);

  return (
    <section className="bg-[#0D0F1A] text-white py-16 px-6 text-center">
      <h2 className="text-4xl font-bold">
        Our <span className="text-[#FFD44D]">Content Write</span> Services
      </h2>
      <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
        We provide high-quality digital solutions tailored to your needs.
      </p>

      {/* Services Grid */}
      <div
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10  mx-auto w-[90%]"

        data-aos="fade-right"
     
      >
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-transparent flex gap-2"
            data-aos="fade-up"
            data-aos-delay={index * 200}
           
          >
            <div className="relative bg-[#0D0F1A] border-[1px] border-gray-800 text-white p-8 w-[100%]   min-h-[400px]  max-h-[460px] rounded-lg overflow-hidden">
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