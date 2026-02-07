import React from 'react'

function Slide() {
  const features = [
    {
      company: "ANALYTICS",
      icon: "📊",
      title: "Real-time data insights driving business decisions",
      description: "Transform raw data into actionable insights with our advanced analytics platform. Monitor KPIs, track performance metrics.",
    },
    {
      company: "SECURITY",
      icon: "🔒",
      title: "Enterprise-grade security protecting your assets",
      description: "Multi-layer security infrastructure with end-to-end encryption, threat detection, and compliance management to keep your business safe 24/7.",
    },
    {
      company: "AUTOMATION",
      icon: "⚡",
      title: "Intelligent automation streamlining workflows",
      description: "Automate repetitive tasks and optimize operations with AI-powered workflows. Save time, reduce errors, and boost team productivity.",
    },
    {
      company: "CLOUD",
      icon: "☁️",
      title: "Scalable cloud infrastructure for growth",
      description: "Deploy, scale, and manage applications effortlessly with our robust cloud infrastructure. Pay only for what you use and scale instantly.",
    },
    {
      company: "SUPPORT",
      icon: "💬",
      title: "24/7 expert support keeping you running",
      description: "Round-the-clock technical support from certified experts. Get help whenever you need it with our dedicated support team.",
    },
    {
      company: "INTEGRATION",
      icon: "🔗",
      title: "Seamless integration with your tools",
      description: "Connect all your favorite tools and platforms in one place. Our API-first approach makes integration simple and powerful.",
    }
  ];

  // Duplicate features for seamless loop
  const topRowFeatures = [...features, ...features];
  const bottomRowFeatures = [...features, ...features];

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white py-10 overflow-hidden">
      <style>
        {`
          @keyframes slideLeft {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          
          @keyframes slideRight {
            from {
              transform: translateX(-50%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          .animate-slide-left {
            animation: slideLeft 50s linear infinite;
          }
          
          .animate-slide-right {
            animation: slideRight 50s linear infinite;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 mb-10">
        <h2 className="text-5xl font-bold text-center text-slate-800 mb-4">
          Everything you need to succeed
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Powerful features designed to help your business thrive in the digital age
        </p>
      </div>

      {/* Top Row - Sliding Left - Shows 2 cards */}
      <div className="mb-8">
        <div className="flex animate-slide-left">
          {topRowFeatures.map((feature, index) => (
            <div
              key={`top-${index}`}
              className="flex-shrink-0 w-[600px] mx-4"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 h-80 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[#ff5a00] text-sm font-semibold tracking-widest">
                      {feature.company}
                    </div>
                 
                  </div>
                  <h3 className="text-white text-3xl font-bold mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-6">
                  <button className="bg-[#ff5a00] hover:bg-[#ff5a00] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
                    Learn More
                  </button>
                  <div className="text-gray-500 text-sm">
                    Available now
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row - Sliding Right - Shows 2 cards */}
      <div>
        <div className="flex animate-slide-right">
          {bottomRowFeatures.map((feature, index) => (
            <div
              key={`bottom-${index}`}
              className="flex-shrink-0 w-[600px] mx-4"
            >
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 h-80 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[#ff5a00] text-sm font-semibold tracking-widest">
                      {feature.company}
                    </div>
                 
                  </div>
                  <h3 className="text-white text-3xl font-bold mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-6">
                  <button className="bg-[#ff5a00] hover:bg-slate-800 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors">
                    Learn More
                  </button>
                  <div className="text-gray-500 text-sm">
                    Available now
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Slide