import React, { useEffect } from "react";
import { TrendingUp, Users, Award, Target, MapPin, Code, Database, Brain } from "lucide-react";
import Header from "../../components/header";
import Image from '../../assets/images/about-img1.png'

const AboutUs = () => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const stats = [
    {
      icon: <Award className="w-12 h-12" style={{ color: '#ff5a00' }} />,
      number: "4+",
      label: "Years",
      subtitle: "On the market"
    },
    {
      icon: <Users className="w-12 h-12" style={{ color: '#ff5a00' }} />,
      number: "10+",
      label: "Team members",
      subtitle: "Expert professionals"
    },
    {
      icon: <TrendingUp className="w-12 h-12" style={{ color: '#ff5a00' }} />,
      number: "50+",
      label: "Projects",
      subtitle: "Successfully delivered"
    },
    {
      icon: <Target className="w-12 h-12" style={{ color: '#ff5a00' }} />,
      number: "95%",
      label: "Client Satisfaction",
      subtitle: "Happy clients"
    }
  ];

  const locations = [
    {
      city: "Kigali Head Office",
      address: "KG 7 Ave, Kigali Innovation City",
      description: "Our main development hub and headquarters"
    },
    {
      city: "Nyarugenge Branch",
      address: "KN 4 Ave, Downtown Kigali",
      description: "Client consultation and business operations"
    },
    {
      city: "Remera Tech Hub",
      address: "KG 11 Ave, Remera",
      description: "Research and development center"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
 
      <Header title="About Us" path="About Us" />

      {/* Main Content Section */}
      <div className="relative pt-10 pb-4 px-4 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(70, 104, 162, 0.15)' }}></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(70, 104, 162, 0.1)' }}></div>

        <div className="relative max-w-8xl px-8 mx-auto flex flex-col lg:flex-row items-start gap-12">
          {/* Left Side: Illustration */}
          <div className="flex-1">
            <img 
              src={Image}
              alt="Technology and Data Science" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Right Side: Text Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff5a00' }}></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-100" style={{ backgroundColor: '#ff5a00' }}></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-200" style={{ backgroundColor: '#ff5a00' }}></div>
              </div>
              <span className="font-semibold uppercase tracking-wider text-sm" style={{ color: '#ff5a00' }}>
                About AbyTech
              </span>
            </div>

            <h1 className="text-5xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Driving Digital Transformation
              <br />
              <span style={{ color: '#ff5a00' }} className="text-4xl">
                Through Technology & Data Science
              </span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              AbyTech is Rwanda's leading technology and data science company, specializing in innovative software solutions, artificial intelligence, and data analytics. Founded in 2021, we've grown from a passionate startup to a trusted technology partner for businesses across East Africa.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Our mission is to empower organizations through cutting-edge technology, helping them make data-driven decisions, automate processes, and achieve digital excellence. We combine technical expertise with deep industry knowledge to deliver solutions that drive real business value.
            </p>

            {/* Compact Stats */}
          
          </div>
        </div>
      </div>

      {/* Who We Are Section */}
      <div className="relative px-4 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are a dynamic team of software engineers, data scientists, AI specialists, and business consultants dedicated to solving complex problems through technology innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To become East Africa's premier technology partner, recognized for delivering innovative solutions that transform businesses and drive economic growth across the region.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To empower organizations with cutting-edge technology solutions, enabling data-driven decision making, process automation, and digital transformation for sustainable success.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Values</h3>
              <p className="text-gray-600">
                Innovation excellence, client success, technical mastery, ethical practices, continuous learning, collaborative teamwork, and commitment to quality in every project.
              </p>
            </div>
          </div>

          {/* Additional Content */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">Why Choose AbyTech?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">✓</span>
                    </div>
                    <span>Expert team with extensive experience in AI, ML, and cloud technologies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">✓</span>
                    </div>
                    <span>Proven track record of delivering scalable, high-performance solutions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">✓</span>
                    </div>
                    <span>Agile development methodology ensuring rapid delivery and flexibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">✓</span>
                    </div>
                    <span>End-to-end support from consultation to deployment and maintenance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">✓</span>
                    </div>
                    <span>Cost-effective solutions tailored to your business needs and budget</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-4">Our Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">50+</div>
                    <div className="text-sm opacity-90">Projects Delivered</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">95%</div>
                    <div className="text-sm opacity-90">Client Satisfaction</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">30+</div>
                    <div className="text-sm opacity-90">Enterprise Clients</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">80%</div>
                    <div className="text-sm opacity-90">Repeat Business</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Expertise Section */}
      <div className="relative px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Expertise</h2>
            <p className="text-lg text-gray-600">
              Comprehensive technology solutions across multiple domains
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Software Development</h3>
              <p className="text-gray-600 text-sm">
                Custom web and mobile applications, enterprise software, API development, cloud solutions, and system integration services.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Analytics</h3>
              <p className="text-gray-600 text-sm">
                Business intelligence, data visualization, predictive analytics, data warehousing, and advanced statistical modeling.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI & Machine Learning</h3>
              <p className="text-gray-600 text-sm">
                Natural language processing, computer vision, recommendation systems, chatbots, and intelligent automation solutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Where to Find Us */}
      <div className="relative px-4 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Where You Can Find Us</h2>
            <p className="text-lg text-gray-600">
              Visit our offices across Kigali or reach out to discuss your next project
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff5a00' }}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{location.city}</h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#ff5a00' }} />
                    <span className="text-sm">{location.address}</span>
                  </p>
                  <p className="text-sm text-gray-500 italic">{location.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative px-10 pb-15  p-10">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to bottom right, rgba(70, 104, 162, 0.05), rgba(70, 104, 162, 0.05))' }}></div>
                
                <div className="relative">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  
                  <div className="text-lg font-semibold text-gray-700 mb-1">
                    {stat.label}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {stat.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section with Images */}
      <div className="relative px-10 pb-10">
        <div className="max-w-8xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration Side */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-2xl" style={{ background: 'linear-gradient(to right, rgba(70, 104, 162, 0.2), rgba(70, 104, 162, 0.2))' }}></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
                <div className="space-y-6 h-[530px]">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 rounded-2xl h-[300px] relative overflow-hidden group">
                      <img 
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80" 
                        alt="Data analytics dashboard" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                    </div>
                    <div className="rounded-2xl h-[300px] overflow-hidden group">
                      <img 
                        src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80" 
                        alt="Team collaboration" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl h-[230px] overflow-hidden group">
                      <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" 
                        alt="Data visualization" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="col-span-2 rounded-2xl h-[230px] overflow-hidden group relative">
                      <img 
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80" 
                        alt="Development team" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Building Tomorrow's Solutions Today
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Founded with a passion for technology and innovation, AbyTech has established itself as a trusted partner for digital transformation across Rwanda and East Africa.
                </p>
              </div>

              <div className="space-y-6">
                <div className="group flex gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#ff5a00' }}>
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation-Driven</h3>
                    <p className="text-gray-600">
                      Leveraging cutting-edge technologies including AI, machine learning, and cloud computing to deliver next-generation solutions.
                    </p>
                  </div>
                </div>

                <div className="group flex gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#ff5a00' }}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Client-Focused</h3>
                    <p className="text-gray-600">
                      Building long-term partnerships through exceptional service, transparent communication, and solutions that exceed expectations.
                    </p>
                  </div>
                </div>

                <div className="group flex gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: '#ff5a00' }}>
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Results-Oriented</h3>
                    <p className="text-gray-600">
                      Committed to delivering measurable business value through efficient development, rigorous testing, and continuous optimization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;