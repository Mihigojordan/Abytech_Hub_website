import React, { useState } from 'react';
import { Shield, Users, Lock, Cpu, Code } from 'lucide-react';

export default function WhyChooseUs() {
  const [highlighted,setHighlighted] = useState(null)
 const services = [
    {
      icon: Code,
      title: 'Web Development',
      description: 'Building modern, responsive applications using technologies such as React, JavaScript, and related frameworks to create high-impact digital products.',
      path: '/services'
    },
    {
      icon: Cpu,
      title: 'Software Solutions',
      description: 'Delivering cutting-edge software solutions that drive businesses forward and transform ideas into impactful digital experiences.',
      path: '/services'
    },
    {
      icon: Users,
      title: 'IT Training',
      description: 'Empowering local talent through coding workshops and digital skills programs, supporting innovation within Rwanda’s growing tech ecosystem.',
      path: '/services'
    }
  ];

  return (
    <div className="w-full bg-white py-16 md:py-24 px-4 md:px-8">
      <div className=" mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <p className="text-primary-500 font-semibold text-sm md:text-base tracking-wide">OUR SOLUTIONS</p>
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            We Different From Others <br /> Should Choose Us
          </h2>
          
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                onClick={()=> setHighlighted(index)}
                className={`p-8 md:p-10 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                  highlighted == index
                    ? 'border-2 border-primary-500 bg-white'
                    : 'bg-gray-50 border-2 border-transparent hover:border-primary-200'
                }`}
              >
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className={`p-4 rounded-xl ${
                    highlighted == index 
                      ? 'bg-primary-50' 
                      : 'bg-gray-200'
                  }`}>
                    <Icon 
                      className={`w-8 h-8 ${
                        highlighted == index 
                          ? 'text-primary-500' 
                          : 'text-gray-700'
                      }`}
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm md:text-base text-center mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Link */}
                <a
                  href="#"
                  className="text-primary-500 font-semibold text-center block hover:text-primary-600 transition-colors text-sm md:text-base"
                >
                  View Details →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}