import React, { useEffect, useState } from 'react';
import { FaPencilRuler, FaCode, FaUserGraduate, FaTimes } from 'react-icons/fa';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { MdSupportAgent } from 'react-icons/md';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Web Development',
    icon: <FaPencilRuler size={40} />,
    description:
      'Transform your digital presence with websites that drive real business results. We create platforms that attract your ideal customers, convert visitors into clients, and grow alongside your business. From brand storytelling to user engagement, every element is designed to strengthen your market position and accelerate revenue growth.',
    detailedInfo: {
      overview: 'Your website is often the first impression potential customers have of your business. We create digital experiences that not only capture attention but convert visitors into loyal customers. Our approach focuses on understanding your business goals, target audience, and competitive landscape to deliver a solution that drives measurable ROI.',
      keyFeatures: [
        'Strategic design that positions your brand as an industry leader and builds trust with your target audience',
        'User experience optimization that guides visitors seamlessly toward conversion actions and key business goals',
        'Mobile-first approach ensuring your message reaches customers wherever they are, capturing the growing mobile market',
        'Search engine visibility strategies that put your business in front of customers actively searching for your services',
        'Performance optimization that reduces bounce rates and keeps potential customers engaged with fast loading times',
        'Scalable architecture that grows with your business, accommodating increased traffic and expanded functionality',
        'Analytics integration providing actionable insights into customer behavior and marketing campaign effectiveness',
        'Content management capabilities allowing your team to maintain fresh, relevant content without technical dependencies'
      ],
      businessValue: 'A professional website is no longer optional—it\'s essential for business credibility and growth. Our clients typically see improved customer acquisition costs, higher conversion rates, and enhanced brand perception. We focus on creating digital assets that pay for themselves through increased leads, sales, and customer engagement.',
      approach: 'We begin by understanding your business objectives, competitive advantages, and target customer profile. Our strategy phase identifies opportunities to differentiate your brand and capture market share. Throughout development, we prioritize features that deliver the highest business impact, ensuring your investment generates returns quickly.',
      investment: 'Project scope and investment vary based on business objectives and complexity, typically ranging from 4-12 weeks',
      idealFor: 'Businesses ready to establish strong digital authority, companies seeking to reduce customer acquisition costs, organizations looking to expand market reach and capture new customer segments.'
    }
  },
  {
    title: 'App Development',
    icon: <IoDocumentTextSharp size={40} />,
    description:
      'Reach your customers directly with mobile and web applications that create lasting engagement. Whether you\'re launching a new revenue stream, improving operational efficiency, or building customer loyalty, we develop apps that solve real business problems and deliver competitive advantages in your market.',
    detailedInfo: {
      overview: 'Mobile applications offer unprecedented opportunities to engage customers, streamline operations, and create new revenue channels. We develop applications that become essential tools for your customers or powerful assets for your internal operations, focusing on solving specific business challenges and creating measurable value.',
      keyFeatures: [
        'Customer engagement tools that increase lifetime value through direct communication channels and personalized experiences',
        'Revenue generation features including in-app purchases, subscriptions, and monetization strategies aligned with your business model',
        'Operational efficiency improvements that reduce costs and free your team to focus on high-value activities',
        'Data collection and analysis capabilities providing insights into customer preferences and behavior patterns',
        'Brand presence extension keeping your business top-of-mind with customers through regular interaction touchpoints',
        'Competitive differentiation through unique features that set your offering apart in the marketplace',
        'Customer retention mechanisms including loyalty programs and exclusive app-only benefits that reduce churn',
        'Market expansion opportunities reaching new customer segments and geographic markets cost-effectively'
      ],
      businessValue: 'Applications create direct relationships with customers, reducing dependence on third-party platforms and advertising. They enable data-driven decision making through direct customer insights and behavioral analytics. For operations-focused apps, clients typically see significant time savings, error reduction, and improved team productivity.',
      approach: 'We start by identifying the core business problem your app will solve and who will benefit most. Our strategy focuses on features that deliver immediate value while planning for future expansion. We validate assumptions through research and prototyping before full development, minimizing risk and ensuring market fit.',
      investment: 'Development timelines typically span 8-16 weeks depending on feature complexity and business requirements',
      idealFor: 'Businesses seeking direct customer relationships, companies with unique service delivery models, organizations looking to improve internal processes, startups validating new market opportunities.'
    }
  },
  {
    title: 'Software Development',
    icon: <FaCode size={40} />,
    description:
      'Gain competitive advantage through custom software that automates complex processes, eliminates inefficiencies, and scales with your growth. We build solutions that address your unique operational challenges, reduce costs, and free your team to focus on strategic initiatives that drive business value.',
    detailedInfo: {
      overview: 'Off-the-shelf software often forces businesses to adapt their processes to fit generic solutions. Custom software does the opposite—it\'s built around your specific workflows, business rules, and competitive strategies. This alignment eliminates inefficiencies, reduces training time, and provides capabilities your competitors simply don\'t have.',
      keyFeatures: [
        'Process automation that eliminates repetitive tasks, reduces errors, and reallocates human resources to higher-value work',
        'Workflow optimization tailored to your specific operations, removing bottlenecks and accelerating business cycles',
        'Integration capabilities connecting disparate systems to create a unified view of business operations and customer data',
        'Business intelligence tools transforming raw data into actionable insights that inform strategic decisions',
        'Competitive differentiation through proprietary capabilities that create barriers to entry in your market',
        'Scalability planning ensuring systems grow efficiently with your business without requiring expensive replacements',
        'Cost reduction through elimination of manual processes, reduced error rates, and optimized resource allocation',
        'Compliance and security measures protecting sensitive business data and meeting industry-specific regulatory requirements'
      ],
      businessValue: 'Custom software delivers ROI through operational savings, competitive advantages, and growth enablement. Clients typically see reduced operational costs, faster business cycles, improved decision-making speed, and the ability to pursue opportunities that weren\'t previously feasible. The software becomes a strategic asset that appreciates in value as your business grows.',
      approach: 'We begin with operational analysis to identify bottlenecks, inefficiencies, and opportunities for automation. Our business analysts work closely with your team to document workflows and design solutions that enhance rather than disrupt operations. Implementation is phased to minimize business disruption while delivering value quickly.',
      investment: 'Custom software projects range from 12-24+ weeks based on scope and integration requirements',
      idealFor: 'Growing businesses outgrowing generic solutions, companies with unique operational models, organizations seeking operational excellence and cost leadership, businesses requiring specific compliance or security capabilities.'
    }
  },
  {
    title: 'E-Commerce Solutions',
    icon: <AiOutlineShoppingCart size={40} />,
    description:
      'Maximize revenue with e-commerce platforms engineered for conversions and growth. From first-time visitors to repeat customers, every aspect is optimized to reduce friction, build trust, and increase average order values. We create online stores that don\'t just display products—they actively sell them.',
    detailedInfo: {
      overview: 'E-commerce success requires more than putting products online—it demands strategic platform design, conversion optimization, and customer experience excellence. We build online stores that address the complete customer journey while providing you with tools to manage inventory, fulfill orders, and grow your business efficiently.',
      keyFeatures: [
        'Conversion rate optimization through strategic design, persuasive copywriting integration, and friction reduction in the buying process',
        'Customer lifetime value enhancement via personalized recommendations, loyalty programs, and targeted retention campaigns',
        'Average order value increase through strategic product bundling, upselling opportunities, and threshold incentives',
        'Inventory management integration preventing stockouts, reducing carrying costs, and optimizing reorder timing',
        'Multi-channel selling capabilities expanding reach across marketplaces while maintaining centralized control',
        'Marketing automation tools for abandoned cart recovery, customer win-back campaigns, and promotional management',
        'Analytics and reporting dashboards providing visibility into sales trends, customer behavior, and profitability by product',
        'Payment flexibility supporting multiple methods and currencies to maximize market reach and reduce checkout abandonment'
      ],
      businessValue: 'E-commerce platforms create 24/7 revenue generation capability while reducing overhead compared to physical retail. Our clients see increased profit margins through operational efficiency, expanded market reach without geographic limitations, and valuable customer data that informs product development and marketing strategies.',
      approach: 'We analyze your product catalog, target customer profile, and competitive positioning to design an optimal selling environment. Our strategy emphasizes quick wins through conversion optimization while building long-term growth through customer retention and lifetime value enhancement. We focus on metrics that matter: conversion rate, average order value, and customer acquisition cost.',
      investment: 'E-commerce implementations typically range from 6-14 weeks depending on catalog complexity and integration needs',
      idealFor: 'Retailers expanding online or scaling existing e-commerce, manufacturers selling direct-to-consumer, service businesses adding product revenue streams, brands seeking greater control over customer relationships.'
    }
  },
  {
    title: 'IT Support',
    icon: <MdSupportAgent size={40} />,
    description:
      'Eliminate technology disruptions and security risks with proactive IT management that keeps your business running smoothly. Our support goes beyond fixing problems—we prevent them, optimize performance, and provide strategic guidance that aligns technology investments with business growth objectives.',
    detailedInfo: {
      overview: 'Technology downtime directly impacts revenue, productivity, and customer satisfaction. Our IT support services ensure business continuity through proactive monitoring, rapid issue resolution, and strategic planning. We serve as your technology department, providing enterprise-level expertise at a fraction of the cost of in-house IT staff.',
      keyFeatures: [
        'Business continuity assurance through proactive monitoring that identifies and resolves issues before they impact operations',
        'Security risk mitigation protecting sensitive business data and customer information from evolving cyber threats',
        'Productivity optimization ensuring employees have reliable tools and support to maximize their effectiveness',
        'Technology planning aligned with business growth, ensuring infrastructure investments support strategic objectives',
        'Cost predictability through fixed monthly fees that eliminate surprise IT expenses and enable accurate budgeting',
        'Disaster recovery planning minimizing data loss and downtime in worst-case scenarios, protecting business continuity',
        'Vendor management coordination saving time and reducing frustration when dealing with multiple technology providers',
        'Compliance support ensuring technology practices meet industry regulatory requirements and standards'
      ],
      businessValue: 'Reliable IT support reduces operational risk, improves employee productivity, and enables growth without technology constraints. Businesses typically see reduced downtime costs, lower cybersecurity insurance premiums, improved customer service capabilities, and the ability to focus management attention on core business activities rather than technology problems.',
      approach: 'We start with a technology assessment identifying vulnerabilities, inefficiencies, and opportunities for improvement. Our proactive approach emphasizes prevention over reaction, with regular maintenance and monitoring preventing issues before they impact your business. Strategic reviews ensure technology investments align with business goals and deliver appropriate returns.',
      investment: 'Flexible service agreements with predictable monthly costs based on business size and support requirements',
      idealFor: 'Small to medium businesses without dedicated IT staff, growing companies needing to scale technology capabilities, organizations seeking to reduce IT costs while improving service quality, businesses requiring compliance with data security regulations.'
    }
  },
  {
    title: 'Internship Program',
    icon: <FaUserGraduate size={40} />,
    description:
      'Bridge the gap between education and career success through hands-on experience with real business projects. Our program provides aspiring professionals with mentorship, practical skills, and portfolio-building opportunities that accelerate career development and prepare them for the competitive job market.',
    detailedInfo: {
      overview: 'The technology industry values practical experience as much as formal education. Our internship program provides that critical experience, working on actual client projects under the guidance of industry professionals. Interns gain not just technical skills but business acumen, professional communication abilities, and the confidence that comes from delivering real value.',
      keyFeatures: [
        'Real project experience building portfolios with actual business solutions rather than academic exercises',
        'Professional mentorship providing guidance from experienced practitioners who share industry insights and career advice',
        'Skill development across the full project lifecycle from requirements gathering to deployment and support',
        'Business context understanding how technology decisions impact client outcomes and learning to think strategically',
        'Team collaboration experience working in professional environments with established processes and quality standards',
        'Industry tools exposure gaining proficiency with professional-grade platforms and frameworks used in the marketplace',
        'Network building connecting with professionals, clients, and fellow interns who become valuable career contacts',
        'Career acceleration positioning for full-time roles with demonstrated capabilities and professional recommendations'
      ],
      businessValue: 'For interns, the program provides competitive advantages in the job market through practical experience, professional references, and a portfolio of real work. Many interns transition to full-time positions, having proven their capabilities and cultural fit. The program serves as an extended interview process, reducing hiring risk for both parties.',
      approach: 'The program balances learning with contribution, starting with foundational training and progressing to increasingly independent work. Regular feedback sessions ensure continuous improvement while project work provides context for learning. We match interns with projects that align with their interests and career goals while meeting business needs.',
      investment: '3-6 month programs with flexible start dates, designed to fit academic schedules',
      idealFor: 'Students seeking competitive advantages in the job market, recent graduates building professional experience, career changers validating interest in technology roles, motivated learners seeking practical skill development beyond classroom theory.'
    }
  },
];

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  return (
    <section className="bg-white py-4 md:py-10 px-4 md:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Strategic technology solutions that drive measurable business results and competitive advantage.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white border-2 border-gray-200 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:border-gray-900 hover:shadow-xl"
            >
              {/* Icon Container */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-xl mb-6 shadow-md group-hover:bg-gray-800 transition-all duration-300">
                <div className="text-white">
                  {service.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                {service.description}
              </p>

              {/* View More Button */}
              <button 
                onClick={() => setSelectedService(service)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300 group-hover:shadow-lg"
              >
                View More
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white w-full h-full md:w-[90vw] md:h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90"
            >
              <FaTimes size={20} />
            </button>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto">
              <div className="max-w-8xl mx-auto px-8 md:px-16 py-12 md:py-16">
                {/* Header */}
                <div className="mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-6">
                    <div className="text-white text-5xl">
                      {selectedService.icon}
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {selectedService.title}
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>

                {/* Overview */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Strategic Overview</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {selectedService.detailedInfo.overview}
                  </p>
                </div>

                {/* Key Features */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Capabilities</h3>
                  <div className="space-y-4">
                    {selectedService.detailedInfo.keyFeatures.map((feature, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                        <p className="text-gray-700 leading-relaxed text-lg">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Value */}
                <div className="mb-12 bg-gray-50 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Business Value & ROI</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {selectedService.detailedInfo.businessValue}
                  </p>
                </div>

                {/* Approach */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Approach</h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {selectedService.detailedInfo.approach}
                  </p>
                </div>

                {/* Investment & Ideal For */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Investment & Timeline</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedService.detailedInfo.investment}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Ideal For</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedService.detailedInfo.idealFor}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Drive Results?
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Let's discuss how this solution can accelerate your business growth.
                  </p>
                  <Link to='/contact-us' className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-300 text-lg">
                    Schedule a Consultation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </section>
  );
}