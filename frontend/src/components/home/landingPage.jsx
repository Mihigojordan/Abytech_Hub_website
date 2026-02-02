import React from "react";
import { ArrowRight } from "lucide-react";
import banner3 from "../../assets/banners/main-pic1.png";

export default function HeroSection() {
  return (
    <div className="w-full min-h-screen flex items-center relative overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={banner3} 
          alt="Professional background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/50"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10 ">
        <div className="max-w-3xl space-y-6 md:space-y-8">
          {/* Tag */}
          <div className="animate-fadeInDown">
            <p className="text-white/80 font-medium text-xs md:text-sm uppercase tracking-[0.2em]">
              BUILDING TECHNOLOGY. POWERING INNOVATION.
            </p>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight animate-fadeInUp">
            CREATING SCALABLE TECHNOLOGY SOLUTIONS FOR A DIGITAL WORLD.
          </h1>

          {/* Description */}
          <p className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            We are a technology-driven company focused on designing, building, and scaling modern digital products. SOLVIT AFRICA delivers innovative software solutions, reliable systems, and cutting-edge technology that help businesses grow, transform, and compete globally.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <button className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 transition-all text-slate-900 font-semibold py-4 px-8 rounded-md group shadow-lg">
              <span>Get In Touch with Us</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border-2 border-white transition-all text-white font-semibold py-4 px-8 rounded-md group">
              <span>Join our Talent</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>



      <style>{`
        /* Animations */
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeInDown { 
          animation: fadeInDown 0.8s ease forwards; 
          opacity: 0;
        }
        
        .animate-fadeInUp { 
          animation: fadeInUp 0.8s ease forwards; 
          opacity: 0;
        }
      `}</style>
    </div>
  );
}