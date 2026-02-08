import React, { useEffect, useState } from "react";
import Header from "../../components/header";

const Apprenticeship = () => {
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
      <Header title="Tech Apprenticeship Program" path="training/apprenticeship" />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-white text-center">
          <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            EARN WHILE YOU LEARN
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
            Tech Apprenticeship Program
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto">
            Real-world experience with paid training and guaranteed job placement
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-[#ff5a00] hover:bg-[#ff7a30] text-white px-12 py-5 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Enroll Now
            </button>
            <button className="border-2 border-white text-white px-12 py-5 rounded-full text-lg font-bold hover:bg-white hover:text-[#ff5a00] transition-all duration-300 transform hover:scale-105">
              Download Curriculum
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Program Overview */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] mb-6">
              Program Overview
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Our apprenticeship program combines classroom learning with on-the-job training at leading tech companies. Receive a monthly stipend while gaining real-world experience and earning industry certifications. Guaranteed job offer upon successful completion.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Duration</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">12 Months</p>
              <p className="text-gray-600">Comprehensive</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Schedule</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">Full-time</p>
              <p className="text-gray-600">Mon-Fri, 9 AM - 5 PM</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Class Size</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">Max 10</p>
              <p className="text-gray-600">Students per batch</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Investment</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">FREE + Stipend</p>
              <p className="text-gray-600">Total program cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&h=600&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        <div className="container mx-auto px-4 z-10 text-center text-white">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Learn, Earn, and Grow
          </h3>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Get paid while building your career in technology
          </p>
        </div>
      </section>

      {/* Curriculum */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] mb-6">
              Comprehensive Curriculum
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              A structured learning path designed for success
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Months 1-3: Foundation & Bootcamp */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Months 1-3: Foundation & Bootcamp
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Topics Covered:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Programming Fundamentals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Web Development Basics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Database Fundamentals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Git & Version Control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Agile Methodologies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Professional Skills</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Projects:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Portfolio Website</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>CRUD Application</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Team Collaboration Project</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Months 4-8: On-the-Job Training */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Months 4-8: On-the-Job Training
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Topics Covered:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Work with Development Teams</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Real Client Projects</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Code Reviews & Best Practices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Testing & Debugging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>DevOps Practices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Technical Documentation</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Projects:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Production Feature Development</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Bug Fixes & Maintenance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Customer-Facing Solutions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Months 9-12: Specialization & Transition */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Months 9-12: Specialization & Transition
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Topics Covered:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Choose Specialization Track</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Advanced Project Work</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Leadership & Mentoring</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Career Development</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Interview Preparation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Job Offer Negotiation</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Projects:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Lead Feature Development</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Mentorship of New Apprentices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Final Capstone Project</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] mb-6">
              What You'll Master
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Real Experience</h3>
              <p className="text-gray-700">Work on actual projects</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Paid Training</h3>
              <p className="text-gray-700">$2,000/month stipend</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Certifications</h3>
              <p className="text-gray-700">Industry-recognized certs</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Mentorship</h3>
              <p className="text-gray-700">1-on-1 senior developer</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Job Guarantee</h3>
              <p className="text-gray-700">Full-time offer at completion</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Career Growth</h3>
              <p className="text-gray-700">Clear advancement path</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-32 overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=800&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">100%</div>
              <div className="text-xl md:text-2xl">Job Placement</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">$2K</div>
              <div className="text-xl md:text-2xl">Monthly Stipend</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">50+</div>
              <div className="text-xl md:text-2xl">Partner Companies</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">$65K</div>
              <div className="text-xl md:text-2xl">Starting Salary</div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment & Payment */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] mb-6">
                Program Investment
              </h2>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-12 rounded-2xl shadow-2xl">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-[#ff5a00] mb-4">FREE + Stipend</div>
                <p className="text-2xl text-gray-700">Flexible payment options available</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">What's Included:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>12 months paid apprenticeship</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Monthly stipend of $2,000</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Full-time job offer upon completion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Industry certifications included</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Mentorship from senior developers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Professional development training</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">Bonus Benefits:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Health insurance coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Laptop & equipment provided</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Conference attendance opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Networking with industry leaders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Continued education support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Career advancement program</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-600 mb-4">Payment plans available • Scholarships for qualifying students</p>
                <button className="bg-[#ff5a00] hover:bg-[#ff7a30] text-white px-12 py-5 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-xl">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/95 to-[#ff7a30]/95"></div>
        </div>

        <div className="container mx-auto px-4 z-10 relative text-center text-white">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
            Ready to Start Your Journey?
          </h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto">
            Join our program and transform your career with industry-recognized skills
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white text-[#ff5a00] px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105">
              Enroll Now
            </button>
            <button className="border-2 border-white text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white hover:text-[#ff5a00] transition-all duration-300 transform hover:scale-105">
              Schedule a Call
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Apprenticeship;