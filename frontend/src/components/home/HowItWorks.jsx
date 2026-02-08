import React, { useState } from 'react';
import { Users, Building2, MessageSquare, UserCheck, Rocket, Code, Briefcase, GraduationCap } from 'lucide-react';

function HowItWorks() {
  const [activeTab, setActiveTab] = useState('business');

  const businessSteps = [
    {
      number: 1,
      icon: MessageSquare,
      title: 'Share Your Requirements',
      description: 'Tell us about your project needs, technology stack, and desired expertise'
    },
    {
      number: 2,
      icon: UserCheck,
      title: 'Review Vetted Developers',
      description: 'We match you with pre-screened, qualified software engineers and specialists'
    },
    {
      number: 3,
      icon: Rocket,
      title: 'Start Building',
      description: 'Seamlessly integrate developers with full compliance and ongoing support'
    }
  ];

  const talentSteps = [
    {
      number: 1,
      icon: Code,
      title: 'Join Abytech Hub',
      description: 'Create your profile showcasing your technical skills, experience, and portfolio'
    },
    {
      number: 2,
      icon: Briefcase,
      title: 'Get Matched with Projects',
      description: 'We connect you with exciting opportunities that match your expertise and interests'
    },
    {
      number: 3,
      icon: GraduationCap,
      title: 'Grow Your Career',
      description: 'Work on challenging projects, expand your skills, and advance your professional journey'
    }
  ];

  const currentSteps = activeTab === 'business' ? businessSteps : talentSteps;
  const currentTitle = activeTab === 'business' 
    ? 'Access Top Software Development Talent' 
    : 'Join Our Network of Elite Developers';
  const currentSubtitle = activeTab === 'business'
    ? 'Scale your team with skilled professionals who bring innovation, dedication, and cost-effective solutions.'
    : 'Connect with leading tech companies and work on projects that challenge and inspire you.';
  const currentCTA = activeTab === 'business' ? 'Hire Developers' : 'Join Abytech Hub';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm font-semibold">
              Work With Us
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            How It Works?
          </h1>

          {/* Tab Switcher */}
          <div className="inline-flex bg-gray-100 rounded-full p-1.5 mb-4">
            <button
              onClick={() => setActiveTab('talents')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === 'talents'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              For Talents
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                activeTab === 'business'
                  ? 'bg-[#ff5a00] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-5 h-5" />
              For Business
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative bg-gradient-to-br from-[#ff5a00] to-[#cc4700] rounded-3xl p-8 lg:p-12 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-48 translate-y-48"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white opacity-30 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white opacity-30 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white opacity-30 rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white opacity-30 rounded-full"></div>

          {/* Icon */}
          <div className="relative mb-8">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              {activeTab === 'business' ? (
                <Building2 className="w-6 h-6 text-slate-900" />
              ) : (
                <Users className="w-6 h-6 text-slate-900" />
              )}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="relative text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {currentTitle}
            </h2>
            <p className="text-lg text-white text-opacity-90 max-w-3xl mx-auto">
              {currentSubtitle}
            </p>
          </div>

          {/* Steps Grid */}
          <div className="relative grid md:grid-cols-3 gap-6 mb-12">
            {currentSteps.map((step, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 hover:bg-opacity-15 transition-all border border-white border-opacity-20"
              >
                {/* Number Badge */}
                <div className="flex items-center gap-4 mb-4">
                 
                  <div className="w-12 h-12 bg-white bg-opacity-10 rounded-xl flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-slate-900" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-900 text-opacity-90 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="relative text-center">
            <button className="bg-white hover:bg-gray-50 text-[#ff5a00] px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center gap-2">
              {currentCTA}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;