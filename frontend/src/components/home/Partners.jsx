import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";

// Partner logos - using placeholder images
const partners = [
  { 
    name: "AbyRide", 
    logo: "https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=AbyRide",
    category: "Transportation"
  },
  { 
    name: "Rent By Aby", 
    logo: "https://via.placeholder.com/200x80/06B6D4/FFFFFF?text=RentByAby",
    category: "Real Estate"
  },
  { 
    name: "Aby Inventory", 
    logo: "https://via.placeholder.com/200x80/8B5CF6/FFFFFF?text=AbyInventory",
    category: "Technology"
  },
  { 
    name: "Tech Solutions", 
    logo: "https://via.placeholder.com/200x80/3B82F6/FFFFFF?text=TechSolutions",
    category: "Technology"
  },
  { 
    name: "Global Ventures", 
    logo: "https://via.placeholder.com/200x80/10B981/FFFFFF?text=GlobalVentures",
    category: "Investment"
  },
  { 
    name: "Innovation Labs", 
    logo: "https://via.placeholder.com/200x80/F59E0B/FFFFFF?text=InnovationLabs",
    category: "Research"
  },
];

export default function Partners() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % partners.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length);
    setIsAutoPlaying(false);
  };

  const getVisiblePartners = () => {
    const visible = [];
    for (let i = 0; i < 5; i++) {
      visible.push(partners[(currentIndex + i) % partners.length]);
    }
    return visible;
  };

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 relative overflow-hidden" style={{backgroundColor: '#37517e'}}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 mb-6">
            <Award className="w-4 h-4 text-blue-200" />
            <span className="text-white/90 font-medium text-sm tracking-wide">TRUSTED BY INDUSTRY LEADERS</span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Our Strategic <span className="text-blue-200">Partners</span>
          </h2>
          
          {/* Description */}
          <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Collaborating with innovative organizations across industries to deliver exceptional value and drive meaningful impact.
          </p>
        </div>

        {/* Partners Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20 hover:scale-110"
            aria-label="Previous partners"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20 hover:scale-110"
            aria-label="Next partners"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-16">
            {getVisiblePartners().map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="group relative"
              >
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl h-40 flex flex-col items-center justify-center">
                  {/* Logo */}
                  <div className="mb-3">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-16 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  
                  {/* Category Badge */}
                  <span className="text-xs text-blue-200/80 font-medium px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    {partner.category}
                  </span>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-400/0 via-blue-400/0 to-blue-400/0 group-hover:from-blue-400/5 group-hover:via-blue-400/10 group-hover:to-blue-400/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-12">
            {partners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to partner group ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t border-white/10">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
            <div className="text-white/70 text-sm md:text-base">Active Partners</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">15+</div>
            <div className="text-white/70 text-sm md:text-base">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">98%</div>
            <div className="text-white/70 text-sm md:text-base">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">10+</div>
            <div className="text-white/70 text-sm md:text-base">Years Experience</div>
          </div>
        </div>
      </div>
    </section>
  );
}