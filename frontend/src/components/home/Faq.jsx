import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, HelpCircle, Code, Database, Brain, Shield, Clock, DollarSign, Briefcase, Users, BarChart } from 'lucide-react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const categories = [
    { id: 'all', label: 'All Questions', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'services', label: 'Services', icon: <Code className="w-5 h-5" /> },
    { id: 'technical', label: 'Technical', icon: <Database className="w-5 h-5" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'process', label: 'Process', icon: <Clock className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'business', label: 'Business Help', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'youth', label: 'Helping Youth', icon: <Users className="w-5 h-5" /> },
    { id: 'performance', label: 'Performance', icon: <BarChart className="w-5 h-5" /> },
    { id: 'women', label: 'Women in Tech', icon: <Users className="w-5 h-5" /> }
  ];

  const faqs = [
    {
      category: 'services',
      question: 'What services does AbyTech offer?',
      answer: 'AbyTech provides a comprehensive range of technology services including custom software development, web and mobile application development, data analytics and business intelligence, artificial intelligence and machine learning solutions, cloud computing services, API development and integration, system modernization, and IT consulting. We work with businesses of all sizes across various industries to deliver tailored solutions that meet their specific needs. Our services are designed to drive innovation, improve efficiency, and provide a competitive edge in the digital landscape.'
    },
    {
      category: 'services',
      question: 'Do you provide mobile app development for both iOS and Android?',
      answer: 'Yes, we specialize in cross-platform mobile app development using modern frameworks like React Native and Flutter, which allows us to build high-quality applications for both iOS and Android from a single codebase. We also offer native development for projects that require platform-specific features or maximum performance. Our team ensures your app delivers a seamless experience across all devices, with a focus on user-centric design and robust functionality.'
    },
    {
      category: 'services',
      question: 'Can AbyTech help with existing software modernization?',
      answer: 'Absolutely! We have extensive experience in modernizing legacy systems. Our modernization services include migrating applications to cloud platforms, refactoring outdated code, implementing modern architectures (microservices, serverless), updating user interfaces, integrating new technologies, and improving performance and security. We ensure minimal disruption to your business operations during the transition, with a phased approach that prioritizes business continuity.'
    },
    {
      category: 'technical',
      question: 'What technologies and programming languages does your team use?',
      answer: 'Our team is proficient in a wide array of modern technologies. For backend development, we use Python, Node.js, Java, and .NET. Frontend development includes React, Vue.js, Angular, and Next.js. For mobile apps, we work with React Native, Flutter, and native iOS/Android. Our data science stack includes Python, R, TensorFlow, PyTorch, and scikit-learn. We also work with various databases (PostgreSQL, MongoDB, MySQL), cloud platforms (AWS, Azure, Google Cloud), and DevOps tools. We stay updated with the latest trends to deliver cutting-edge solutions.'
    },
    {
      category: 'technical',
      question: 'How do you ensure the quality of your code and applications?',
      answer: 'Quality is paramount at AbyTech. We follow industry best practices including code reviews, automated testing (unit tests, integration tests, end-to-end tests), continuous integration/continuous deployment (CI/CD) pipelines, security scanning, performance testing, and adherence to coding standards. We also use agile methodologies with regular sprint reviews and maintain comprehensive documentation for all projects, ensuring reliability and maintainability over time.'
    },
    {
      category: 'technical',
      question: 'Do you provide API development and third-party integration services?',
      answer: 'Yes, we excel at building robust RESTful and GraphQL APIs, as well as integrating third-party services into existing systems. We have experience integrating payment gateways, CRM systems, ERP solutions, social media platforms, analytics tools, and various business applications. We ensure secure, scalable, and well-documented APIs that follow industry standards, facilitating seamless data exchange and system interoperability.'
    },
    {
      category: 'technical',
      question: 'What is your approach to data security and privacy?',
      answer: 'We take data security very seriously. Our security measures include encryption of data in transit and at rest, secure authentication and authorization mechanisms, regular security audits and penetration testing, compliance with international standards (GDPR, ISO 27001), secure coding practices, regular security updates, and comprehensive backup and disaster recovery procedures. We also sign NDAs and ensure all team members are trained in security best practices, protecting your sensitive information at every stage.'
    },
    {
      category: 'pricing',
      question: 'How much does it cost to develop a custom software solution?',
      answer: 'Project costs vary based on complexity, features, technology stack, timeline, and team size required. A simple web application might start from $5,000-$15,000, while complex enterprise solutions can range from $50,000-$200,000+. We provide detailed project estimates after understanding your requirements. We offer flexible pricing models including fixed price, time and materials, and dedicated team arrangements to suit your budget and project needs, with no hidden fees.'
    },
    {
      category: 'pricing',
      question: 'Do you offer payment plans or milestone-based payments?',
      answer: 'Yes, we offer flexible payment structures. For most projects, we use milestone-based payments where you pay in phases as we complete specific deliverables. Typical payment structure is: 30% upfront, 40% upon milestone completion, and 30% upon final delivery. For long-term projects, we can arrange monthly retainers. We work with you to create a payment plan that aligns with your cash flow and project timeline, ensuring financial transparency.'
    },
    {
      category: 'pricing',
      question: 'Are there ongoing costs after project completion?',
      answer: 'Post-launch costs typically include hosting and infrastructure (cloud services, domain, SSL certificates), maintenance and support services, software updates and security patches, feature enhancements, and technical support. We offer various maintenance packages starting from $500/month for basic support to comprehensive packages for mission-critical applications. We provide transparent pricing for all ongoing services, helping you budget effectively for long-term success.'
    },
    {
      category: 'process',
      question: 'What is your typical project development process?',
      answer: 'We follow an agile development methodology: 1) Discovery & Planning - we understand your requirements and create a detailed project plan, 2) Design - UI/UX design and architecture planning, 3) Development - iterative development with regular sprints (2-3 weeks), 4) Testing - comprehensive quality assurance, 5) Deployment - launch to production environment, 6) Support - post-launch monitoring and support. Throughout the process, we maintain transparent communication with regular updates and demos, adapting to your feedback.'
    },
    {
      category: 'process',
      question: 'How long does it take to complete a typical project?',
      answer: 'Project timelines vary based on scope and complexity. A simple website or mobile app might take 6-12 weeks, a medium-complexity web application typically takes 3-6 months, and complex enterprise solutions can take 6-12+ months. We provide realistic timelines during the planning phase and keep you updated on progress throughout development. We can also work with tight deadlines when necessary, though this may require additional resources, and we prioritize quality at every step.'
    },
    {
      category: 'process',
      question: 'How involved will I be during the development process?',
      answer: 'We believe in collaborative development and encourage client involvement. You\'ll participate in initial requirement gathering sessions, review and approve designs, attend bi-weekly sprint demos, provide feedback on deliverables, and approve major milestones. We assign a dedicated project manager as your main point of contact and use project management tools (like Jira, Trello, or Asana) for transparent progress tracking. Your input is valuable and helps ensure the final product meets your expectations and business goals.'
    },
    {
      category: 'process',
      question: 'What happens if I need changes during development?',
      answer: 'We understand that requirements can evolve. Minor adjustments within the agreed scope are typically accommodated at no extra cost. For significant changes, we assess the impact on timeline and budget, provide a change request document outlining the implications, and proceed only with your approval. Our agile approach allows for flexibility, and regular sprint reviews help identify needed changes early in the process, minimizing disruptions.'
    },
    {
      category: 'process',
      question: 'Do you provide training and documentation?',
      answer: 'Yes, comprehensive training and documentation are included in our services. We provide user manuals and guides, technical documentation for developers, admin panel training sessions, video tutorials when applicable, and ongoing support during the transition period. We ensure your team is fully equipped to use and maintain the solution effectively, with customized training sessions tailored to your staff\'s skill levels.'
    },
    {
      category: 'security',
      question: 'How do you handle intellectual property rights?',
      answer: 'All intellectual property rights for custom-developed solutions are transferred to you upon final payment. You own the source code, design assets, and all project deliverables. We sign clear IP assignment agreements before project start. For projects using third-party libraries or frameworks, we ensure proper licensing and document all dependencies. Your business ideas and data remain strictly confidential, with legal protections in place.'
    },
    {
      category: 'security',
      question: 'Is my data safe with AbyTech?',
      answer: 'Absolutely. We implement multiple layers of data protection including secure cloud storage with encryption, access controls and role-based permissions, regular automated backups, secure development environments, strict confidentiality agreements with all team members, and compliance with international data protection regulations. We never share your data with third parties and maintain strict security protocols throughout the project lifecycle, including regular vulnerability assessments.'
    },
    {
      category: 'security',
      question: 'What steps do you take to secure data?',
      answer: 'To secure data, we employ advanced encryption techniques for data at rest and in transit, implement multi-factor authentication, conduct regular security audits and penetration testing, use firewalls and intrusion detection systems, follow least privilege access principles, and train our staff on data handling best practices. We also maintain compliance with standards like GDPR and HIPAA where applicable, ensuring your data is protected against unauthorized access, breaches, and loss.'
    },
    {
      category: 'services',
      question: 'Do you provide ongoing maintenance and support?',
      answer: 'Yes, we offer comprehensive post-launch support and maintenance packages. Services include bug fixes and troubleshooting, security updates and patches, performance monitoring and optimization, feature enhancements, technical support (email, phone, chat), regular backups and server maintenance, and emergency support for critical issues. We have various support tiers to match your needs and budget, from basic maintenance to 24/7 premium support, ensuring your solution remains reliable and up-to-date.'
    },
    {
      category: 'technical',
      question: 'Can you work with our existing IT team?',
      answer: 'Absolutely! We excel at collaborating with in-house teams. We can augment your existing team with specialized skills, integrate seamlessly into your development workflow, use your preferred tools and communication channels, provide knowledge transfer and mentoring, and work within your established processes and standards. Many of our clients use us to scale their teams for specific projects or to access specialized expertise, fostering a productive partnership.'
    },
    {
      category: 'process',
      question: 'What if I\'m not satisfied with the final product?',
      answer: 'Client satisfaction is our priority. Our iterative development process with regular demos helps prevent dissatisfaction by catching issues early. If you\'re not satisfied, we offer unlimited revisions within the agreed scope during the development phase, a thorough review process before final delivery, and post-launch support to address any issues. We don\'t consider a project complete until you\'re completely satisfied. Our high client satisfaction rate (95%+) reflects our commitment to quality and excellence.'
    },
    // New FAQs for business category
    {
      category: 'business',
      question: 'How can AbyTech help my business grow?',
      answer: 'AbyTech helps businesses grow by providing scalable technology solutions that streamline operations, enhance customer experiences, and enable data-driven decision-making. We offer custom software to automate processes, AI-powered analytics for insights, cloud migrations for efficiency, and digital transformation strategies. Our solutions are tailored to your industry, helping you reduce costs, increase revenue, and stay ahead of competitors in a rapidly evolving market.'
    },
    {
      category: 'business',
      question: 'What industry-specific solutions does AbyTech offer?',
      answer: 'We provide industry-specific solutions for sectors like healthcare (EHR systems, telemedicine apps), finance (fintech platforms, fraud detection), retail (e-commerce systems, inventory management), manufacturing (IoT integrations, supply chain optimization), and more. Each solution is customized to address unique challenges, comply with regulations, and leverage industry best practices, ensuring maximum value and ROI for your business.'
    },
    {
      category: 'business',
      question: 'How does AbyTech support small businesses?',
      answer: 'For small businesses, we offer affordable, scalable solutions like website development, CRM integrations, automation tools, and digital marketing tech. We focus on quick wins that provide immediate impact, such as process automation to save time and resources, with flexible pricing and phased implementations to fit limited budgets while setting the foundation for future growth.'
    },
    // New FAQs for youth category
    {
      category: 'youth',
      question: 'How does AbyTech help youth in technology?',
      answer: 'AbyTech supports youth through mentorship programs, coding workshops, and partnerships with educational institutions to provide hands-on tech training. We aim to inspire the next generation by offering free resources, online courses, and community events focused on emerging technologies like AI and web development, helping young people build skills for future careers.'
    },
    {
      category: 'youth',
      question: 'Do you offer internship programs for youth?',
      answer: 'Yes, our internship programs provide real-world experience in software development, data science, and project management. Interns work on live projects under guidance from experienced mentors, gaining practical skills, industry knowledge, and networking opportunities. We prioritize diversity and offer paid internships to support young talent from various backgrounds.'
    },
    {
      category: 'youth',
      question: 'What youth outreach initiatives does AbyTech have?',
      answer: 'Our outreach includes school visits, tech camps, and scholarships for underprivileged youth interested in STEM. We collaborate with non-profits to provide devices and internet access, host hackathons, and offer career counseling to guide young individuals toward tech careers, fostering innovation and inclusivity in the industry.'
    },
    // New FAQs for performance category
    {
      category: 'performance',
      question: 'How do you optimize application performance?',
      answer: 'We optimize performance through code refactoring, database indexing, caching mechanisms (e.g., Redis), load balancing, and scalable architectures. We use tools like New Relic and Datadog for monitoring, conduct performance audits, and implement best practices like lazy loading and compression to ensure fast, responsive applications even under high load.'
    },
    {
      category: 'performance',
      question: 'What tools do you use for performance monitoring?',
      answer: 'Our performance monitoring stack includes APM tools like New Relic, Prometheus, Grafana, and ELK Stack for logging and metrics. We set up real-time dashboards, alerting systems, and conduct regular benchmarks to identify bottlenecks, ensuring proactive optimization and maintaining high availability for your applications.'
    },
    {
      category: 'performance',
      question: 'How does AbyTech ensure scalable performance?',
      answer: 'We design systems with scalability in mind using microservices, auto-scaling cloud resources, and efficient algorithms. Regular stress testing and capacity planning help predict and handle growth, while CDN integrations and optimized queries ensure consistent performance as your user base expands.'
    },
    // New FAQs for women category
    {
      category: 'women',
      question: 'How does AbyTech support women in tech?',
      answer: 'AbyTech promotes women in tech through dedicated mentorship programs, women-led initiatives, and partnerships with organizations like Women Who Code. We provide training, networking events, and career advancement opportunities to empower women, ensuring a diverse and inclusive workplace where they can thrive.'
    },
    {
      category: 'women',
      question: 'What diversity initiatives does AbyTech have for women?',
      answer: 'Our initiatives include gender-balanced hiring practices, flexible work policies, leadership training for women, and sponsorship programs. We host workshops on topics like negotiation and tech skills, and track metrics to ensure progress toward gender equality in our teams and projects.'
    },
    {
      category: 'women',
      question: 'Do you offer programs to help women enter tech fields?',
      answer: 'Yes, we run bootcamps, scholarships, and online courses specifically for women transitioning into tech. These programs cover coding, data analysis, and project management, with mentorship from female leaders to build confidence and skills for successful careers in technology.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
  

      {/* Search and Filter Section */}
      <div className="relative px-12 py-12">
        <div className="max-w-8xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-900 focus:outline-none text-gray-700 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeCategory === category.id
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
                style={{
                  backgroundColor: activeCategory === category.id ? '#1d293d' : undefined
                }}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* FAQ List - Changed to grid layout for two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1d293d' }}>
                        <HelpCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-gray-400 flex-shrink-0 transition-transform ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                      style={{ color: openIndex === index ? '#4668a2' : undefined }}
                    />
                  </button>
                  
                  {openIndex === index && (
                    <div className="px-6 pb-5 pt-2 pl-20">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 col-span-2">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact CTA Section */}
      <div className="relative px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-[#1d293d] to-[#1d293d] rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our team is here to help. Reach out to us and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors shadow-lg">
                Contact Support
              </button>
              <button className="px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors border-2 border-white/20">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="relative px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#4668a2' }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#4668a2' }}>
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#4668a2' }}>
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">10+</div>
              <div className="text-gray-600">Expert Team Members</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;