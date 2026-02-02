import React, { useState } from 'react';
import { Briefcase, TrendingUp, Settings, Zap, Target, Award } from 'lucide-react';

function Specialization() {
  const [activeTab, setActiveTab] = useState('Performance Improvement');

  const specializations = [
    { name: 'Business Strategy', icon: Briefcase },
    { name: 'Market Analysis', icon: TrendingUp },
    { name: 'Process Optimization', icon: Settings },
    { name: 'Performance Improvement', icon: Zap },
    { name: 'Entrepreneurial Guidance', icon: Target },
    { name: 'Organizational Excellence', icon: Award }
  ];

const content = {
  'Business Strategy': {
    title: 'Strategic Business Solutions',
    description: 'We develop comprehensive, data-driven business strategies tailored to your unique goals, market conditions, and competitive landscape. Our approach includes long-term vision planning, SWOT analysis, growth roadmaps, and actionable implementation plans that drive sustainable growth, increase market share, and deliver measurable competitive advantage. Whether you\'re entering new markets or refining your core strategy, our experts help you navigate complexity and achieve lasting success.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
  },
  'Market Analysis': {
    title: 'In-Depth Market Insights',
    description: 'Unlock powerful insights with our thorough market analysis services. We conduct detailed research on industry trends, customer demographics, buying behaviors, competitor positioning, and emerging opportunities. Using advanced data analytics, surveys, and competitive intelligence tools, we deliver clear, actionable reports and recommendations that empower you to make confident decisions, identify growth opportunities, and mitigate risks in dynamic markets.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
  },
  'Process Optimization': {
    title: 'Streamline Your Operations',
    description: 'Transform your business operations through systematic process optimization. We map your current workflows, identify bottlenecks and inefficiencies, and redesign processes using Lean, Six Sigma, and automation techniques. Our solutions reduce operational costs, shorten cycle times, eliminate waste, and enhance quality. From supply chain to customer service, we deliver measurable improvements that boost productivity and scalability while maintaining flexibility for future growth.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80'
  },
  'Performance Improvement': {
    title: 'Elevate Your Business Performance',
    description: 'Achieve breakthrough performance with our holistic improvement programs. We assess your teams, technology stack, and talent management practices to uncover hidden potential. Our services include KPI development, performance benchmarking, process reengineering, and change management. We help you unlock efficiency gains across departments, foster a high-performance culture, and align resources with strategic objectives for sustained excellence and superior results.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
  },
  'Entrepreneurial Guidance': {
    title: 'Expert Entrepreneurial Mentorship',
    description: 'Launch and scale your venture with confidence through our expert mentorship. We provide personalized guidance on business planning, funding strategies, go-to-market plans, scaling operations, and risk management. Drawing from years of entrepreneurial experience, our mentors offer practical advice, investor introductions, and strategic support to help you overcome common startup challenges and build a thriving, sustainable business.',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80'
  },
  'Organizational Excellence': {
    title: 'Build High-Performing Organizations',
    description: 'Create a culture of excellence with our organizational development services. We help you design and implement best practices in leadership development, team dynamics, organizational structure, and change management. Our programs focus on building strong company culture, enhancing employee engagement, developing future leaders, and aligning your organization for peak performance. We support transformation journeys that result in resilient, innovative, and high-performing organizations.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80'
  },
  'Digital Transformation': {
    title: 'Accelerate Your Digital Journey',
    description: 'Guide your organization through successful digital transformation with our end-to-end expertise. We assess your current digital maturity, design future-state architectures, and implement technologies like cloud migration, AI integration, automation, and data platforms. Our structured approach ensures minimal disruption, maximum adoption, and rapid realization of benefits including improved agility, customer experiences, and operational efficiency.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
  },
  'Innovation Consulting': {
    title: 'Foster Continuous Innovation',
    description: 'Ignite innovation within your organization through our consulting services. We help you establish innovation frameworks, run ideation workshops, prototype new products/services, and implement innovation management systems. Our methods include design thinking, agile innovation, and open innovation strategies to help you generate breakthrough ideas, turn them into viable solutions, and maintain a culture of continuous improvement and creativity.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
  }
};

  const activeContent = content[activeTab];

  return (
    <div className="w-full py-10 px-4" style={{ backgroundColor: '#f0f4ff' }}>
      <div className="max-w-8xl  px-6 mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-[#1d293d] uppercase tracking-widest text-xs md:text-sm font-semibold mb-4 letter-spacing-wide">
            SPECIALIZATION
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 max-w-xl">
              What should our company do for you
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-xl">
              Select the focus area that best matches your goals. Each track combines hands-on consulting, design, and implementation so impact is immediate and measurable.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {specializations.map((spec, index) => {
            const IconComponent = spec.icon;
            return (
              <button
                key={index}
                onClick={() => setActiveTab(spec.name)}
                className={`px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 flex items-center gap-2 ${
                  activeTab === spec.name
                    ? 'bg-slate-800 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {spec.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Image Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-gray-500 text-sm mb-4">Immersive preview</p>
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <img
                src={activeContent.image}
                alt={activeTab}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-5 h-5 text-[#1d293d]" />
              </div>
              <h3 className="text-[#1d293d] font-semibold text-lg">{activeTab}</h3>
            </div>
            <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {activeContent.title}
            </h4>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              {activeContent.description}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .letter-spacing-wide {
          letter-spacing: 3px;
        }
      `}</style>
    </div>
  );
}

export default Specialization;