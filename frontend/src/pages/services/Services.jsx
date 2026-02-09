import React, { useEffect } from "react";
import Header from "../../components/header";
import { Element } from "react-scroll";

const Services = () => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const servicesData = [
    {
      id: "analysis",
      title: "Data Analysis",
      description: "Transform your data into actionable insights with our comprehensive analysis services.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      features: [
        "Infrastructure assessment and optimization",
        "Performance bottleneck identification",
        "Security vulnerability scanning",
        "Predictive Analytics & Real-time Insights"
      ]
    },
    {
      id: "cybersecurity",
      title: "Cyber Security",
      description: "Comprehensive security solutions to protect your digital assets and stay ahead of cyber threats.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
      features: [
        "Real-time threat monitoring",
        "Penetration testing & Security Audits",
        "Endpoint protection & Network Security",
        "Security compliance (GDPR, HIPAA)"
      ]
    },
    {
      id: "software-development",
      title: "Software Development",
      description: "Custom software solutions tailored to your business needs, from mobile apps to enterprise systems.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
      features: [
        "Full-stack web & mobile development",
        "Scalable architecture design",
        "API development & Microservices",
        "Legacy system modernization"
      ]
    },
    {
      id: "database-management",
      title: "Database Management",
      description: "Expert database solutions for optimal performance, reliability, and secure data storage.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      features: [
        "Normalized schema design & architecture",
        "Performance tuning & Query optimization",
        "Database migration & Replication",
        "Automated backup & Security solutions"
      ]
    },
    {
      id: "ui-ux-design",
      title: "UI/UX Design",
      description: "Create exceptional user experiences that delight users and drive business results.",
      image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=600&fit=crop",
      features: [
        "User research & Persona development",
        "Wireframing & High-fidelity prototyping",
        "Design systems & Component libraries",
        "Accessibility & Visual identity systems"
      ]
    },
    {
      id: "web-hosting",
      title: "Web & App Hosting",
      description: "Reliable hosting solutions and seamless application deployment services.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      features: [
        "Shared & VPS hosting solutions",
        "App Store & Play Store publishing",
        "99.9% uptime guarantee & Free SSL",
        "24/7 technical support & Monitoring"
      ]
    },
    {
      id: "iot-solutions",
      title: "IoT Solutions",
      description: "Connect and control your devices with intelligent IoT and automation solutions.",
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop",
      features: [
        "Smart home & Building automation",
        "Industrial IoT (IIoT) solutions",
        "Predictive maintenance & Asset tracking",
        "Wearable tech & Sensor networks"
      ]
    },
    {
      id: "devops",
      title: "DevOps & Automation",
      description: "Streamline your development lifecycle with modern DevOps and automation practices.",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop",
      features: [
        "CI/CD pipeline setup & Automation",
        "Infrastructure as Code (Terraform/Ansible)",
        "Container orchestration (K8s/Docker)",
        "Automated testing & Release management"
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 min-h-screen">
      <Header title="Our Services" path="service" />

      {/* Hero Section */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Everything You Need to <span className="text-[#ff5a00]">Succeed</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            Consolidated technology solutions to drive your business forward. Explore our wide range of services designed for the modern digital era.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff5a00]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </section>

      {/* Services Sections */}
      <div className="container mx-auto px-4 py-20">
        {servicesData.map((service, index) => (
          <Element name={service.id} key={service.id} className="mb-32 last:mb-0">
            <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
              <div className="flex-1 space-y-8">
                <div className="inline-block bg-[#ff5a00] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                  SERVICE 0{index + 1}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                  {service.title}
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  {service.description}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <span className="w-6 h-6 bg-[#ff5a00] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        ✓
                      </span>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className="bg-[#ff5a00] hover:bg-[#ff7a30] text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg group">
                  Get Started 
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              <div className="flex-1 w-full lg:w-auto">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-[#ff5a00] to-purple-600 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3] transform transition-transform group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </Element>
        ))}
      </div>

      {/* Unified Stats Section */}
      <section className="py-24 bg-slate-900 text-white mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { number: "500+", label: "Projects Delivered" },
              { number: "98%", label: "Satisfaction Rate" },
              { number: "100+", label: "Expert Engineers" },
              { number: "24/7", label: "Global Support" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-4xl md:text-6xl font-bold text-[#ff5a00]">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-lg uppercase tracking-widest font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unified CTA */}
      <section className="py-32 bg-white text-center rounded-t-[4rem] -mt-10 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 max-w-4xl mx-auto">
            Ready to Build Your <span className="text-[#ff5a00]">Digital Future</span>?
          </h2>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Our experts are standing by to help you choose the right combination of services for your unique goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-[#ff5a00] text-white px-12 py-5 rounded-full font-bold text-xl hover:bg-slate-800 transition-all shadow-2xl transform hover:scale-105">
              Book a Free Consultation
            </button>
            <button className="border-2 border-slate-200 text-slate-800 px-12 py-5 rounded-full font-bold text-xl hover:bg-slate-50 transition-all">
              Send an Inquiry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
