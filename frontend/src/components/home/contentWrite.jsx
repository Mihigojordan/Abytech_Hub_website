import React, { useEffect, useState } from 'react';
import { FaCode, FaMobile, FaLaptopCode, FaShoppingCart, FaCloud, FaRocket } from 'react-icons/fa';
import { MdDeveloperMode, MdIntegrationInstructions } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Custom Software Development',
    icon: <FaCode size={40} />,
    description:
      'Build powerful, scalable software solutions tailored to your unique business needs. We transform complex challenges into elegant applications that streamline operations, boost productivity, and give you a competitive edge in your industry.',
    detailedInfo: {
      overview: 'Custom software is more than code—it\'s a strategic asset that aligns perfectly with your business processes and goals. We create solutions that eliminate inefficiencies, automate workflows, and scale seamlessly as your business grows. Our approach ensures you get software that works exactly how you need it to, not how off-the-shelf products force you to work.',
      keyFeatures: [
        'Tailored architecture designed around your specific workflows, business rules, and operational requirements',
        'Seamless integration with existing systems, databases, and third-party services to create a unified ecosystem',
        'Scalable infrastructure that grows with your business without requiring costly rewrites or migrations',
        'Advanced automation capabilities that eliminate repetitive tasks and reduce human error rates significantly',
        'Real-time analytics and reporting dashboards providing actionable insights into business performance',
        'Enterprise-grade security protocols protecting sensitive data and ensuring compliance with industry regulations',
        'Cloud-native deployment options for flexibility, reliability, and cost-effective infrastructure management',
        'Ongoing maintenance and support ensuring your software remains secure, performant, and up-to-date'
      ],
      businessValue: 'Custom software delivers measurable ROI through operational efficiency gains, cost reduction, and competitive differentiation. Our clients typically experience 40-60% reduction in manual processing time, improved data accuracy, faster decision-making, and the ability to offer unique services their competitors cannot match. The software becomes a strategic asset that appreciates in value as your business expands.',
      approach: 'We begin with deep discovery to understand your business challenges, opportunities, and goals. Our agile methodology ensures you see progress quickly with regular demos and feedback cycles. We prioritize features based on business impact, delivering value incrementally while building toward your complete vision. Post-launch, we provide training, documentation, and ongoing optimization.',
      investment: 'Project timelines typically range from 12-24 weeks depending on scope and complexity, with flexible engagement models',
      idealFor: 'Growing businesses outgrowing generic solutions, companies with unique operational models, organizations seeking process automation, businesses requiring specific compliance capabilities, enterprises needing competitive differentiation through technology.'
    }
  },
  {
    title: 'Web Application Development',
    icon: <FaLaptopCode size={40} />,
    description:
      'Create powerful web applications that deliver exceptional user experiences across all devices. From SaaS platforms to enterprise portals, we build responsive, high-performance applications that engage users and drive business results.',
    detailedInfo: {
      overview: 'Modern web applications are the backbone of digital business operations. We develop sophisticated, cloud-based solutions that provide seamless experiences whether accessed from desktop, tablet, or mobile. Our applications combine beautiful design with robust functionality, ensuring users love working with them while achieving your business objectives.',
      keyFeatures: [
        'Responsive design ensuring flawless experiences across all devices and screen sizes for maximum accessibility',
        'Progressive Web App (PWA) capabilities enabling offline functionality and app-like experiences in browsers',
        'Advanced user interface design with intuitive navigation and workflows that minimize training requirements',
        'Real-time data synchronization keeping information current across all users and touchpoints instantly',
        'Role-based access control and authentication systems ensuring appropriate security and data privacy',
        'API-first architecture enabling easy integration with other systems and future expansion possibilities',
        'Performance optimization delivering fast load times and smooth interactions even with complex data',
        'Cross-browser compatibility ensuring consistent functionality across Chrome, Safari, Firefox, and Edge'
      ],
      businessValue: 'Web applications provide centralized access to critical business functions from anywhere, improving team productivity and enabling remote work capabilities. Clients see reduced IT infrastructure costs through cloud deployment, improved collaboration across distributed teams, better customer engagement through self-service portals, and the ability to rapidly deploy new features and updates without user downloads.',
      approach: 'Our process starts with user research and workflow mapping to understand how people will interact with your application. We create interactive prototypes for early validation before full development. Our iterative approach allows for continuous refinement based on user feedback, ensuring the final product truly meets needs. We handle deployment, training, and provide comprehensive documentation.',
      investment: 'Development cycles range from 10-20 weeks based on feature complexity and integration requirements',
      idealFor: 'Businesses launching SaaS products, companies needing internal tools and portals, organizations replacing legacy desktop applications, startups building minimum viable products, enterprises requiring customer-facing platforms.'
    }
  },
  {
    title: 'Mobile App Development',
    icon: <FaMobile size={40} />,
    description:
      'Reach your customers where they are with native iOS and Android applications. We create mobile experiences that users love, combining beautiful design with powerful functionality to drive engagement, loyalty, and revenue growth.',
    detailedInfo: {
      overview: 'Mobile apps provide direct, personal connections with your customers or employees. We develop native applications for iOS and Android, as well as cross-platform solutions that maximize reach while minimizing development costs. Every app is crafted to leverage platform-specific capabilities while maintaining a consistent brand experience and achieving your business goals.',
      keyFeatures: [
        'Native iOS and Android development or cross-platform solutions using React Native and Flutter frameworks',
        'Intuitive user interfaces following platform design guidelines for familiar, easy-to-use experiences',
        'Push notification systems enabling direct communication with users for engagement and retention',
        'Offline functionality ensuring core features work even without internet connectivity for better user experience',
        'Device feature integration leveraging camera, GPS, biometrics, and sensors for enhanced capabilities',
        'In-app analytics tracking user behavior and engagement to inform product decisions and improvements',
        'Secure payment integration for in-app purchases, subscriptions, and e-commerce transactions',
        'App store optimization and deployment support ensuring successful launches on Apple App Store and Google Play'
      ],
      businessValue: 'Mobile apps create direct customer relationships, reducing dependence on third-party platforms and advertising costs. They enable personalized experiences based on user behavior and preferences, increasing engagement and lifetime value. Companies typically see improved customer retention through convenient access, new revenue streams through in-app monetization, enhanced brand loyalty through regular interaction, and valuable first-party data for marketing and product development.',
      approach: 'We start by defining your app\'s core value proposition and target user personas. Our design phase focuses on creating intuitive flows that guide users to key actions. We develop in sprints with regular builds for testing and feedback. Pre-launch includes beta testing with real users to refine the experience. Post-launch, we monitor analytics, gather user feedback, and iterate based on actual usage patterns.',
      investment: 'Mobile app projects typically span 12-20 weeks depending on platform choices and feature complexity',
      idealFor: 'Businesses seeking direct customer relationships, companies with mobile-first audiences, organizations improving field operations, startups validating app-based business models, brands creating loyalty programs and engagement platforms.'
    }
  },
  {
    title: 'E-Commerce Development',
    icon: <FaShoppingCart size={40} />,
    description:
      'Launch and scale your online store with e-commerce platforms built for growth. We create seamless shopping experiences that convert browsers into buyers, with robust backend systems that make order fulfillment and inventory management effortless.',
    detailedInfo: {
      overview: 'E-commerce success requires more than a shopping cart—it demands strategic platform design, conversion optimization, and operational efficiency. We build online stores that attract customers, provide exceptional shopping experiences, and include powerful tools for managing inventory, processing orders, and analyzing sales performance. Every element is optimized to maximize revenue and minimize friction.',
      keyFeatures: [
        'Conversion-optimized checkout flows reducing cart abandonment and maximizing completed purchases',
        'Product catalog management with variants, categories, filtering, and search for easy discovery',
        'Inventory tracking and management preventing overselling and optimizing stock levels automatically',
        'Multiple payment gateway integration supporting credit cards, digital wallets, and alternative payment methods',
        'Shipping calculation and fulfillment integration with major carriers for accurate costs and tracking',
        'Customer account management with order history, wishlists, and saved payment information for convenience',
        'Marketing automation including abandoned cart recovery, email campaigns, and promotional capabilities',
        'Analytics and reporting dashboards tracking sales trends, customer behavior, and product performance metrics'
      ],
      businessValue: 'E-commerce platforms create 24/7 revenue generation while reducing overhead compared to physical retail. Our clients experience increased profit margins through operational efficiency, expanded market reach beyond geographic limitations, lower customer acquisition costs through owned channels, valuable customer data informing product and marketing decisions, and the ability to rapidly test new products and pricing strategies.',
      approach: 'We analyze your products, target customers, and competitive landscape to design optimal selling experiences. Our strategy emphasizes quick wins through conversion optimization while building for long-term growth. We integrate with your existing systems for seamless operations. Post-launch includes conversion rate optimization, performance monitoring, and feature enhancements based on customer behavior and business needs.',
      investment: 'E-commerce implementations range from 8-16 weeks depending on catalog size and integration complexity',
      idealFor: 'Retailers expanding online or scaling existing e-commerce, manufacturers selling direct-to-consumer, service businesses adding product offerings, brands seeking control over customer relationships, wholesale businesses opening retail channels.'
    }
  },
  {
    title: 'Cloud Solutions & DevOps',
    icon: <FaCloud size={40} />,
    description:
      'Modernize your infrastructure with cloud solutions that scale effortlessly and reduce costs. We implement DevOps practices and cloud architectures that improve reliability, speed up deployment, and give you the agility to respond quickly to market opportunities.',
    detailedInfo: {
      overview: 'Cloud infrastructure and DevOps practices are essential for modern software operations. We help businesses migrate to cloud platforms, optimize existing cloud deployments, and implement automation that accelerates development while improving reliability. Our solutions reduce infrastructure costs, eliminate manual deployment errors, and enable rapid scaling to meet demand fluctuations.',
      keyFeatures: [
        'Cloud architecture design and migration planning for AWS, Google Cloud, and Microsoft Azure platforms',
        'Infrastructure as Code (IaC) implementation enabling consistent, repeatable deployments across environments',
        'Continuous Integration/Continuous Deployment (CI/CD) pipelines automating testing and releases',
        'Container orchestration with Docker and Kubernetes for efficient resource utilization and scaling',
        'Monitoring and alerting systems providing visibility into application performance and infrastructure health',
        'Security best practices including encryption, access controls, and compliance framework implementation',
        'Cost optimization strategies reducing cloud spending while maintaining or improving performance',
        'Disaster recovery and backup solutions ensuring business continuity and data protection'
      ],
      businessValue: 'Cloud and DevOps transformation delivers faster time-to-market for new features, reduced infrastructure costs through right-sizing and automation, improved system reliability and uptime, enhanced security and compliance posture, greater team productivity through automated workflows, and the flexibility to scale resources up or down based on actual demand rather than peak capacity planning.',
      approach: 'We assess your current infrastructure and workflows to identify optimization opportunities. Our migration approach minimizes disruption through careful planning and phased execution. We implement monitoring and automation incrementally, proving value at each step. Training ensures your team can maintain and evolve the systems. Ongoing optimization continues to improve performance and reduce costs.',
      investment: 'Cloud transformation projects typically span 8-16 weeks with ongoing optimization and support options',
      idealFor: 'Businesses migrating from on-premise to cloud infrastructure, companies seeking to reduce IT costs, organizations improving deployment speed and reliability, startups building cloud-native from the start, enterprises modernizing legacy systems.'
    }
  },
  {
    title: 'API Development & Integration',
    icon: <MdIntegrationInstructions size={40} />,
    description:
      'Connect your systems and unlock new capabilities through robust API development and integration. We build APIs that enable seamless data flow between applications and integrate third-party services to extend your platform\'s functionality.',
    detailedInfo: {
      overview: 'APIs are the connective tissue of modern software ecosystems, enabling different systems to work together seamlessly. We design and develop RESTful and GraphQL APIs that are secure, well-documented, and built for scale. Whether you need to expose your data to partners, integrate with third-party services, or connect internal systems, we create integration solutions that are reliable and maintainable.',
      keyFeatures: [
        'RESTful and GraphQL API design following industry best practices for consistency and usability',
        'Comprehensive API documentation making integration straightforward for developers and partners',
        'Authentication and authorization systems ensuring secure access control and data protection',
        'Rate limiting and throttling protecting your infrastructure from abuse and ensuring fair usage',
        'Third-party service integration connecting CRM, payment processors, marketing tools, and business systems',
        'Data transformation and synchronization ensuring consistent information across connected platforms',
        'Webhook implementation enabling real-time notifications and event-driven architectures',
        'API versioning strategies allowing updates without breaking existing integrations and client applications'
      ],
      businessValue: 'Well-designed APIs enable business agility by allowing rapid integration of new services and partners. Companies experience reduced development time for new features through reusable components, new revenue opportunities through API monetization or partner ecosystems, improved data accuracy through automated synchronization, elimination of manual data entry and associated errors, and the ability to offer enhanced experiences through third-party service integration.',
      approach: 'We start by mapping data flows and integration requirements across your systems. Our API design phase focuses on creating intuitive, consistent interfaces that developers enjoy using. We implement robust error handling and logging for easier troubleshooting. Testing includes security audits and load testing to ensure reliability. Documentation and developer support ensure successful integration by your team or partners.',
      investment: 'API development and integration projects range from 6-14 weeks based on complexity and number of systems',
      idealFor: 'Businesses building platform ecosystems, companies needing to connect disparate systems, organizations offering partner integrations, SaaS providers enabling customer integrations, enterprises modernizing through microservices architecture.'
    }
  }
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
    <section className="bg-gradient-to-b from-white to-slate-50 py-16 md:py-10 px-4 md:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-block mb-4">
            <span className="bg-orange-100 text-[#ff5a00] px-6 py-2 rounded-full text-sm font-semibold">
              WHAT WE OFFER
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-[#ff5a00]">Services</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Innovative software solutions that transform businesses and drive measurable results through cutting-edge technology.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 md:p-10 transition-all duration-300 hover:border-[#ff5a00] hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a00] to-[#cc4700] opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"></div>
              
              {/* Icon Container */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ff5a00] to-[#ff7a33] rounded-2xl mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <div className="text-white">
                  {service.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="relative text-2xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#ff5a00] transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="relative text-gray-600 text-base leading-relaxed mb-6">
                {service.description}
              </p>

              {/* View More Button */}
              <button 
                onClick={() => setSelectedService(service)}
                className="relative inline-flex items-center gap-2 px-6 py-3 bg-[#ff5a00] text-white font-semibold rounded-xl hover:bg-[#e64f00] transition-all duration-300 group-hover:shadow-lg group-hover:gap-3"
              >
                Learn More
                <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white w-full h-full md:w-[92vw] md:h-[92vh] md:rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Close Button */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-6 right-6 z-10 w-14 h-14 bg-[#ff5a00] hover:bg-[#e64f00] text-white rounded-full flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 shadow-lg"
            >
              <IoClose size={28} />
            </button>

            {/* Scrollable Content */}
            <div className="h-full overflow-y-auto">
              <div className="max-w-6xl mx-auto px-6 md:px-16 py-12 md:py-20">
                {/* Header */}
                <div className="mb-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#ff5a00] to-[#ff7a33] rounded-3xl mb-8 shadow-xl">
                    <div className="text-white text-5xl">
                      {selectedService.icon}
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    {selectedService.title}
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                    {selectedService.description}
                  </p>
                </div>

                {/* Overview */}
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-[#ff5a00] rounded-full"></div>
                    <h3 className="text-3xl font-bold text-gray-900">Strategic Overview</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                    {selectedService.detailedInfo.overview}
                  </p>
                </div>

                {/* Key Features */}
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-[#ff5a00] rounded-full"></div>
                    <h3 className="text-3xl font-bold text-gray-900">Key Capabilities</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedService.detailedInfo.keyFeatures.map((feature, idx) => (
                      <div key={idx} className="flex gap-4 bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors duration-300">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-[#ff5a00] bg-opacity-10 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#ff5a00]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-lg">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Value */}
                <div className="mb-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 md:p-12 border border-[#ff5a00] border-opacity-20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-[#ff5a00] rounded-full"></div>
                    <h3 className="text-3xl font-bold text-gray-900">Business Value & ROI</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                    {selectedService.detailedInfo.businessValue}
                  </p>
                </div>

                {/* Approach */}
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-[#ff5a00] rounded-full"></div>
                    <h3 className="text-3xl font-bold text-gray-900">Our Approach</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                    {selectedService.detailedInfo.approach}
                  </p>
                </div>

                {/* Investment & Ideal For */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                  <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200 hover:border-[#ff5a00] transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#ff5a00] bg-opacity-10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff5a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Investment & Timeline</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {selectedService.detailedInfo.investment}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200 hover:border-[#ff5a00] transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#ff5a00] bg-opacity-10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#ff5a00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Ideal For</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {selectedService.detailedInfo.idealFor}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-12 border-t-2 border-gray-200">
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg md:text-xl max-w-2xl mx-auto">
                    Let's discuss how we can help transform your business with innovative technology solutions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link 
                      to='/contact-us' 
                      className="px-10 py-5 bg-[#ff5a00] hover:bg-[#e64f00] text-white font-bold rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
                    >
                      Schedule a Consultation
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="px-10 py-5 bg-white border-2 border-[#ff5a00] text-[#ff5a00] hover:bg-orange-50 font-bold rounded-xl transition-all duration-300 text-lg"
                    >
                      View Other Services
                    </button>
                  </div>
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
            transform: translateY(30px);
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

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #ff5a00;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #e64f00;
        }
      `}</style>
    </section>
  );
}