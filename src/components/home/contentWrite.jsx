import { FaPencilRuler, FaCode, FaUserGraduate } from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { MdSupportAgent } from "react-icons/md";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaAngleDoubleRight } from "react-icons/fa";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const services = [
  {
    title: "Web Development",
    icon: <FaPencilRuler size={50} />,
    description:
      "We design and develop modern, high-performance websites tailored to your brand's identity. Our solutions ensure responsiveness, speed, and seamless user experience. Whether it's a corporate site, portfolio, or custom platform, we bring your vision to life. Stay ahead of the competition with cutting-edge web technologies.",
  },
  {
    title: "App Development",
    icon: <IoDocumentTextSharp size={50} />,
    description:
      "From mobile to web apps, we create high-quality, scalable, and intuitive applications. Our apps offer smooth functionality, stunning UI, and cross-platform compatibility. We focus on performance optimization to ensure seamless experiences for users. Transform your ideas into powerful applications with our expert team.",
  },
  {
    title: "Software Development",
    icon: <FaCode size={50} />,
    description:
      "We build customized software solutions designed to meet your unique business needs. Our development process ensures security, scalability, and future-proof technology integration. Whether you need enterprise software, automation tools, or cloud-based systems, we have you covered. Let us help you streamline operations and enhance efficiency.",
  },
  {
    title: "E-Commerce Solutions",
    icon: <AiOutlineShoppingCart size={50} />,
    description:
      "We develop robust, scalable, and secure e-commerce platforms tailored for your business. Our solutions include seamless payment gateways, inventory management, and user-friendly navigation. Enhance customer engagement with optimized shopping experiences and performance-driven designs. Build a profitable online store with cutting-edge technology.",
  },
  {
    title: "IT Support",
    icon: <MdSupportAgent size={50} />,
    description:
      "Reliable IT support ensures that your business operates smoothly without technical disruptions. We provide troubleshooting, network security, software updates, and infrastructure maintenance. Our experts help optimize your systems for maximum efficiency and uptime. Experience uninterrupted workflows with our proactive IT solutions.",
  },
  {
    title: "Internship Program",
    icon: <FaUserGraduate size={50} />,
    description:
      "Gain hands-on experience through our well-structured internship program designed for students and graduates. Learn from industry professionals, work on real projects, and enhance your skills. We provide mentorship, training, and career development opportunities in various domains. Start your journey towards a successful career with practical knowledge.",
  },
];

export default function ContentWriteServices() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: "ease-in-out" });
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-16 px-6 text-center min-h-screen">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Our Premium Services
      </h2>
      <p className="mt-4 text-gray-700 max-w-2xl mx-auto text-lg">
        We provide high-quality digital solutions tailored to your needs.
      </p>

      <div
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto w-[90%] max-w-8xl"
        data-aos="fade-up"
      >
        {services.map((service, index) => (
          <div
            key={index}
            className="group relative"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="relative bg-white backdrop-blur-lg p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-purple-100 overflow-hidden min-h-[420px]">
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/30 via-blue-200/20 to-transparent rounded-bl-full"></div>
              
              {/* Icon Container */}
              <div className="relative z-10 w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-2xl font-bold mt-6 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                {service.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-gray-600 mt-4 leading-relaxed">
                {service.description}
              </p>

              {/* Arrow Button */}
              <div className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 cursor-pointer">
                <FaAngleDoubleRight className="w-5 h-5 text-white" />
              </div>

              {/* Bottom Decorative Element */}
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 via-blue-200/10 to-transparent rounded-tr-full"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}