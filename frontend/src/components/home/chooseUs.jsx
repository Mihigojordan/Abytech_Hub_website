import React, { useState } from 'react';
import { Shield, Users, Lock, Cpu, Code } from 'lucide-react';

export default function WhyChooseUs() {
  const [highlighted, setHighlighted] = useState(null);

  const services = [
    {
      icon: Code,
      title: 'Web Development',
      description:
        'Building modern, responsive applications using technologies such as React, JavaScript, and related frameworks to create high-impact digital products.',
      path: '/services',
    },
    {
      icon: Cpu,
      title: 'Software Solutions',
      description:
        'Delivering cutting-edge software solutions that drive businesses forward and transform ideas into impactful digital experiences.',
      path: '/services',
    },
    {
      icon: Users,
      title: 'IT Training',
      description:
        "Empowering local talent through coding workshops and digital skills programs, supporting innovation within Rwanda's growing tech ecosystem.",
      path: '/services',
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 via-white to-orange-50 text-gray-900 py-10 md:py-10 px-4 md:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-8xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#ff5a00]" />
            <p className="text-[#ff5a00] font-bold text-sm md:text-base tracking-[0.3em] uppercase">
              Our Solutions
            </p>
            <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#ff5a00]" />
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-gray-900">
            Why We{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5a00] to-orange-500">
              Stand Out
            </span>
          </h2>

          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover innovative solutions tailored to your needs, crafted with precision and a passion for excellence in technology.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 -mt-[70px] ">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                onMouseEnter={() => setHighlighted(index)}
                onMouseLeave={() => setHighlighted(null)}
                className="group relative"
              >
                <div
                  className={`relative h-full p-8 md:p-10 rounded-3xl bg-white border-2 transition-all duration-500 cursor-pointer ${
                    highlighted === index
                      ? 'border-[#ff5a00] shadow-2xl shadow-[#ff5a00]/20 -translate-y-2'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Glowing Corner Accent */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 bg-[#ff5a00] rounded-bl-full blur-2xl transition-opacity duration-500 ${
                      highlighted === index ? 'opacity-20' : 'opacity-0'
                    }`}
                  />

                  {/* Icon */}
                  <div className="mb-8 flex justify-center">
                    <div
                      className={`relative p-5 rounded-2xl transition-all duration-500 ${
                        highlighted === index
                          ? 'bg-gradient-to-br from-[#ff5a00] to-orange-600 scale-110 rotate-3'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}
                    >
                      <Icon
                        className={`w-10 h-10 transition-all duration-500 ${
                          highlighted === index ? 'text-white' : 'text-gray-700'
                        }`}
                        strokeWidth={2.5}
                      />

                      {highlighted === index && (
                        <div className="absolute inset-0 bg-[#ff5a00] rounded-2xl blur-xl opacity-40" />
                      )}
                    </div>
                  </div>

                  {/* Number */}
                  <div className="absolute top-6 left-6">
                    <span
                      className={`text-6xl font-black transition-all duration-500 ${
                        highlighted === index
                          ? 'text-[#ff5a00]/15'
                          : 'text-gray-200/80'
                      }`}
                    >
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-2xl md:text-3xl font-bold mb-5 text-center transition-colors duration-300 ${
                      highlighted === index ? 'text-[#ff5a00]' : 'text-gray-900'
                    }`}
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm md:text-base text-center mb-8 leading-relaxed min-h-[100px]">
                    {service.description}
                  </p>

                  {/* Link Button */}
                  <div className="flex justify-center">
                    
                      <a href={service.path}
                      className={`relative inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 overflow-hidden ${
                        highlighted === index
                          ? 'bg-[#ff5a00] text-white shadow-lg shadow-[#ff5a00]/50'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="relative z-10">View Details</span>
                      <span
                        className={`relative z-10 transition-transform duration-300 ${
                          highlighted === index ? 'translate-x-1' : ''
                        }`}
                      >
                        →
                      </span>

                      {highlighted === index && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      )}
                    </a>
                  </div>

                  {/* Bottom Accent */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff5a00] to-transparent transition-opacity duration-500 ${
                      highlighted === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}