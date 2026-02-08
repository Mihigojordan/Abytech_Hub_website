import React from 'react'
import Header from "../../components/header";
import image1 from '../../assets/untitled folder/image1.jpg'
import image2 from '../../assets/untitled folder/image2.jpg'
import image3 from '../../assets/untitled folder/image3.jpg'
import image4 from '../../assets/untitled folder/image4.jpg'
import image5 from '../../assets/untitled folder/image5.jpg'
import image6 from '../../assets/untitled folder/image6.jpg'
import image7 from '../../assets/untitled folder/image7.png'
import image8 from '../../assets/untitled folder/image8.png'
import image9 from '../../assets/untitled folder/image8.jpeg'




function OurValuesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
     <Header title="OUR VALUES" path="our values" />

      {/* Introduction */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Built on Strong Foundations
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Our values are the cornerstone of our culture and the driving force behind our success. They shape how we work, interact with clients, develop talent, and contribute to Rwanda's technology ecosystem.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Every decision we make, every project we undertake, and every relationship we build is guided by these core principles.
          </p>
        </div>
      </section>

      {/* Core Values - Excellence */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <img 
                  src={image8}
                  alt="Excellence in work"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Excellence</h2>
              </div>
              <div className="w-20 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We are committed to delivering the highest quality in everything we do. Excellence is not just a goal; it's our standard. From code quality to client communication, we strive for perfection in every detail.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our dedication to excellence means continuous improvement, rigorous testing, and never settling for "good enough." We set high standards for ourselves because our clients and our community deserve nothing less.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Rigorous quality assurance processes</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Continuous skill development and training</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Attention to detail in every project phase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Innovation</h2>
              </div>
              <div className="w-20 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Innovation drives us forward. We embrace new technologies, methodologies, and creative approaches to solve complex problems. We're not afraid to challenge the status quo and explore uncharted territories.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our culture encourages experimentation and learning from failure. We believe that innovation is not just about technology—it's about finding better ways to serve our clients and empower our team.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Exploring emerging technologies and frameworks</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Creating unique solutions for unique challenges</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Fostering a culture of creative problem-solving</p>
                </div>
              </div>
            </div>
            <div>
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <img 
                        src={image9}
                        alt="Innovation and creativity"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <img 
                       src={image7}
                        alt="Team collaboration"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Collaboration</h2>
              </div>
              <div className="w-20 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We believe that the best solutions emerge when diverse minds work together. Collaboration is at the heart of everything we do—within our team, with our clients, and across the tech community.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We create an environment where everyone's voice is heard, ideas are shared freely, and collective success is celebrated. Together, we achieve what would be impossible alone.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Cross-functional team dynamics</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Open communication and knowledge sharing</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Building strong partnerships with clients and community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrity */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Integrity</h2>
              </div>
              <div className="w-20 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We conduct our business with honesty, transparency, and ethical responsibility. Integrity is non-negotiable—it's the foundation of trust with our clients, partners, and team members.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We do what's right, even when it's difficult. We honor our commitments, admit our mistakes, and always act in the best interest of our stakeholders and the broader community.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Transparent communication with all stakeholders</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Ethical business practices in all operations</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Accountability for our actions and decisions</p>
                </div>
              </div>
            </div>
            <div>
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <img 
                       src={image1}
                       alt="Integrity and trust"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <img 
                       src={image2}
                        alt="Growth and development"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Growth</h2>
              </div>
              <div className="w-20 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We are committed to continuous learning and development—for our team, our company, and our community. Growth is not just about expansion; it's about becoming better every day.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We invest in our people's professional development, encourage curiosity and learning, and create opportunities for career advancement. As our team grows, so does Rwanda's tech ecosystem.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Ongoing training and certification programs</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Mentorship and career development pathways</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Contributing to community tech education</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff5a00] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Impact</h2>
              </div>
              <div className="w-20 h-1 bg-[#ff5a00] mb-6"></div>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We are driven by the desire to make a meaningful difference in Rwanda's technology landscape and beyond. Every project, every training session, and every innovation is an opportunity to create lasting positive impact.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We measure our success not just in revenue or projects completed, but in the lives we touch, the careers we launch, and the contribution we make to building a thriving digital economy in Rwanda.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Empowering local tech talent for global opportunities</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Contributing to Rwanda's digital transformation</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#ff5a00] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-700">Creating sustainable economic opportunities</p>
                </div>
              </div>
            </div>
            <div>
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <img 
                       src={image4}
                       alt="Making an impact"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values in Action Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Our Values in Action
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These values aren't just words on a page—they guide our daily actions and long-term vision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-3">Every Day</h3>
              <p className="text-gray-300">
                In team meetings, code reviews, client interactions, and project planning—our values shape every decision.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-3">Every Project</h3>
              <p className="text-gray-300">
                From initial discovery to final delivery, we ensure our values are reflected in the quality and integrity of our work.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-3">Every Interaction</h3>
              <p className="text-gray-300">
                Whether with clients, partners, or team members, we bring our values to every conversation and collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Culture Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Building a Values-Driven Culture
            </h2>
            <div className="w-16 h-1 bg-[#ff5a00] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our values create a workplace where talent thrives and innovation happens naturally
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="overflow-hidden rounded-xl shadow-xl">
              <img 
                     src={image5}
                      alt="Team working together"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden rounded-xl shadow-xl">
              <img 
                    src={image6}  alt="Collaborative workspace"
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#ff5a00] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Join a Team That Lives Its Values
          </h2>
          <p className="text-xl mb-8 opacity-90">
            If these values resonate with you, we'd love to have you as part of the Abytech family.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-[#ff5a00] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300">
              Explore Careers
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#ff5a00] transition-colors duration-300">
              Learn More About Us
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OurValuesPage