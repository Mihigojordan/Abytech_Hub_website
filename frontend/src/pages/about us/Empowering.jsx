import React, { useState, useEffect } from 'react'
import Header from '../../components/header'

function EmpoweringPage() {
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
      {/* Hero Section - No Parallax */}
  <Header title="Emporing Inclusin" path="empowering inclusin" />

      {/* Introduction */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Empowerment is at the Core of Everything We Do
          </h2>
          <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            At Abytech, we believe that true empowerment comes from providing people with the skills, opportunities, and support they need to reach their full potential. We're not just building software—we're building futures.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed">
            Our mission is to unlock the incredible talent within Rwanda and create pathways for individuals to transform their lives through technology.
          </p>
        </div>
      </section>

      {/* Empowering Talent Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
              Empowering Talent
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Transforming Potential into Excellence
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We invest deeply in developing world-class tech talent right here in Rwanda
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80" 
                  alt="Training programs"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#ff5a00]/20 rounded-lg -z-10"></div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Comprehensive Training Programs</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our training programs are designed to take individuals from beginner to professional level, covering everything from fundamental programming concepts to advanced software architecture.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Full-Stack Development</h4>
                    <p className="text-gray-600">Frontend, backend, databases, and cloud technologies</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Professional Skills</h4>
                    <p className="text-gray-600">Communication, teamwork, and agile methodologies</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-4 rounded-lg shadow">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Real-World Projects</h4>
                    <p className="text-gray-600">Hands-on experience with live client work</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Training Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Mentorship Programs",
                description: "One-on-one guidance from experienced developers who have walked the path before.",
                image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
              },
              {
                title: "Industry Certifications",
                description: "Support for obtaining recognized certifications in cloud computing, development, and more.",
                image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80"
              },
              {
                title: "Career Counseling",
                description: "Personalized career guidance to help each individual chart their unique path in tech.",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="overflow-hidden h-48">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider 1 - No Parallax */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&q=80" 
            alt="Students learning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              "Education is the most powerful weapon you can use to change the world"
            </h3>
            <p className="text-xl opacity-90">- Nelson Mandela</p>
          </div>
        </div>
      </section>

      {/* Empowering Women in Tech */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
                Empowering Women
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Breaking Barriers in Tech
              </h2>
              <div className="w-24 h-1 bg-[#ff5a00] mb-8"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We're committed to closing the gender gap in technology. Through targeted initiatives, mentorship programs, and a supportive environment, we empower women to excel in tech careers.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Women in Tech scholarship programs</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Female mentor network and support groups</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Leadership development programs</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Flexible work policies for work-life balance</p>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#ff5a00] mb-2">40%+</p>
                <p className="text-gray-700">of our team members are women, significantly above industry average</p>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80" 
                  alt="Women in tech"
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-48 h-48 bg-[#ff5a00]/20 rounded-lg -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Empowering Youth - Updated to 5 Images */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
              Empowering Youth
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Inspiring the Next Generation
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Today's youth are tomorrow's innovators. We're investing in programs that introduce technology to students early.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Coding Bootcamps for Students",
                description: "Free weekend coding workshops for high school and university students to explore programming.",
                image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=700&q=80",
                stats: "500+ students reached"
              },
              {
                title: "Tech Career Awareness",
                description: "School visits and seminars to showcase diverse career paths in technology and inspire young minds.",
                image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=700&q=80",
                stats: "20+ schools partnered"
              },
              {
                title: "Internship Programs",
                description: "Structured internships that provide real-world experience and a pathway to full-time employment.",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80",
                stats: "100+ interns trained"
              },
              {
                title: "Youth Hackathons",
                description: "Annual hackathons where young developers compete, learn, and build solutions to local challenges.",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80",
                stats: "200+ participants"
              },
              {
                title: "STEM Workshops",
                description: "Interactive workshops introducing science, technology, engineering, and math concepts to young learners.",
                image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=700&q=80",
                stats: "300+ workshop attendees"
              }
            ].map((program, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="overflow-hidden h-64">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-700 mb-4">{program.description}</p>
                  <div className="flex items-center gap-2 text-[#ff5a00] font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{program.stats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider 2 - No Parallax */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&q=80" 
            alt="Community impact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold">
              Empowering Communities Through Technology
            </h3>
          </div>
        </div>
      </section>

      {/* Empowering Communities */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
              Empowering Communities
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Building Rwanda's Tech Ecosystem
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in lifting entire communities through technology education and economic opportunity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Community Tech Hubs",
                description: "Creating accessible spaces where communities can learn, collaborate, and innovate together.",
                image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80"
              },
              {
                title: "Open Source Contributions",
                description: "Contributing to global open-source projects while building local expertise and reputation.",
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
              },
              {
                title: "Knowledge Sharing",
                description: "Regular meetups, workshops, and conferences to share knowledge across the tech community.",
                image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80"
              }
            ].map((initiative, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="overflow-hidden h-56">
                  <img 
                    src={initiative.image} 
                    alt={initiative.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{initiative.title}</h3>
                  <p className="text-gray-700">{initiative.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Economic Impact */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80" 
                  alt="Economic empowerment"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">Creating Economic Opportunities</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Every developer we train, every project we complete, and every partnership we form creates ripples of economic opportunity throughout Rwanda.
              </p>
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Competitive Salaries</h4>
                  </div>
                  <p className="text-gray-700">Our developers earn market-competitive salaries, enabling them to support their families and invest in their communities.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Local Business Growth</h4>
                  </div>
                  <p className="text-gray-700">By keeping talent in Rwanda and attracting international clients, we contribute to local economic growth.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-[#ff5a00] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Multiplier Effect</h4>
                  </div>
                  <p className="text-gray-700">Each tech job created supports additional jobs in the local economy through increased spending and investment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Stories of Empowerment
            </h2>
            <div className="w-24 h-1 bg-[#ff5a00] mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real people, real transformations, real impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Divine Uwimana",
                role: "Senior Developer",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
                story: "From a recent graduate with no job prospects to leading complex projects for international clients. Abytech gave me the skills and confidence to pursue my dreams."
              },
              {
                name: "Eric Niyonzima",
                role: "Full-Stack Engineer",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                story: "I was working in a completely different field. Through Abytech's training program, I discovered my passion for coding and transformed my career completely."
              },
              {
                name: "Grace Mutesi",
                role: "Tech Lead",
                image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80",
                story: "As a woman in tech, I faced many doubts. Abytech's supportive environment and mentorship helped me rise to a leadership position I never thought possible."
              }
            ].map((story, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="overflow-hidden h-64">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{story.name}</h3>
                  <p className="text-[#ff5a00] font-semibold mb-4">{story.role}</p>
                  <p className="text-gray-700 italic leading-relaxed">"{story.story}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - No Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80" 
            alt="Join the movement"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00]/90 to-gray-900/90"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Be Empowered?
          </h2>
          <p className="text-2xl mb-12 text-gray-100 leading-relaxed">
            Whether you're looking to start your tech career, advance your skills, or partner with us to create impact—we're here to support your journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-[#ff5a00] px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-xl">
              Start Your Journey
            </button>
            <button className="border-2 border-white text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-white hover:text-[#ff5a00] transition-colors duration-300">
              Partner With Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EmpoweringPage