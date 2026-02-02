import React from 'react'
import Image1 from '../../assets/sadiki.jpg';

function Quote() {
  return (
    <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-4 px-6">
      {/* Tech Pattern Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M10 10 L30 30 M20 5 L40 25 M5 40 L15 50" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-blue-400"/>
              <circle cx="30" cy="30" r="2" fill="currentColor" className="text-blue-400"/>
              <circle cx="70" cy="20" r="1.5" fill="currentColor" className="text-blue-400"/>
              <path d="M60 60 L80 70 L70 85" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-blue-400"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-pattern)"/>
        </svg>
      </div>

      {/* Animated Dots */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Quote */}
        <blockquote className="mb-16">
          <p className="text-3xl md:text-xl lg:text-xl font-bold text-white leading-tight mb-2">
            "Rwanda's tech ecosystem is experiencing unprecedented growth—
          </p>
          <p className="text-3xl md:text-4xl lg:text-xl font-bold text-white leading-tight">
            with innovation hubs and skilled developers, we're positioning
          </p>
          <p className="text-3xl md:text-4xl lg:text-xl font-bold text-white leading-tight">
            Africa as a global technology leader."
          </p>
        </blockquote>

        {/* Profile Section */}
        <div className="flex flex-col items-center">
          {/* Profile Image */}
          <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-blue-400 shadow-2xl shadow-blue-500/50">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-[#1d293d] flex items-center justify-center">
           
            <img src={Image1} alt="" />
            </div>
          </div>

          {/* Name and Title */}
          <div>
            <h3 className="text-sm md:text-xl font-bold text-white mb-2">
              Sadiki Rukara
            </h3>
            <p className="text-lg md:text-sm text-blue-300 font-medium tracking-wide">
              CEO & Founder, ABYTECH HUB
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#1d293d]/10 rounded-full blur-3xl"></div>
    </div>
  )
}

export default Quote