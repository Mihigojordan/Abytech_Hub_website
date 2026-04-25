import React, { useState } from 'react';
import { Briefcase, TrendingUp, Settings, Zap, Target, Award } from 'lucide-react';
import Image1 from '../../assets/images/image3.jpg'
import Image3 from '../../assets/images/image5.jpg'
import Image4 from '../../assets/images/image9.png'
import Image5 from '../../assets/images/image7.png'
import Image6 from '../../assets/images/image8.png'

function Specialization() {
  const [activeTab, setActiveTab] = useState('Performance Improvement');

  const specializations = [
    { name: 'Business Strategy',        icon: Briefcase },
    { name: 'Market Analysis',          icon: TrendingUp },
    { name: 'Process Optimization',     icon: Settings },
    { name: 'Performance Improvement',  icon: Zap },
    { name: 'Entrepreneurial Guidance', icon: Target },
    { name: 'Organizational Excellence',icon: Award },
  ];

  const content = {
    'Business Strategy': {
      title: 'Strategic Business Solutions',
      description: "We develop comprehensive, data-driven business strategies tailored to your unique goals, market conditions, and competitive landscape. Our approach includes long-term vision planning, SWOT analysis, growth roadmaps, and actionable implementation plans that drive sustainable growth, increase market share, and deliver measurable competitive advantage.",
      image: Image4,
    },
    'Market Analysis': {
      title: 'In-Depth Market Insights',
      description: "Unlock powerful insights with our thorough market analysis services. We conduct detailed research on industry trends, customer demographics, buying behaviors, competitor positioning, and emerging opportunities. Using advanced data analytics, surveys, and competitive intelligence tools, we deliver clear, actionable reports.",
      image: Image1,
    },
    'Process Optimization': {
      title: 'Streamline Your Operations',
      description: "Transform your business operations through systematic process optimization. We map your current workflows, identify bottlenecks and inefficiencies, and redesign processes using Lean, Six Sigma, and automation techniques. Our solutions reduce operational costs, shorten cycle times, and enhance quality.",
      image: Image3,
    },
    'Performance Improvement': {
      title: 'Elevate Your Business Performance',
      description: "Achieve breakthrough performance with our holistic improvement programs. We assess your teams, technology stack, and talent management practices to uncover hidden potential. Our services include KPI development, performance benchmarking, process reengineering, and change management.",
      image: Image1,
    },
    'Entrepreneurial Guidance': {
      title: 'Expert Entrepreneurial Mentorship',
      description: "Launch and scale your venture with confidence through our expert mentorship. We provide personalized guidance on business planning, funding strategies, go-to-market plans, scaling operations, and risk management. Drawing from years of entrepreneurial experience, our mentors offer practical advice and strategic support.",
      image: Image5,
    },
    'Organizational Excellence': {
      title: 'Build High-Performing Organizations',
      description: "Create a culture of excellence with our organizational development services. We help you design and implement best practices in leadership development, team dynamics, organizational structure, and change management. Our programs focus on building strong company culture and developing future leaders.",
      image: Image6,
    },
  };

  const activeContent = content[activeTab];

  return (
    <div className="w-full py-16 px-4" style={{ backgroundColor: "#0d1117" }}>
      <div className="max-w-8xl px-6 mx-auto">

        {/* ── Header ───────────────────────────────────── */}
        <div className="mb-12">
          <p className="text-[#ff5a00] uppercase text-xs font-bold tracking-[0.28em] mb-4">
            SPECIALIZATION
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white max-w-xl leading-tight"
              style={{ fontFamily: "Roboto Condensed, sans-serif" }}
            >
              What Should Our Company Do for You
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-xl">
              Select the focus area that best matches your goals. Each track combines
              hands-on consulting, design, and implementation so impact is immediate.
            </p>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-10">
          {specializations.map((spec, i) => {
            const Icon = spec.icon;
            const active = activeTab === spec.name;
            return (
              <button
                key={i}
                onClick={() => setActiveTab(spec.name)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-300"
                style={{
                  background: active ? "#ff5a00" : "rgba(255,255,255,0.04)",
                  color: active ? "#ffffff" : "#9ca3af",
                  border: active
                    ? "1px solid #ff5a00"
                    : "1px solid rgba(255,255,255,0.08)",
                  transform: active ? "scale(1.04)" : "scale(1)",
                }}
              >
                <Icon className="w-4 h-4" />
                {spec.name}
              </button>
            );
          })}
        </div>

        {/* ── Content area ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Image card */}
          <div
            className="rounded-2xl p-5 overflow-hidden"
            style={{
              background: "#141c24",
              border: "1px solid rgba(255,90,0,0.12)",
            }}
          >
            <div className="relative rounded-xl overflow-hidden h-[420px]">
              <img
                src={activeContent.image}
                alt={activeTab}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {/* Orange accent bar at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: "#ff5a00" }}
              />
            </div>
          </div>

          {/* Text card */}
          <div
            className="rounded-2xl p-8 flex flex-col justify-center"
            style={{
              background: "#141c24",
              border: "1px solid rgba(255,90,0,0.12)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "rgba(255,90,0,0.15)" }}
              >
                <Zap className="w-5 h-5 text-[#ff5a00]" />
              </div>
              <span className="text-[#ff5a00] font-bold text-sm uppercase tracking-widest">
                {activeTab}
              </span>
            </div>

            <h4
              className="text-2xl md:text-3xl font-black text-white mb-5 leading-tight"
              style={{ fontFamily: "Roboto Condensed, sans-serif" }}
            >
              {activeContent.title}
            </h4>
            <p className="text-gray-400 text-base leading-relaxed">
              {activeContent.description}
            </p>

            <div className="mt-8">
              <a
                href="/about"
                className="inline-flex items-center gap-2 bg-[#ff5a00] hover:bg-[#e04e00] text-white font-bold px-7 py-3 text-sm uppercase tracking-widest transition-all duration-300 group"
              >
                Learn More
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Specialization;
