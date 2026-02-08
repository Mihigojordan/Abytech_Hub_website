import React, { useEffect, useState } from "react";
import Header from "../../components/header";

const AnalysisService = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <Header title="Analysis Services" path="service/analysis" />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-white text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
            Analysis Services
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto">
            Transform your data into actionable insights with our comprehensive
            analysis services
          </p>
          <button className="bg-[#ff5a00] hover:bg-[#ff7a30] text-white px-10 py-5 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl">
            Get Started
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* System Analysis Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00]">
                System Analysis
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Comprehensive evaluation of your IT infrastructure to identify
                bottlenecks, security vulnerabilities, and optimization
                opportunities. Our expert analysts dive deep into your systems
                to uncover hidden inefficiencies and provide actionable
                recommendations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#ff5a00] rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </span>
                  <span className="text-lg text-gray-700">
                    Infrastructure assessment and optimization
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#ff5a00] rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </span>
                  <span className="text-lg text-gray-700">
                    Performance bottleneck identification
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#ff5a00] rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </span>
                  <span className="text-lg text-gray-700">
                    Security vulnerability scanning
                  </span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                alt="System Analysis"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider */}
      <section
        className="relative h-96 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=600&fit=crop')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        <div className="container mx-auto px-4 z-10 text-center text-white">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Data-Driven Decisions
          </h3>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Make informed choices backed by comprehensive data analysis and
            expert insights
          </p>
        </div>
      </section>

      {/* Data Analytics Section */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                alt="Data Analytics"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00]">
                Data Analytics
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Advanced analytics solutions to uncover patterns, trends, and
                insights that drive informed business decisions. Transform your
                raw data into strategic advantage.
              </p>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    Predictive Analytics
                  </h4>
                  <p className="text-gray-700">
                    Forecast future trends and behaviors using machine learning
                    algorithms
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    Real-time Insights
                  </h4>
                  <p className="text-gray-700">
                    Monitor your business metrics with live dashboards and
                    alerts
                  </p>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    Custom Reporting
                  </h4>
                  <p className="text-gray-700">
                    Tailored reports that answer your specific business
                    questions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Consulting Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] mb-6">
              Project Consulting
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Expert guidance throughout your project lifecycle, from planning
              and requirements gathering to implementation and delivery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Strategic Planning",
                description:
                  "Define clear objectives, milestones, and success metrics for your projects",
                icon: "🎯",
              },
              {
                title: "Risk Management",
                description:
                  "Identify and mitigate potential risks before they impact your timeline",
                icon: "🛡️",
              },
              {
                title: "Stakeholder Alignment",
                description:
                  "Keep all parties informed and aligned throughout the project journey",
                icon: "🤝",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-6xl mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-700 text-lg">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax */}
      <section
        className="relative py-32 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1920&h=800&fit=crop')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "500+", label: "Projects Analyzed" },
              { number: "98%", label: "Client Satisfaction" },
              { number: "50+", label: "Expert Analysts" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">
                  {stat.number}
                </div>
                <div className="text-xl md:text-2xl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Intelligence Section */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] text-center mb-16">
              Business Intelligence Solutions
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
                  alt="BI Dashboard"
                  className="rounded-2xl shadow-xl w-full"
                />
                <h3 className="text-3xl font-bold text-gray-800">
                  Interactive Dashboards
                </h3>
                <p className="text-lg text-gray-700">
                  Visualize your data with beautiful, interactive dashboards
                  that provide instant insights into your business performance.
                </p>
              </div>

              <div className="space-y-6">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                  alt="Data Visualization"
                  className="rounded-2xl shadow-xl w-full"
                />
                <h3 className="text-3xl font-bold text-gray-800">
                  Advanced Visualization
                </h3>
                <p className="text-lg text-gray-700">
                  Complex data made simple through charts, graphs, and visual
                  analytics that tell your data's story.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&h=800&fit=crop')",
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/95 to-[#ff7a30]/95"></div>
        </div>

        <div className="container mx-auto px-4 z-10 relative text-center text-white">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            Ready to Transform Your Data?
          </h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto">
            Let's discuss how our analysis services can drive your business
            forward
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white text-[#ff5a00] px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105">
              Get Started Today
            </button>
            <button className="border-2 border-white text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white hover:text-[#ff5a00] transition-all duration-300 transform hover:scale-105">
              View Case Studies
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalysisService;