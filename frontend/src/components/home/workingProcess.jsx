import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaRocket, FaClipboardList, FaCheckCircle, FaCog, FaHeadset } from 'react-icons/fa';
import banner2 from "../../assets/banners/banner-img2.png";

export default function WorkProcess() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
  }, []);

  const steps = [
    {
      icon: FaRocket,
      title: 'Get Started',
      description: 'Begin your journey with our expert-driven development process, ensuring a smooth onboarding experience.',
      number: '01',
    },
    {
      icon: FaClipboardList,
      title: 'Requirement Gathering',
      description: 'We gather and analyze all project requirements, aligning business goals with technical needs.',
      number: '02',
    },
    {
      icon: FaCog,
      title: 'Planning & Strategy',
      description: 'We outline a clear roadmap, define milestones, and strategize the best approach to ensure seamless execution.',
      number: '03',
    },
    {
      icon: FaCheckCircle,
      title: 'Development & Execution',
      description: 'Our expert developers bring the vision to life, coding and building scalable, secure solutions.',
      number: '04',
    },
    {
      icon: FaHeadset,
      title: 'Deployment & Support',
      description: 'We launch your project successfully and provide ongoing maintenance, support, and updates.',
      number: '05',
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 md:py-24 px-16">
      <div className="mx-auto">
        
        {/* Header */}
        <div className="mb-16 md:mb-20" data-aos="fade-down">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary-500">Working</span> Process
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl leading-relaxed">
            We follow a structured and transparent process to deliver exceptional results for every project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Section - Steps */}
          <div className="space-y-6 md:space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="group relative"
                >
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-12 bg-gradient-to-b from-primary-400 to-transparent opacity-30"></div>
                  )}

                  <div className="flex gap-6 md:gap-8 relative z-10">
                    {/* Number Circle */}
                    <div className="flex-shrink-0">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                        <span className="text-white font-bold text-lg md:text-xl">{step.number}</span>
                        <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2 md:pt-3">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Hover Background */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              );
            })}
          </div>

          {/* Right Section - Image Placeholder */}
          <div className="flex items-center justify-center" data-aos="fade-left">
            <div className="relative w-full">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-blue-100 rounded-3xl blur-2xl opacity-40"></div>

              <img
                    src={banner2}
                    alt={'work prgress image'}
                    className="  h-96 md:h-96  "
                    style={{ animationDelay: "0.5s" }}
                  />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}