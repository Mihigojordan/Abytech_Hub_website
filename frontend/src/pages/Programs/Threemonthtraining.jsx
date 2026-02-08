import React, { useEffect, useState } from "react";
import Header from "../../components/header";

const ThreeMonthTraining = () => {
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
      <Header title="3 Month Training" path="training/three-months" />

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
            PROFESSIONAL TRACK
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
            3 Month Training
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto">
            Comprehensive full-stack development training for aspiring developers
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
              Our comprehensive 3 month training program is designed to transform complete beginners 
              into job-ready developers with industry-relevant skills and a professional portfolio.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Duration</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">12 Weeks</p>
              <p className="text-gray-600">Comprehensive</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Schedule</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">Mon-Fri</p>
              <p className="text-gray-600">6 PM - 9 PM</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Class Size</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">Max 20</p>
              <p className="text-gray-600">Students per batch</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Focus</h3>
              <p className="text-4xl font-bold text-[#ff5a00] mb-2">100%</p>
              <p className="text-gray-600">Hands-on</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&h=600&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        <div className="container mx-auto px-4 z-10 text-center text-white">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">
            Build Professional-Grade Applications
          </h3>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            From frontend to backend, become a complete developer
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
              A structured learning path that takes you from beginner to professional
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-8">
            {/* Month 1: Frontend Fundamentals */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Month 1: Frontend Fundamentals
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Topics Covered:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>HTML5, CSS3 & Modern Layouts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>JavaScript ES6+ & DOM Manipulation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>React.js & Component Architecture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>State Management & Hooks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Responsive Design & Tailwind CSS</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Projects:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>E-commerce Product Page</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Weather Dashboard App</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Task Management Application</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Month 2: Backend Development */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Month 2: Backend Development
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Topics Covered:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Node.js & Express.js</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>RESTful API Design</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Database Design (SQL & NoSQL)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Authentication & Authorization</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Server-Side Rendering</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Projects:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Blog Platform with CMS</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>RESTful API for Mobile App</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>User Authentication System</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Month 3: Full-Stack & Deployment */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Month 3: Full-Stack & Deployment
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Topics Covered:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Full-Stack Integration</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Testing (Unit, Integration, E2E)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>DevOps & CI/CD Pipelines</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Cloud Deployment (AWS/Azure)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">•</span>
                          <span>Performance Optimization</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Projects:</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Social Media Platform</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#ff5a00]">✓</span>
                          <span>Real-time Chat Application</span>
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
              <div className="text-6xl mb-4">⚛️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">React Mastery</h3>
              <p className="text-gray-700">Build modern SPAs with React</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Backend APIs</h3>
              <p className="text-gray-700">Create scalable REST APIs</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🗄️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Database Design</h3>
              <p className="text-gray-700">SQL and NoSQL databases</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Authentication</h3>
              <p className="text-gray-700">Secure user systems</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">☁️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Cloud Deployment</h3>
              <p className="text-gray-700">Deploy to AWS/Azure</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Testing</h3>
              <p className="text-gray-700">Write comprehensive tests</p>
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
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">500+</div>
              <div className="text-xl md:text-2xl">Graduates</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">92%</div>
              <div className="text-xl md:text-2xl">Employed Within 3 Months</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">4.9/5</div>
              <div className="text-xl md:text-2xl">Student Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">$60K</div>
              <div className="text-xl md:text-2xl">Average Starting Salary</div>
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
                <div className="text-6xl font-bold text-[#ff5a00] mb-4">$3,500</div>
                <p className="text-2xl text-gray-700">One-time payment or flexible installments</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">What's Included:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>12 weeks of comprehensive training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Live coding sessions & workshops</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Real-world projects & portfolio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Code reviews by senior developers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Career services & job placement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Lifetime access to course materials</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-xl">
                  <h4 className="text-xl font-bold text-gray-800 mb-3">Bonus Benefits:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>3 months post-graduation support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Mock interviews & salary negotiation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>LinkedIn profile optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Access to job board & hiring partners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Networking events & meetups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#ff5a00]">✓</span>
                      <span>Continued education workshops</span>
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
            Transform Your Career Today
          </h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto">
            Join thousands of successful graduates who started their tech careers with AbyTech
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

export default ThreeMonthTraining;