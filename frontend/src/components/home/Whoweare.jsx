import React from 'react';
import { Check, Code, Rocket, Users, Zap } from 'lucide-react';
import Image1 from '../../assets/images/image1.jpg'
import Image2 from '../../assets/images/image2.jpg'


function Whoweare() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-8xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Images */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative z-10">
              <img
               src={Image1}
               alt="Team collaboration"
                className="rounded-2xl shadow-2xl w-full h-[650px] object-cover"
              />
              
              {/* Experience Badge */}
              <div className="absolute -left-6 top-8 bg-[#ff5a00] text-white p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <Code className="w-8 h-8" />
                  <div>
                    <div className="text-3xl font-bold">10+</div>
                    <div className="text-sm opacity-90">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Image */}
            <div className="absolute -bottom-8 -right-6 z-20">
              <div className="relative">
                <img
                  src={Image2}
                  alt="Development work"
                  className="rounded-xl shadow-2xl w-72 h-56 object-cover border-4 border-white"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#ff5a00] opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#ff5a00] opacity-10 rounded-full blur-3xl"></div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="inline-block mb-4">
                <span className="bg-blue-100 text-orange-700 px-6 py-2 rounded-full text-sm font-semibold">
                  WHO WE ARE
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Crafting Digital Solutions with{' '}
                <span className="text-[#ff5a00]">Innovation</span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed">
              <span className="text-gray-900 font-semibold">ABYTECH</span> is a cutting-edge software development company 
              delivering world-class digital solutions. We transform ideas into powerful applications, 
              driving business growth through innovative technology and expert engineering.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {[
                { icon: Code, text: 'Custom software development & engineering' },
                { icon: Rocket, text: 'Agile methodology & rapid deployment' },
                { icon: Users, text: 'Dedicated teams & technical expertise' },
                { icon: Zap, text: 'Scalable, secure, and future-proof solutions' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-[#ff5a00] bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed pt-2">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Stats & CTA */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#ff5a00] bg-opacity-10 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Projects Delivered</div>
                </div>
              </div>

              <button className="bg-[#ff5a00] hover:bg-[#e64f00] text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Discover our process
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Whoweare;