import React, { useState, useEffect } from 'react'

function StoryImpactCulturePage() {
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
        <div 
          className="absolute inset-0 z-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80" 
            alt="Abytech story"
            className="w-full h-[120vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-[#ff5a00]/70 to-gray-800/90"></div>
        </div>
        
        <div 
          className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: 1 - scrollY / 500,
          }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Our Story, Impact & Culture
          </h1>
          <div className="w-32 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
          <p className="text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            The Journey of Building Rwanda's Tech Future
          </p>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
              Our Story
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How It All Began
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a bold vision to a thriving tech ecosystem in Rwanda
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div 
              className="relative"
              style={{
                transform: `translateY(${(scrollY - 600) * 0.1}px)`,
              }}
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" 
                  alt="Kigali Rwanda"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#ff5a00]/20 rounded-lg -z-10"
                style={{
                  transform: `translateY(${(scrollY - 600) * -0.05}px)`,
                }}
              ></div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">The Founding Vision - 2022</h3>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  In 2022, a group of passionate technologists and entrepreneurs came together with a shared vision: to transform Rwanda into a hub of technological innovation and opportunity. They saw the immense potential in Rwanda's young, educated population and the government's commitment to building a knowledge-based economy.
                </p>
                <p>
                  What started as a small team working from a modest office in Kigali has grown into a vibrant community of developers, designers, and innovators. Our founders believed that with the right training, mentorship, and opportunities, Rwandan talent could compete on the global stage.
                </p>
                <p>
                  That belief became the foundation of Abytech—a company dedicated not just to building software, but to building careers and transforming lives through technology.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline with Images */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#ff5a00] hidden md:block"></div>
            
            <div className="space-y-16">
              {/* 2022 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div 
                    className="md:text-right mb-8 md:mb-0"
                    style={{
                      transform: `translateX(${(scrollY - 1200) * -0.05}px)`,
                    }}
                  >
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80" 
                        alt="Foundation 2022"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="inline-block bg-[#ff5a00] text-white px-4 py-2 rounded-full font-bold mb-4">
                          2022
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">The Beginning</h3>
                        <p className="text-gray-700">
                          Abytech was founded in Kigali with a team of 5 passionate individuals and a dream to revolutionize Rwanda's tech landscape.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                <div className="absolute left-1/2 top-12 transform -translate-x-1/2 w-6 h-6 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block shadow-lg"></div>
              </div>

              {/* 2023 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div className="hidden md:block"></div>
                  <div 
                    className="mb-8 md:mb-0"
                    style={{
                      transform: `translateX(${(scrollY - 1400) * 0.05}px)`,
                    }}
                  >
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" 
                        alt="Growth 2023"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="inline-block bg-[#ff5a00] text-white px-4 py-2 rounded-full font-bold mb-4">
                          2023
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Rapid Growth</h3>
                        <p className="text-gray-700">
                          Launched our first training program, grew to a team of 30+, and completed 15 successful projects for local and international clients.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-12 transform -translate-x-1/2 w-6 h-6 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block shadow-lg"></div>
              </div>

              {/* 2024 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div 
                    className="md:text-right mb-8 md:mb-0"
                    style={{
                      transform: `translateX(${(scrollY - 1600) * -0.05}px)`,
                    }}
                  >
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" 
                        alt="Expansion 2024"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="inline-block bg-[#ff5a00] text-white px-4 py-2 rounded-full font-bold mb-4">
                          2024
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovation Hub</h3>
                        <p className="text-gray-700">
                          Established partnerships with universities, launched advanced training programs, and became recognized as a key player in Rwanda's tech ecosystem.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                <div className="absolute left-1/2 top-12 transform -translate-x-1/2 w-6 h-6 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block shadow-lg"></div>
              </div>

              {/* 2025 & Beyond */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div className="hidden md:block"></div>
                  <div 
                    className="mb-8 md:mb-0"
                    style={{
                      transform: `translateX(${(scrollY - 1800) * 0.05}px)`,
                    }}
                  >
                    <div className="bg-gradient-to-br from-[#ff5a00] to-orange-600 rounded-xl shadow-xl overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80" 
                        alt="Future vision"
                        className="w-full h-48 object-cover opacity-80"
                      />
                      <div className="p-6 text-white">
                        <div className="inline-block bg-white text-[#ff5a00] px-4 py-2 rounded-full font-bold mb-4">
                          2025 & Beyond
                        </div>
                        <h3 className="text-2xl font-bold mb-3">The Future</h3>
                        <p>
                          Expanding across Rwanda, training hundreds of developers annually, and establishing Abytech as a cornerstone of East Africa's digital economy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-12 transform -translate-x-1/2 w-6 h-6 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 2200) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" 
            alt="Team collaboration"
            className="w-full h-[150%] object-cover"
          />
          <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              "From 5 dreamers to 50+ changemakers"
            </h3>
            <p className="text-xl opacity-90">Building Rwanda's tech future together</p>
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
              Our Impact
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Making a Difference
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Measuring success by the lives we touch and the opportunities we create
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "50+", label: "Developers Trained", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80" },
              { number: "30+", label: "Projects Delivered", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" },
              { number: "15+", label: "Partner Companies", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80" },
              { number: "100%", label: "Job Placement Rate", image: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&q=80" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-xl shadow-xl group"
                style={{
                  transform: `translateY(${(scrollY - 2800) * (0.05 + index * 0.02)}px)`,
                }}
              >
                <img 
                  src={stat.image} 
                  alt={stat.label}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex flex-col items-center justify-end p-6 text-white">
                  <div className="text-5xl font-bold text-[#ff5a00] mb-2">{stat.number}</div>
                  <p className="text-lg font-semibold text-center">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Stories */}
          <div className="grid md:grid-cols-2 gap-12">
            <div 
              className="bg-gray-50 p-8 rounded-xl"
              style={{
                transform: `translateY(${(scrollY - 3200) * 0.08}px)`,
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" 
                  alt="Success story"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Marie K.</h4>
                  <p className="text-[#ff5a00] font-semibold">Full Stack Developer</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "Abytech gave me more than just technical skills—they gave me confidence and opportunity. From a fresh graduate with no experience to now working on international projects, the transformation has been incredible. I'm proud to be contributing to Rwanda's tech growth."
              </p>
            </div>

            <div 
              className="bg-gray-50 p-8 rounded-xl"
              style={{
                transform: `translateY(${(scrollY - 3200) * 0.1}px)`,
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" 
                  alt="Success story"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Jean Paul M.</h4>
                  <p className="text-[#ff5a00] font-semibold">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "The mentorship and hands-on experience at Abytech prepared me for the real world of software development. I learned not just how to code, but how to think like a professional developer. Today, I'm leading projects I never thought I'd be capable of."
              </p>
            </div>
          </div>

          {/* Community Impact */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Educational Partnerships",
                description: "Collaborating with universities to bridge the gap between academic knowledge and industry skills.",
                image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&q=80"
              },
              {
                title: "Tech Community Events",
                description: "Hosting workshops, hackathons, and meetups to foster knowledge sharing and networking.",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80"
              },
              {
                title: "Youth Mentorship",
                description: "Guiding the next generation through coding bootcamps and career counseling programs.",
                image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&q=80"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                style={{
                  transform: `translateY(${(scrollY - 3600) * (0.08 + index * 0.02)}px)`,
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Divider 2 */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 4200) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80" 
            alt="Team success"
            className="w-full h-[150%] object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Culture: The Heart of Abytech
            </h3>
          </div>
        </div>
      </section>

      {/* Our Culture Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
              Our Culture
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Where Talent Thrives
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A workplace built on collaboration, growth, and mutual respect
            </p>
          </div>

          {/* Culture Values with Images */}
          <div className="space-y-24">
            {/* Collaboration */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div 
                style={{
                  transform: `translateX(${(scrollY - 4800) * -0.05}px)`,
                }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" 
                    alt="Collaboration culture"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Collaborative Spirit</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  We believe the best ideas emerge when diverse minds work together. Our open office layout, daily stand-ups, and cross-team projects foster an environment where collaboration isn't just encouraged—it's essential.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Pair programming sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Weekly knowledge-sharing sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Team-building activities</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Continuous Learning */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Continuous Learning</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  Technology evolves rapidly, and so do we. We invest heavily in our team's growth through training programs, certifications, conference attendance, and dedicated learning time.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Monthly learning budgets for courses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Certification sponsorship programs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Internal tech talks and workshops</span>
                  </li>
                </ul>
              </div>
              <div 
                className="order-1 md:order-2"
                style={{
                  transform: `translateX(${(scrollY - 5200) * 0.05}px)`,
                }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80" 
                    alt="Learning culture"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Work-Life Balance */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div 
                style={{
                  transform: `translateX(${(scrollY - 5600) * -0.05}px)`,
                }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80" 
                    alt="Work-life balance"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Work-Life Harmony</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  We understand that our team's best work comes when they're healthy, happy, and well-rested. Flexible hours, remote work options, and a focus on results over hours create an environment where people thrive.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Flexible working hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Hybrid work model options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Wellness programs and activities</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Innovation & Creativity */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-4xl font-bold text-gray-900 mb-6">Innovation & Creativity</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  We encourage our team to think outside the box, experiment with new technologies, and bring creative solutions to the table. Innovation time and hackathons are part of our regular schedule.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Quarterly innovation hackathons</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">20% time for passion projects</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Open idea submission process</span>
                  </li>
                </ul>
              </div>
              <div 
                className="order-1 md:order-2"
                style={{
                  transform: `translateX(${(scrollY - 6000) * 0.05}px)`,
                }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80" 
                    alt="Innovation culture"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Team Gallery */}
          <div className="mt-24">
            <h3 className="text-4xl font-bold text-gray-900 text-center mb-12">Life at Abytech</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
                "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80",
                "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
                "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
                "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=600&q=80"
              ].map((img, index) => (
                <div 
                  key={index}
                  className="overflow-hidden rounded-lg shadow-lg"
                  style={{
                    transform: `translateY(${(scrollY - 6400) * (0.05 + index * 0.01)}px)`,
                  }}
                >
                  <img 
                    src={img} 
                    alt={`Team moment ${index + 1}`}
                    className="w-full h-64 object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 7000) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" 
            alt="Join us"
            className="w-full h-[120vh] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/90 to-gray-900/90"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Be Part of Our Story
          </h2>
          <p className="text-2xl mb-12 text-gray-100 leading-relaxed">
            Join a team that's passionate about technology, committed to growth, and dedicated to making an impact.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-[#ff5a00] px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-xl">
              View Open Positions
            </button>
            <button className="border-2 border-white text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-white hover:text-[#ff5a00] transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StoryImpactCulturePage