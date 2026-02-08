import React from 'react';

export default function AbytechWorkshop() {
  const scheduleItems = [
    {
      time: "09:00 AM",
      title: "Opening Circle",
      description: "Introductions and setting expectations",
      icon: "☀️"
    },
    {
      time: "09:45 AM",
      title: "Development Environment Setup",
      description: "Configuring IDEs, tools, and establishing best practices",
      icon: "💻"
    },
    {
      time: "10:45 AM",
      title: "Code Review Session",
      description: "Learning effective code review techniques",
      icon: "📋"
    },
    {
      time: "11:45 AM",
      title: "Hands-on Development Sprint",
      description: "Build a real-world application module",
      icon: "💡"
    },
    {
      time: "03:30 PM",
      title: "Architecture Presentations",
      description: "Team presentations and technical discussions",
      icon: "🎯"
    },
    {
      time: "05:00 PM",
      title: "Closing Circle",
      description: "Recap, Q&A, and networking",
      icon: "✅"
    }
  ];

  const trainingPillars = [
    "Building industry-standard software solutions with modern best practices and methodologies.",
    "Conveying a practical understanding of software architecture, testing, and deployment strategies.",
    "Helping you master version control, CI/CD pipelines, and collaborative development workflows."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#ff5a00] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#ff5a00] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-8xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[#ff5a00]">🚀</span>
            <span className="text-gray-400 text-sm">Abytech Developer Workshop</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Become a Master of Software Development
            <br />
            As you learn to Build with <span className="text-[#ff5a00]">Excellence</span>
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-gray-300 leading-relaxed">
                As software development continues to evolve, we all need to keep educating ourselves on modern practices, 
                tools, and methodologies. At Abytech, we facilitate comprehensive workshops, bootcamps, and seminars to 
                support developers and their teams to stay current as technology advances.
              </p>
            </div>

            {/* Training Pillars */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-[#ff5a00]">
                Our Training Focus: The core of our training consists of three pillars:
              </h2>
              <div className="space-y-4">
                {trainingPillars.map((pillar, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-[#ff5a00] mt-1">✓</span>
                    <p className="text-gray-300">{pillar}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guide Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-3 text-[#ff5a00]">
                Your Guide: Senior Developer
              </h3>
              <p className="text-gray-300 italic mb-4">
                "Software development isn't about writing code—it's about crafting solutions that make a difference. 
                Join me to discover how excellence in development can transform your career."
              </p>
              <p className="text-gray-400 text-sm">
                Lead Software Architect and trainer at Abytech with 15+ years experience in Full-Stack Development, 
                Cloud Architecture, and Agile Methodologies.
              </p>
            </div>
          </div>

          {/* Right Column - Training Modules */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-[#ff5a00]">
              Training Modules
            </h2>
            <div className="space-y-3">
              {scheduleItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-[#ff5a00]/50 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="flex items-start gap-4">
                 
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="bg-[#ff5a00] hover:bg-[#ff6a10] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#ff5a00]/30">
            Speak with us about booking a development training
          </button>
        </div>
      </div>
    </div>
  );
}