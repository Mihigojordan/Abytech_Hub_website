import React, { useState, useEffect } from 'react'

function MissionVisionPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80" 
            alt="Digital transformation"
            className="w-full h-[120vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/85 to-[#ff5a00]/60"></div>
        </div>
        
        {/* Content */}
        <div 
          className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: 1 - scrollY / 500,
          }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in">
            Our Mission & Vision
          </h1>
          <div className="w-32 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
          <p className="text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Shaping Rwanda's Digital Future, One Innovation at a Time
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Mission Section with Parallax */}
      <section className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div 
                className="absolute -top-12 -left-12 w-64 h-64 bg-[#ff5a00] rounded-full opacity-10"
                style={{
                  transform: `translateY(${(scrollY - 600) * 0.1}px)`,
                }}
              ></div>
              <div className="relative z-10">
                <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
                  Our Mission
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8">
                  Empowering Rwanda Through Technology
                </h2>
                <div className="w-24 h-1 bg-[#ff5a00] mb-8"></div>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Our mission is to become a leading catalyst for technological and economic transformation in Rwanda. We bridge the gap between international markets and local expertise, creating a robust ecosystem where innovation flourishes, businesses thrive, and communities prosper.
                  </p>
                  <p>
                    We are committed to developing world-class technology solutions while simultaneously nurturing the next generation of Rwandan tech talent. Through rigorous training, real-world project experience, and continuous mentorship, we ensure that our workforce remains at the forefront of technological advancements.
                  </p>
                  <p>
                    By 2030, we envision Abytech as a cornerstone of Rwanda's digital economy—a company that not only delivers exceptional technology services but also serves as a launchpad for hundreds of successful tech careers.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div 
                className="overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  transform: `translateY(${(scrollY - 700) * 0.15}px)`,
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
                  alt="Team collaboration"
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#ff5a00]/20 rounded-lg"
                style={{
                  transform: `translateY(${(scrollY - 700) * -0.1}px)`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider 1 */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 1200) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80" 
            alt="Modern office"
            className="w-full h-[150%] object-cover"
          />
          <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              "Technology is best when it brings people together"
            </h3>
            <p className="text-xl opacity-90">- Matt Mullenweg</p>
          </div>
        </div>
      </section>

      {/* Vision Section with Parallax */}
      <section className="relative py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div 
                className="overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  transform: `translateY(${(scrollY - 1800) * 0.15}px)`,
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80" 
                  alt="Vision for the future"
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div 
                className="absolute -top-8 -left-8 w-48 h-48 bg-[#ff5a00]/20 rounded-lg"
                style={{
                  transform: `translateY(${(scrollY - 1800) * -0.1}px)`,
                }}
              ></div>
            </div>

            <div className="relative order-1 md:order-2">
              <div 
                className="absolute -top-12 -right-12 w-64 h-64 bg-[#ff5a00] rounded-full opacity-10"
                style={{
                  transform: `translateY(${(scrollY - 1800) * 0.1}px)`,
                }}
              ></div>
              <div className="relative z-10">
                <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
                  Our Vision
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8">
                  Leading Rwanda's Digital Renaissance
                </h2>
                <div className="w-24 h-1 bg-[#ff5a00] mb-8"></div>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    We envision a future where Rwanda stands as a beacon of technological innovation in Africa—a nation where local talent competes on the global stage, where world-class digital solutions are created daily, and where technology drives sustainable economic growth.
                  </p>
                  <p>
                    Abytech aspires to be at the heart of this transformation. We see ourselves as more than a technology company; we are architects of opportunity, builders of careers, and partners in Rwanda's journey toward becoming a knowledge-based economy.
                  </p>
                  <p>
                    Our vision extends beyond business success. We dream of a Rwanda where every young person with talent and ambition has access to quality tech education, where innovation hubs thrive in every city, and where "Made in Rwanda" is synonymous with technological excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider 2 */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 2600) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" 
            alt="Kigali skyline"
            className="w-full h-[150%] object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Building Tomorrow's Technology Leaders Today
            </h3>
          </div>
        </div>
      </section>

      {/* Strategic Pillars Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Strategic Pillars
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The foundation upon which we build our mission and realize our vision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "💼",
                title: "Excellence in Service",
                description: "Delivering world-class technology solutions that exceed client expectations and drive business growth.",
                transform: 0.1
              },
              {
                icon: "🎓",
                title: "Talent Development",
                description: "Investing in comprehensive training programs that transform talented individuals into skilled professionals.",
                transform: 0.15
              },
              {
                icon: "🌍",
                title: "Community Impact",
                description: "Contributing to Rwanda's digital ecosystem through knowledge sharing, partnerships, and social responsibility.",
                transform: 0.2
              }
            ].map((pillar, index) => (
              <div 
                key={index}
                className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                style={{
                  transform: `translateY(${(scrollY - 3000) * pillar.transform}px)`,
                }}
              >
                <div className="text-6xl mb-6">{pillar.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                <p className="text-gray-700 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Goals Timeline Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Our Roadmap to 2030
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ambitious goals that will shape Rwanda's digital future
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                year: "2025",
                goal: "Train 200+ developers",
                icon: "🎯",
              },
              {
                year: "2027",
                goal: "Expand to 3 cities",
                icon: "🏢",
              },
              {
                year: "2028",
                goal: "50+ international clients",
                icon: "🌐",
              },
              {
                year: "2030",
                goal: "1000+ tech careers launched",
                icon: "🚀",
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center"
                style={{
                  transform: `translateY(${(scrollY - 3600) * (0.1 + index * 0.05)}px)`,
                }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-[#ff5a00] text-3xl font-bold mb-3">{item.year}</div>
                <p className="text-lg">{item.goal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Areas Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Where We Make an Impact
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div 
              className="relative overflow-hidden rounded-xl shadow-xl group"
              style={{
                transform: `translateY(${(scrollY - 4200) * 0.1}px)`,
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" 
                alt="Education impact"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Education</h3>
                  <p className="text-gray-200">Transforming aspiring developers into industry-ready professionals</p>
                </div>
              </div>
            </div>

            <div 
              className="relative overflow-hidden rounded-xl shadow-xl group"
              style={{
                transform: `translateY(${(scrollY - 4200) * 0.15}px)`,
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" 
                alt="Innovation impact"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Innovation</h3>
                  <p className="text-gray-200">Building cutting-edge solutions for global challenges</p>
                </div>
              </div>
            </div>

            <div 
              className="relative overflow-hidden rounded-xl shadow-xl group"
              style={{
                transform: `translateY(${(scrollY - 4400) * 0.1}px)`,
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80" 
                alt="Economic impact"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Economic Growth</h3>
                  <p className="text-gray-200">Creating sustainable employment and business opportunities</p>
                </div>
              </div>
            </div>

            <div 
              className="relative overflow-hidden rounded-xl shadow-xl group"
              style={{
                transform: `translateY(${(scrollY - 4400) * 0.15}px)`,
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80" 
                alt="Community impact"
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">Community</h3>
                  <p className="text-gray-200">Strengthening Rwanda's tech ecosystem for future generations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Parallax Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 5000) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" 
            alt="Team success"
            className="w-full h-[120vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/90 to-gray-900/90"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Join Us in Shaping the Future
          </h2>
          <p className="text-2xl mb-12 text-gray-100 leading-relaxed">
            Together, we're not just building software—we're building careers, communities, and a brighter digital future for Rwanda.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-[#ff5a00] px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-xl">
              Explore Opportunities
            </button>
            <button className="border-2 border-white text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-white hover:text-[#ff5a00] transition-colors duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MissionVisionPage