import React, { useState, useEffect } from "react";
import {
  Server, Globe, Shield, Mail, Clock, Headphones, ChevronRight,
  Sparkles, Monitor, Cloud, Smartphone, RefreshCw, Zap,
  CheckCircle, ArrowRight, ExternalLink, HardDrive, Wifi,
  Lock, Database, BarChart3, Users, Star, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from "../../components/header";

const WebHostingService = () => {
  const [activeTab, setActiveTab] = useState('hosting');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const statCards = [
    {
      label: 'Websites Hosted',
      value: '10,000+',
      icon: Globe,
      color: 'rgb(249, 115, 22)',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      gradient: 'from-orange-500 to-amber-600'
    },
    {
      label: 'Uptime',
      value: '99.9%',
      icon: Wifi,
      color: 'rgb(34, 197, 94)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Apps Published',
      value: '500+',
      icon: Smartphone,
      color: 'rgb(59, 130, 246)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      label: 'Support',
      value: '24/7',
      icon: Headphones,
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      label: 'Happy Clients',
      value: '2,500+',
      icon: Users,
      color: 'rgb(236, 72, 153)',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      gradient: 'from-pink-500 to-rose-600'
    },
  ];

  const hostingFeatures = [
    {
      icon: Server,
      title: 'Shared & VPS Hosting',
      description: 'From affordable shared hosting perfect for small websites to powerful VPS solutions for growing businesses.',
      highlights: ['99.9% uptime guarantee', 'Free SSL certificates', 'Daily automated backups'],
      color: 'rgb(249, 115, 22)',
      bgColor: 'rgba(249, 115, 22, 0.1)',
    },
    {
      icon: HardDrive,
      title: 'Dedicated Servers',
      description: 'Maximum performance and control with enterprise-grade dedicated server infrastructure.',
      highlights: ['Full root access', 'Custom configurations', 'DDoS protection'],
      color: 'rgb(59, 130, 246)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      icon: Cloud,
      title: 'Cloud Hosting',
      description: 'Scalable cloud solutions that grow with your business. Pay only for what you use.',
      highlights: ['Auto-scaling', 'Load balancing', 'Global CDN'],
      color: 'rgb(34, 197, 94)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      icon: Database,
      title: 'Managed Databases',
      description: 'Fully managed database services for MySQL, PostgreSQL, MongoDB, and more.',
      highlights: ['Automated backups', 'High availability', 'Performance tuning'],
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.1)',
    },
  ];

  const publishingFeatures = [
    {
      icon: Smartphone,
      title: 'App Store Submission',
      description: 'Expert guidance through Apple\'s review process and complete App Store optimization.',
      highlights: ['Review compliance', 'ASO optimization', 'Beta testing setup'],
      color: 'rgb(59, 130, 246)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      icon: Globe,
      title: 'Play Store Setup',
      description: 'Complete Google Play Store optimization and publishing service.',
      highlights: ['Store listing optimization', 'Release management', 'Analytics setup'],
      color: 'rgb(34, 197, 94)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      icon: RefreshCw,
      title: 'App Updates & Maintenance',
      description: 'Seamless version management and continuous delivery for your mobile apps.',
      highlights: ['CI/CD pipelines', 'Version control', 'Rollback support'],
      color: 'rgb(249, 115, 22)',
      bgColor: 'rgba(249, 115, 22, 0.1)',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Monitoring',
      description: 'Track your app performance with real-time analytics and crash reporting.',
      highlights: ['User analytics', 'Crash reporting', 'Performance monitoring'],
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.1)',
    },
  ];

  const services = [
    { icon: Monitor, title: 'Dedicated Servers', description: 'Maximum performance and control', color: 'rgb(249, 115, 22)' },
    { icon: Globe, title: 'CDN Services', description: 'Global content delivery network', color: 'rgb(59, 130, 246)' },
    { icon: Mail, title: 'Email Hosting', description: 'Professional business email', color: 'rgb(34, 197, 94)' },
    { icon: Globe, title: 'Domain Management', description: 'Register and manage domains', color: 'rgb(168, 85, 247)' },
    { icon: Lock, title: 'Security & SSL', description: 'Comprehensive security solutions', color: 'rgb(236, 72, 153)' },
    { icon: Headphones, title: '24/7 Support', description: 'Round-the-clock technical assistance', color: 'rgb(107, 114, 128)' },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for small websites and blogs',
      features: ['5GB SSD Storage', '1 Website', 'Free SSL', 'Daily Backups', 'Email Support'],
      color: 'rgb(107, 114, 128)',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$24.99',
      period: '/month',
      description: 'Best for growing businesses',
      features: ['50GB SSD Storage', '10 Websites', 'Free SSL', 'Daily Backups', 'Priority Support', 'Free CDN', 'Staging Environment'],
      color: 'rgb(249, 115, 22)',
      bgColor: 'rgba(249, 115, 22, 0.1)',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$79.99',
      period: '/month',
      description: 'For large-scale applications',
      features: ['Unlimited Storage', 'Unlimited Websites', 'Free SSL', 'Real-time Backups', '24/7 Dedicated Support', 'Global CDN', 'Staging Environment', 'Custom Firewall', 'SLA Guarantee'],
      color: 'rgb(168, 85, 247)',
      bgColor: 'rgba(168, 85, 247, 0.1)',
      popular: false,
    },
  ];

  const currentFeatures = activeTab === 'hosting' ? hostingFeatures : publishingFeatures;

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header title="Web Hosting & App Publishing" path="service/web-hosting" />

      <div className="min-h-screen">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 to-amber-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -ml-24 -mb-24" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: 'rgb(249, 115, 22)' }} />
                  </motion.div>
                  <h1 className="text-xl sm:text-2xl font-bold text-orange-500 bg-clip-text">
                    Web Hosting & App Publishing
                  </h1>
                </div>
                <p className="text-xs text-gray-600">Reliable hosting solutions and seamless app deployment services</p>
              </div>
              <div className="flex items-center space-x-2">
                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="#pricing"
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Plans</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="#contact"
                  className="flex items-center space-x-2 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg text-xs transition-all bg-orange-500 hover:bg-orange-600"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative p-4 rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="p-2.5 rounded-lg shadow-sm"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br opacity-10 rounded-bl-full" style={{ background: stat.color }} />
              </motion.div>
            ))}
          </div>

          {/* Tab Switcher & Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('hosting')}
                    className={`px-4 py-2 rounded-md transition-all text-xs font-medium ${activeTab === 'hosting'
                      ? 'text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                      }`}
                    style={activeTab === 'hosting' ? { backgroundColor: 'rgb(249, 115, 22)' } : {}}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5" />
                      <span>Web Hosting</span>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('publishing')}
                    className={`px-4 py-2 rounded-md transition-all text-xs font-medium ${activeTab === 'publishing'
                      ? 'text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                      }`}
                    style={activeTab === 'publishing' ? { backgroundColor: 'rgb(249, 115, 22)' } : {}}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>App Publishing</span>
                    </div>
                  </motion.button>
                </div>

                <p className="text-xs text-gray-500">
                  {activeTab === 'hosting'
                    ? 'Enterprise-grade hosting infrastructure for your peace of mind'
                    : 'Complete app store publishing and management services'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Feature Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {currentFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onMouseEnter={() => setHoveredFeature(feature.title)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: feature.bgColor }}
                      >
                        <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                      </motion.div>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                      {feature.highlights.map((highlight, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.1 }}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: feature.color }} />
                          <span className="text-xs text-gray-600">{highlight}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-1 text-xs font-medium transition-colors"
                        style={{ color: feature.color }}
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Services Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-4 h-4" style={{ color: 'rgb(249, 115, 22)' }} />
              <h2 className="text-sm font-semibold text-gray-900">Additional Services</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-gray-50 rounded-xl p-4 text-center hover:bg-white hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-gray-100"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${service.color}15` }}
                  >
                    <service.icon className="w-5 h-5" style={{ color: service.color }} />
                  </motion.div>
                  <h3 className="text-xs font-semibold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-[10px] text-gray-500">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Section */}
          <div id="pricing">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" style={{ color: 'rgb(249, 115, 22)' }} />
                  <h2 className="text-sm font-semibold text-gray-900">Hosting Plans</h2>
                </div>
                <span className="text-xs text-gray-500">Choose the plan that fits your needs</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => { setSelectedPlan(plan); setShowPlanModal(true); }}
                    className={`relative rounded-xl p-5 cursor-pointer transition-all overflow-hidden group ${plan.popular
                      ? 'border-2 shadow-md'
                      : 'border border-gray-100 hover:shadow-md hover:border-gray-200'
                      }`}
                    style={plan.popular ? { borderColor: plan.color } : {}}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0">
                        <div className="text-[10px] text-white font-bold px-3 py-1 rounded-bl-lg" style={{ backgroundColor: plan.color }}>
                          POPULAR
                        </div>
                      </div>
                    )}

                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-3">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: plan.bgColor }}
                        >
                          <Star className="w-4 h-4" style={{ color: plan.color }} />
                        </motion.div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{plan.name}</h3>
                          <p className="text-[10px] text-gray-500">{plan.description}</p>
                        </div>
                      </div>

                      <div className="flex items-baseline mb-4">
                        <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-xs text-gray-500 ml-1">{plan.period}</span>
                      </div>

                      <div className="space-y-2 mb-4 pt-3 border-t border-gray-100">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                            <span className="text-xs text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-2.5 rounded-lg text-xs font-medium transition-all ${plan.popular
                          ? 'text-white shadow-md hover:shadow-lg'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        style={plan.popular ? { backgroundColor: plan.color } : {}}
                      >
                        {plan.popular ? 'Get Started' : 'Choose Plan'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            id="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24" />

            <div className="relative p-8 md:p-12 text-center text-white">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-10 h-10 mx-auto mb-4 opacity-80" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to Launch?</h2>
              <p className="text-sm opacity-90 mb-6 max-w-lg mx-auto">
                Get started with our reliable hosting and publishing services today
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-600 px-6 py-2.5 rounded-lg font-medium text-xs shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white/80 text-white px-6 py-2.5 rounded-lg font-medium text-xs hover:bg-white/10 transition-all"
                >
                  Contact Us
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plan Detail Modal */}
      <AnimatePresence>
        {showPlanModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowPlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedPlan.bgColor }}
                  >
                    <Star className="w-5 h-5" style={{ color: selectedPlan.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{selectedPlan.name} Plan</h3>
                    <p className="text-xs text-gray-500">{selectedPlan.description}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">{selectedPlan.price}</span>
                  <span className="text-sm text-gray-500 ml-1">{selectedPlan.period}</span>
                </div>

                <div className="space-y-2.5">
                  {selectedPlan.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center space-x-2.5 bg-gray-50 rounded-lg p-2.5"
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: selectedPlan.color }} />
                      <span className="text-xs text-gray-700 font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: selectedPlan.color }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WebHostingService;