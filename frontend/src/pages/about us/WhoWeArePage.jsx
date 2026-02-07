import React from 'react'

function WhoWeArePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-6 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" 
            alt="Kigali cityscape"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Who We Are
          </h1>
          <div className="w-24 h-1 bg-[#ff5a00] mb-8"></div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed">
            Empowering Rwanda's digital future through innovative technology solutions and talent development
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <div className="w-16 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Our mission is to become a leading catalyst for technological and economic transformation in Rwanda. We strive to bridge the gap between international markets and local expertise, creating a robust ecosystem where innovation flourishes, businesses thrive, and communities prosper.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                By prioritizing continuous learning and development, we ensure that our workforce remains at the forefront of technological advancements, ready to meet the evolving needs of the global market.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#ff5a00] to-orange-600 p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-6">Why Rwanda?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Strategic location in East Africa's technology hub</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Growing young, tech-savvy population</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Excellent infrastructure and connectivity</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Pro-business government policies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section - Team Collaboration */}
      <section className="py-0 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="overflow-hidden rounded-lg shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
                alt="Team collaboration at Abytech"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" 
                alt="Developers working together"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              Started in 2022 - Growing Strong
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#ff5a00] hidden md:block"></div>
            
            <div className="space-y-12">
              {/* 2022 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div className="md:text-right mb-8 md:mb-0">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="inline-block bg-[#ff5a00] text-white px-4 py-2 rounded-full font-bold mb-4">
                        2022
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Foundation</h3>
                      <p className="text-gray-700">
                        Abytech was founded in Kigali, Rwanda with a vision to transform the local tech ecosystem and provide world-class technology solutions.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-4 h-4 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block"></div>
              </div>

              {/* 2023 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div className="hidden md:block"></div>
                  <div className="mb-8 md:mb-0">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="inline-block bg-[#ff5a00] text-white px-4 py-2 rounded-full font-bold mb-4">
                        2023
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Expansion & Growth</h3>
                      <p className="text-gray-700">
                        Expanded our service offerings and grew our team of skilled developers and tech professionals. Launched major projects with local and international clients.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-4 h-4 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block"></div>
              </div>

              {/* 2024 */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div className="md:text-right mb-8 md:mb-0">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="inline-block bg-[#ff5a00] text-white px-4 py-2 rounded-full font-bold mb-4">
                        2024
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovation Hub</h3>
                      <p className="text-gray-700">
                        Established training programs to upskill local talent. Strengthened partnerships with technology leaders and expanded our impact across Rwanda.
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:block"></div>
                </div>
                <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-4 h-4 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block"></div>
              </div>

              {/* 2025+ */}
              <div className="relative">
                <div className="md:grid md:grid-cols-2 gap-8">
                  <div className="hidden md:block"></div>
                  <div>
                    <div className="bg-gradient-to-br from-[#ff5a00] to-orange-600 p-6 rounded-lg shadow-lg text-white">
                      <div className="inline-block bg-white text-[#ff5a00] px-4 py-2 rounded-full font-bold mb-4">
                        2025 & Beyond
                      </div>
                      <h3 className="text-2xl font-bold mb-3">The Future</h3>
                      <p>
                        Continuing to drive digital transformation in Rwanda and beyond, empowering the next generation of tech innovators and creating sustainable growth.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute left-1/2 top-8 transform -translate-x-1/2 w-4 h-4 bg-[#ff5a00] rounded-full border-4 border-white hidden md:block"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large Feature Image Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&q=80" 
              alt="Modern office workspace in Kigali"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a00]/90 to-orange-600/80 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Powering Innovation from Kigali
                </h2>
                <p className="text-xl md:text-2xl opacity-90">
                  Where talent meets opportunity in Rwanda's tech landscape
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We deliver cutting-edge technology solutions while building Rwanda's tech talent ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-[#ff5a00] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Software Development</h3>
              <p className="text-gray-700">
                Custom software solutions, web and mobile applications built with cutting-edge technologies to solve real-world business challenges.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-[#ff5a00] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Training & Development</h3>
              <p className="text-gray-700">
                Comprehensive training programs that upskill local talent in modern software development practices and emerging technologies.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-[#ff5a00] rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">IT Consulting</h3>
              <p className="text-gray-700">
                Strategic technology consulting to help businesses leverage digital transformation and optimize their technology infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-16 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Our Approach
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Building sustainable growth through talent development and quality service delivery
            </p>
          </div>

          {/* Approach Image */}
          <div className="mb-12 rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&q=80" 
              alt="Team training session"
              className="w-full h-[400px] object-cover"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <div>
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Identify & Recruit Top Talent</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Partnerships with leading universities in Rwanda
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Rigorous selection process with technical assessments
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Focus on both technical skills and cultural fit
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Intensive Training & Upskilling</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Comprehensive training in modern tech stacks
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Hands-on experience with real-world projects
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Agile methodologies and best practices
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Real-World Project Experience</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Work on live client projects under mentorship
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Collaboration in cross-functional teams
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Continuous code reviews and quality assurance
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#ff5a00] rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Long-term Career Growth</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Clear career progression pathways
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ongoing professional development opportunities
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Mentorship from industry experts
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              Building Rwanda's tech ecosystem, one developer at a time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="text-5xl font-bold text-[#ff5a00] mb-4">50+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trained Developers</h3>
              <p className="text-gray-600">Skilled professionals ready for the global market</p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="text-5xl font-bold text-[#ff5a00] mb-4">30+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Successful Projects</h3>
              <p className="text-gray-600">Delivered for clients across various industries</p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <div className="text-5xl font-bold text-[#ff5a00] mb-4">100%</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Satisfaction</h3>
              <p className="text-gray-600">Commitment to quality and excellence</p>
            </div>
          </div>

          {/* Impact Images */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" 
                alt="Developer training session"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80" 
                alt="Team collaboration workspace"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80" 
                alt="Tech team meeting"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-gray-300">Delivering the highest quality in everything we do</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-gray-300">Embracing new technologies and creative solutions</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Collaboration</h3>
              <p className="text-gray-300">Working together to achieve greater impact</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Growth</h3>
              <p className="text-gray-300">Continuous learning and development for all</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#ff5a00] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join Us in Building Rwanda's Digital Future
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're looking to develop your tech skills or partner with us on innovative projects, we're here to collaborate.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-[#ff5a00] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
              Explore Opportunities
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#ff5a00] transition-colors duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WhoWeArePage