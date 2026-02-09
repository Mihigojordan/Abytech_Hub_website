import React, { useEffect } from "react";
import Header from "../../components/header";
import { Element } from "react-scroll";

const Training = () => {
    useEffect(() => {
        document.documentElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "start",
        });
    }, []);

    const programsData = [
        {
            id: "academic-partnership",
            title: "Academic Partnership",
            badge: "UNIVERSITY COLLABORATION",
            description: "Bridging the gap between academia and industry through hands-on technical training and project-based learning.",
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
            overview: [
                { label: "Duration", value: "Academic Year", icon: "📅" },
                { label: "Schedule", value: "Flexible", icon: "⏰" },
                { label: "Target", value: "Students", icon: "🎓" },
                { label: "Cost", value: "Program Dependent", icon: "💰" }
            ]
        },
        {
            id: "amazon-career-choice",
            title: "Amazon Career Choice",
            badge: "AMAZON PARTNERSHIP",
            description: "Exclusive training program for Amazon employees. Amazon covers 95% of tuition costs for high-demand tech skills.",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
            overview: [
                { label: "Duration", value: "9 Months", icon: "📅" },
                { label: "Schedule", value: "Shift Friendly", icon: "⏰" },
                { label: "Coverage", value: "95% Tuition", icon: "💰" },
                { label: "Outcome", value: "Internal Transfer", icon: "🚀" }
            ]
        },
        {
            id: "tech-apprenticeship",
            title: "Tech Apprenticeship",
            badge: "EARN WHILE YOU LEARN",
            description: "Paid on-the-job training at leading tech companies. Gain real-world experience and guaranteed job placement.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
            overview: [
                { label: "Duration", value: "12 Months", icon: "📅" },
                { label: "Schedule", value: "Full-Time", icon: "⏰" },
                { label: "Stipend", value: "$2,000/mo", icon: "💰" },
                { label: "Job Offer", value: "100% Guaranteed", icon: "🎯" }
            ]
        },
        {
            id: "cisco-training",
            title: "Cisco Certifications",
            badge: "NETWORK PROFESSIONAL",
            description: "Master networking with CCNA and CCNP tracks. Hands-on labs with real Cisco equipment and expert instruction.",
            image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop",
            overview: [
                { label: "Duration", value: "16 Weeks", icon: "📅" },
                { label: "Schedule", value: "Weekends", icon: "⏰" },
                { label: "Level", value: "Intermediate", icon: "⚙️" },
                { label: "Cert", value: "Official CCNA/CCNP", icon: "📜" }
            ]
        },
        {
            id: "three-month-training",
            title: "3 Month Intensive",
            badge: "PROFESSIONAL TRACK",
            description: "Fast-track your development career. Intensive full-stack training from basics to industry-ready status.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
            overview: [
                { label: "Duration", value: "3 Months", icon: "📅" },
                { label: "Schedule", value: "6 PM - 9 PM", icon: "⏰" },
                { label: "Intensity", value: "High", icon: "🔥" },
                { label: "Focus", value: "Full-Stack", icon: "💻" }
            ]
        },
        {
            id: "six-month-training",
            title: "6 Month Mastery",
            badge: "EXPERT PROGRAM",
            description: "Deep dive into software engineering. Master architecture, DevOps, and advanced systems in a 6-month journey.",
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
            overview: [
                { label: "Duration", value: "6 Months", icon: "📅" },
                { label: "Schedule", value: "Flexible", icon: "⏰" },
                { label: "Intensity", value: "Comprehensive", icon: "📚" },
                { label: "Path", value: "Senior Developer", icon: "👑" }
            ]
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header title="Training Programs" path="training" />

            {/* Hero Section */}
            <section className="relative py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Launch Your <span className="text-[#ff5a00]">Tech Career</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                        From foundation to expert mastery, choose the training path that aligns with your goals. Expert-led, industry-aligned, and results-driven programs.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-[#ff5a00] transition-colors shadow-xl">
                            Apply to All Programs
                        </button>
                        <button className="border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors">
                            Speak with an Advisor
                        </button>
                    </div>
                </div>
                {/* Subtle decorative elements */}
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#ff5a00]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            </section>

            {/* Programs Sections */}
            <div className="container mx-auto px-4 py-20 divide-y-2 divide-gray-100">
                {programsData.map((program, index) => (
                    <Element name={program.id} key={program.id} className="py-32 first:pt-0 last:pb-0">
                        <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-start`}>
                            <div className="flex-1 space-y-8">
                                <div className="inline-flex items-center gap-2 bg-[#ff5a00]/10 text-[#ff5a00] px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                                    <span className="w-2 h-2 bg-[#ff5a00] rounded-full animate-pulse"></span>
                                    {program.badge}
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1]">
                                    {program.title}
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                    {program.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {program.overview.map((item, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 group hover:border-[#ff5a00]/20 transition-colors">
                                            <div className="text-3xl mb-3">{item.icon}</div>
                                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</div>
                                            <div className="text-lg font-black text-gray-900">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button className="flex-1 bg-[#ff5a00] hover:bg-[#ff7a30] text-white px-8 py-5 rounded-2xl font-black text-lg transition-all transform hover:-translate-y-1 shadow-2xl active:scale-95">
                                        Enroll Now
                                    </button>
                                    <button className="px-8 py-5 rounded-2xl border-2 border-gray-200 text-gray-900 font-black hover:bg-gray-50 transition-colors">
                                        Curriculum
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 w-full relative">
                                <div className="rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transform transition-transform hover:scale-[1.01]">
                                    <img
                                        src={program.image}
                                        alt={program.title}
                                        className="w-full object-cover aspect-[4/5] lg:aspect-square"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end p-12">
                                        <p className="text-white text-lg font-bold italic opacity-90">
                                            "Real-world projects, expert guidance, and a supportive community – everything you need to succeed."
                                        </p>
                                    </div>
                                </div>
                                {/* Decorative background shape */}
                                <div className={`absolute -z-10 w-full h-full border-4 border-[#ff5a00]/10 rounded-[2.5rem] ${index % 2 === 0 ? '-top-4 -left-4' : '-bottom-4 -right-4'}`}></div>
                            </div>
                        </div>
                    </Element>
                ))}
            </div>

            {/* Social Proof / Certification Logos (Unified) */}
            <section className="py-24 bg-white border-y border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mb-12">Program Certifications & Partners</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
                        <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg"></div> Amazon
                        </div>
                        <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div> Cisco
                        </div>
                        <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#ff5a00] rounded-lg"></div> AbyTech Hub
                        </div>
                        <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg"></div> University
                        </div>
                    </div>
                </div>
            </section>

            {/* Global CTA */}
            <section className="py-32 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                        Not Sure Which <span className="text-[#ff5a00]">Program</span> Is Right for You?
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
                        Schedule a free career strategy call with our admissions team. We'll help you map out your path based on your background and aspirations.
                    </p>
                    <button className="bg-[#ff5a00] hover:bg-white hover:text-[#ff5a00] text-white px-12 py-6 rounded-full font-black text-xl transition-all shadow-2xl transform hover:scale-105">
                        Book a Strategy Call
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Training;
