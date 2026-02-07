import Header from "../../components/header";

const SoftwareDevelopmentService = () => {
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
      <Header title="Software Development" path="service/software-development" />

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&h=1080&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-white text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
            Software Development
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto">
            Custom software solutions tailored to your business needs
          </p>
          <button className="bg-[#ff5a00] hover:bg-[#ff7a30] text-white px-10 py-5 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl">
            Get Started
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Section 1 */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00]">
                Custom Software Development
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Bespoke software solutions designed specifically for your business processes and requirements. From concept to deployment, we build software that solves your unique challenges.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#ff5a00] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  <span className="text-lg text-gray-700">Full-stack application development</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#ff5a00] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  <span className="text-lg text-gray-700">Scalable architecture design</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#ff5a00] rounded-full flex items-center justify-center text-white font-bold">✓</span>
                  <span className="text-lg text-gray-700">Modern technology stack</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop" alt="Custom Software Development" className="rounded-2xl shadow-2xl w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547658719-da2b51169166?w=1920&h=600&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        <div className="container mx-auto px-4 z-10 text-center text-white">
          <h3 className="text-4xl md:text-5xl font-bold mb-6">Innovation in Code</h3>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">Building tomorrow's solutions with cutting-edge technology</p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop" alt="Mobile & Web Applications" className="rounded-2xl shadow-2xl w-full" />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00]">
                Mobile & Web Applications
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Native and cross-platform applications that deliver exceptional user experiences across all devices and platforms.
              </p>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">iOS & Android</h4>
                  <p className="text-gray-700">Native mobile applications for peak performance</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Progressive Web Apps</h4>
                  <p className="text-gray-700">Modern web apps that work offline and feel native</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Cross-Platform</h4>
                  <p className="text-gray-700">React Native and Flutter for cost-effective development</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-[#ff5a00] mb-6">Our Services</h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Comprehensive solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-6xl mb-6">🏢</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Enterprise Solutions</h3>
              <p className="text-gray-700 text-lg">Scalable systems for large organizations</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-6xl mb-6">🔌</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">API Development</h3>
              <p className="text-gray-700 text-lg">RESTful and GraphQL API services</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-6xl mb-6">🔄</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Legacy Modernization</h3>
              <p className="text-gray-700 text-lg">Update outdated systems with modern tech</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-6xl mb-6">🔧</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Microservices</h3>
              <p className="text-gray-700 text-lg">Distributed architecture for scalability</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-6xl mb-6">⚙️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">DevOps Integration</h3>
              <p className="text-gray-700 text-lg">CI/CD and automated deployment</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Quality Assurance</h3>
              <p className="text-gray-700 text-lg">Comprehensive testing and QA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax */}
      <section className="relative py-32 overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&h=1080&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">200+</div>
              <div className="text-xl md:text-2xl">Projects Delivered</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">95%</div>
              <div className="text-xl md:text-2xl">Client Retention</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">10+</div>
              <div className="text-xl md:text-2xl">Years Experience</div>
            </div>
            <div className="space-y-2">
              <div className="text-6xl md:text-7xl font-bold text-[#ff5a00]">50+</div>
              <div className="text-xl md:text-2xl">Expert Developers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&h=800&fit=crop')", backgroundAttachment: "fixed", backgroundPosition: "center", backgroundSize: "cover" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/95 to-[#ff7a30]/95"></div>
        </div>

        <div className="container mx-auto px-4 z-10 relative text-center text-white">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">Let's Build Something Amazing</h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto">Transform your ideas into powerful software solutions</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-white text-[#ff5a00] px-12 py-6 rounded-full font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105">
              Get Started
            </button>
            <button className="border-2 border-white text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-white hover:text-[#ff5a00] transition-all duration-300 transform hover:scale-105">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SoftwareDevelopmentService;