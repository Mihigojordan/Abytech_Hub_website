import React, { useEffect } from "react";
import Header from "../../components/header";
import { Element, Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiClock, FiMapPin, FiBriefcase, FiTrendingUp, FiBell, FiChevronRight } from "react-icons/fi";

const Insights = () => {
    useEffect(() => {
        document.documentElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start",
        });
    }, []);

    const insightsData = {
        trends: {
            id: "trends",
            title: "Tech Trends in Rwanda",
            badge: "INDUSTRY INSIGHTS",
            description: "Exploring how Rwanda is positioning itself as a leading innovation hub in Africa through digital transformation.",
            items: [
                {
                    id: "trend-1",
                    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
                    title: "AI & Machine Learning Adoption in Kigali",
                    excerpt: "How local startups are leveraging artificial intelligence to solve unique challenges in agriculture and finance.",
                    date: "Feb 10, 2025",
                    author: "AbyTech Team"
                },
                {
                    id: "trend-2",
                    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=800&q=80",
                    title: "The Rise of Fintech: Scaling Payment Solutions",
                    excerpt: "Analyzing the growth of mobile money integrations and digital banking across the Thousand Hills.",
                    date: "Jan 28, 2025",
                    author: "Data Analysis Dept"
                }
            ]
        },
        events: {
            id: "events",
            title: "Past Events",
            badge: "COMMUNITY",
            description: "Recap of our workshops and summits shaping Rwandan tech talent.",
            items: [
                {
                    id: "event-1",
                    image: "https://images.unsplash.com/photo-1540575861501-7ad05863f19a?w=800&q=80",
                    title: "Kigali Tech Summit 2024",
                    excerpt: "Discussing the scale-up of local innovations with policymakers.",
                    date: "Dec 15, 2024",
                    location: "Kigali Convention Centre"
                }
            ]
        },
        announcements: {
            id: "announcements",
            title: "Announcements",
            badge: "COMPANY NEWS",
            description: "Stay updated with Abytech Hub's latest partnerships and corporate milestones.",
            items: [
                {
                    id: "ann-1",
                    image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80",
                    title: "Partnership with Rwanda ICT Chamber",
                    excerpt: "Accelerating digital skills development among youth.",
                    date: "Feb 01, 2025"
                }
            ]
        },
        jobs: {
            id: "jobs",
            title: "Careers",
            badge: "JOIN OUR TEAM",
            description: "Build your career at the heart of Kigali's tech scene.",
            items: [
                {
                    id: "job-1",
                    title: "Senior Full-Stack Developer",
                    type: "Full-Time",
                    location: "Kigali",
                    posted: "2 days ago",
                    tags: ["React", "Node.js"]
                }
            ]
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            <Header title="Insights" path="insights" />

            {/* Hero Section - Light & Minimal */}
            <section className="relative py-32 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-block bg-[#ff5a00] text-white px-4 py-1 rounded-full text-xs font-black tracking-widest mb-6 uppercase">
                            The Hub Pulse
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none text-slate-900">
                            The <span className="text-[#ff5a00]">Insights</span> Report
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed font-medium max-w-2xl">
                            Expert analysis, upcoming events, and ecosystem stories from the heart of Rwanda's tech revolution.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <ScrollLink to="trends" smooth={true} offset={-100} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-[#ff5a00] transition-all shadow-xl cursor-pointer flex items-center gap-2 group">
                                Start Reading <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </ScrollLink>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#ff5a00]/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
            </section>

            <div className="container mx-auto px-6 py-24">
                <div className="flex flex-col lg:flex-row gap-16 relative">
                    {/* Main Content Area */}
                    <div className="flex-1 space-y-32">
                        {/* Trends Section */}
                        <Element name="trends" className="scroll-mt-32">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-slate-900 mb-4 flex items-center gap-4">
                                    <FiTrendingUp className="text-[#ff5a00]" /> {insightsData.trends.title}
                                </h2>
                                <p className="text-slate-500 text-lg font-medium">{insightsData.trends.description}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {insightsData.trends.items.map((item) => (
                                    <div key={item.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                        <div className="h-64 overflow-hidden">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="p-8 pb-10">
                                            <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase mb-4 tracking-wider">
                                                <span>{item.date}</span>
                                                <span className="w-1 h-1 bg-[#ff5a00] rounded-full"></span>
                                                <span>{item.author}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-[#ff5a00] transition-colors line-clamp-2">{item.title}</h3>
                                            <Link to={`/blog/${item.id}`} className="text-[#ff5a00] font-black inline-flex items-center gap-2 group/link">
                                                Read Article <FiArrowRight className="group-hover/link:translate-x-2 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Element>

                        {/* Past Events Section */}
                        <Element name="events" className="scroll-mt-32">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-slate-900 mb-4 flex items-center gap-4">
                                    <FiCalendar className="text-[#ff5a00]" /> {insightsData.events.title}
                                </h2>
                                <p className="text-slate-500 text-lg font-medium">{insightsData.events.description}</p>
                            </div>
                            <div className="grid gap-8">
                                {insightsData.events.items.map((item) => (
                                    <div key={item.id} className="group bg-slate-50 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-center border border-transparent hover:border-slate-200 transition-all">
                                        <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-lg">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-[#ff5a00] text-sm font-black mb-2 uppercase tracking-tighter">
                                                <FiMapPin /> {item.location}
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                                            <p className="text-slate-600 mb-6 font-medium">{item.excerpt}</p>
                                            <Link to={`/blog/${item.id}`} className="inline-flex items-center gap-2 text-slate-900 font-black border-b-2 border-slate-900 pb-1 hover:text-[#ff5a00] hover:border-[#ff5a00] transition-all">
                                                Event Recap <FiChevronRight />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Element>

                        {/* Announcements Section */}
                        <Element name="announcements" className="scroll-mt-32">
                            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                                        <div className="max-w-xl">
                                            <div className="inline-flex items-center gap-2 bg-[#ff5a00]/20 text-[#ff5a00] px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-6">
                                                <FiBell className="w-4 h-4" /> {insightsData.announcements.badge}
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-black mb-6">{insightsData.announcements.title}</h2>
                                            <p className="text-slate-400 text-lg font-medium">{insightsData.announcements.description}</p>
                                        </div>
                                        <Link to="/blogs" className="text-white font-black flex items-center gap-2 hover:text-[#ff5a00] transition-colors group/btn">
                                            View More Announcements <FiArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {insightsData.announcements.items.map((item) => (
                                            <div key={item.id} className="flex gap-6 items-start">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 text-xs font-black">{item.date}</span>
                                                    <h4 className="text-xl font-black mt-2 leading-tight hover:text-[#ff5a00] cursor-pointer transition-colors">{item.title}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff5a00]/10 blur-[120px] rounded-full translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                            </div>
                        </Element>

                        {/* Jobs Section */}
                        <Element name="jobs" className="scroll-mt-32">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-slate-900 mb-4 flex items-center gap-4">
                                    <FiBriefcase className="text-[#ff5a00]" /> {insightsData.jobs.id.toUpperCase()}
                                </h2>
                                <p className="text-slate-500 text-lg font-medium">{insightsData.jobs.description}</p>
                            </div>
                            <div className="space-y-4">
                                {insightsData.jobs.items.map((item) => (
                                    <div key={item.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-8 hover:shadow-xl transition-all hover:border-[#ff5a00]/30 cursor-pointer">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">{item.type}</span>
                                                <span className="text-slate-400 text-xs font-bold">{item.posted}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                                            <div className="flex gap-2 mt-4 flex-wrap">
                                                {item.tags.map(tag => (
                                                    <span key={tag} className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black hover:bg-[#ff5a00] transition-colors whitespace-nowrap">
                                            Apply Today
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Element>
                    </div>

                    {/* Right Sidebar - Sticky Navigation */}
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="sticky top-32 space-y-8">
                            {/* Categories Navigator */}
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-200 pb-4">On this page</h4>
                                <nav className="space-y-2">
                                    {[
                                        { name: "Trends", to: "trends", icon: <FiTrendingUp /> },
                                        { name: "Past Events", to: "events", icon: <FiCalendar /> },
                                        { name: "Announcements", to: "announcements", icon: <FiBell /> },
                                        { name: "Careers", to: "jobs", icon: <FiBriefcase /> }
                                    ].map(link => (
                                        <ScrollLink
                                            key={link.to}
                                            to={link.to}
                                            smooth={true}
                                            offset={-100}
                                            activeClass="bg-white shadow-lg text-[#ff5a00]"
                                            className="flex items-center gap-4 p-4 rounded-2xl text-slate-600 font-black hover:bg-white hover:text-[#ff5a00] hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <span className="text-lg">{link.icon}</span>
                                            {link.name}
                                            <FiChevronRight className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </ScrollLink>
                                    ))}
                                </nav>
                            </div>

                            {/* Newsletter Mini */}
                            <div className="bg-[#ff5a00] p-10 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl shadow-[#ff5a00]/20">
                                <h4 className="text-2xl font-black mb-4 relative z-10">Get the Digest</h4>
                                <p className="text-[#fff]/80 mb-8 font-medium relative z-10">Weekly Rwandan tech updates, delivered to you.</p>
                                <input type="email" placeholder="Your Email" className="w-full bg-white/10 border border-white/20 p-4 rounded-xl text-white placeholder:text-white/60 mb-4 focus:outline-none focus:bg-white/20 relative z-10" />
                                <button className="w-full bg-white text-[#ff5a00] p-4 rounded-xl font-black hover:bg-slate-900 hover:text-white transition-all relative z-10">Subscribe</button>
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                            </div>

                            {/* Socials */}
                            <div className="flex justify-center gap-6 py-4">
                                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                                    <a key={social} href="#" className="text-slate-400 font-black text-xs uppercase hover:text-[#ff5a00] transition-colors">{social}</a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global CTA */}
            <section className="py-24 bg-slate-50 border-t border-slate-100 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-black mb-6">Contribute to the Insight</h2>
                    <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto text-lg">Are you a tech innovator in Rwanda with a story to tell? We want to feature you in our regular reports.</p>
                    <button className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-[#ff5a00] transition-all">Submit an Article</button>
                </div>
            </section>
        </div>
    );
};

export default Insights;
