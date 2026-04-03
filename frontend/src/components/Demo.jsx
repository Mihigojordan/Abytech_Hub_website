import React, { useState, useEffect } from 'react';

const Demo = () => {
    const totalSteps = 4;
    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        product: '',
        demoType: '',
        message: '',
        preferredDate: '',
        preferredTime: ''
    });

    const [isStep1Valid, setIsStep1Valid] = useState(false);
    const [isStep2Valid, setIsStep2Valid] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleInputChange = (e) => {
        const { id, name, value, type } = e.target;
        const field = type === 'radio' ? name : id;
        const newFormData = { ...formData, [field]: value };
        setFormData(newFormData);

        if (currentStep === 1) {
            setIsStep1Valid(
                !!newFormData.fullName.trim() &&
                !!newFormData.email.trim() &&
                isValidEmail(newFormData.email.trim())
            );
        } else if (currentStep === 2) {
            setIsStep2Valid(!!newFormData.demoType);
        }
    };

    const handleDemoTypeChange = (e) => {
        setFormData({ ...formData, demoType: e.target.value });
        setIsStep2Valid(true);
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const submitForm = () => {
        console.log('Submitting form data:', formData);
        setCurrentStep(5);
    };

    const progressWidth = currentStep === 0 || currentStep === 5
        ? '0%'
        : `${(currentStep / totalSteps) * 100}%`;

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    return (
        <div className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans overflow-x-hidden relative">
            {/* Background decorations */}
            <div className="fixed top-[-12%] right-[-6%] w-[550px] h-[550px] rounded-full [background:radial-gradient(circle,rgba(234,88,12,0.08)_0%,transparent_65%)] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-18%] left-[-10%] w-[650px] h-[650px] rounded-full [background:radial-gradient(circle,rgba(251,146,60,0.05)_0%,transparent_70%)] pointer-events-none z-0"></div>
            <div className="fixed top-[40%] right-[8%] w-[180px] h-[180px] border-2 border-orange-600/10 [border-radius:30%_70%_70%_30%/30%_30%_70%_70%] rotate-25 pointer-events-none z-0"></div>

            {/* Progress bar */}
            <div className={`fixed top-0 left-0 right-0 h-1 bg-orange-600/10 z-50 transition-opacity duration-300 ${currentStep > 0 && currentStep < 5 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-full bg-gradient-to-r from-orange-700 to-orange-600 transition-all duration-500 ease-out" style={{ width: progressWidth }}></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-10">
                <div className="bg-white rounded-3xl shadow-[0_4px_6px_rgba(0,0,0,0.02),0_12px_24px_rgba(0,0,0,0.04),0_24px_48px_rgba(234,88,12,0.06)] max-w-2xl w-full overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-orange-600 to-orange-400"></div>

                    <div className="p-8 md:p-14 min-h-[500px]">
                        {/* Step 0: Welcome */}
                        {currentStep === 0 && (
                            <div className="animate-[fadeIn_0.5s_forwards]">
                                <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-800 leading-tight mb-5 tracking-tight">See AbyDash<br />in action</h1>
                                <p className="text-lg text-stone-500 mb-10 leading-relaxed">Schedule a personalized walkthrough of our platform. We'll show you exactly how AbyDash can transform your business operations.</p>

                                <ul className="space-y-5 mb-10">
                                    {[
                                        {
                                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                            title: "Live demonstration",
                                            desc: "See real features, not slides"
                                        },
                                        {
                                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                            title: "30-minute session",
                                            desc: "Focused on your specific needs"
                                        },
                                        {
                                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
                                            title: "Get answers",
                                            desc: "Ask anything about pricing, features, or implementation"
                                        }
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-orange-600/[0.03] border-l-4 border-orange-600">
                                            <svg className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {feature.icon}
                                            </svg>
                                            <div>
                                                <strong className="block font-semibold text-stone-800 mb-1">{feature.title}</strong>
                                                <span className="text-stone-500 text-sm">{feature.desc}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex flex-col sm:flex-row gap-3 mt-10">
                                    <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2" onClick={nextStep}>
                                        Get Started
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="animate-[fadeIn_0.5s_forwards]">
                                <span className="inline-block font-serif text-sm font-semibold text-orange-600 uppercase tracking-widest mb-3">Step 1 of 4</span>
                                <h2 className="font-serif text-3xl font-bold text-stone-800 mb-4">Let's start with the basics</h2>
                                <p className="text-lg text-stone-500 mb-10">How should we address you?</p>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="fullName" className="block font-medium text-sm mb-2 text-stone-800">Full Name *</label>
                                        <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Mutsinzi" required className="w-full p-4 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200" />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block font-medium text-sm mb-2 text-stone-800">Email Address *</label>
                                        <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="john@company.rw" required className="w-full p-4 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200" />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block font-medium text-sm mb-2 text-stone-800">Phone Number</label>
                                        <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} placeholder="+250 788 123 456" className="w-full p-4 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200" />
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10">
                                    <button className="sm:w-auto w-full bg-transparent border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 text-stone-500 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" onClick={prevStep}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                        </svg>
                                        Back
                                    </button>
                                    <button className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2" onClick={nextStep} disabled={!isStep1Valid}>
                                        Continue
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Demo Type */}
                        {currentStep === 2 && (
                            <div className="animate-[fadeIn_0.5s_forwards]">
                                <span className="inline-block font-serif text-sm font-semibold text-orange-600 uppercase tracking-widest mb-3">Step 2 of 4</span>
                                <h2 className="font-serif text-3xl font-bold text-stone-800 mb-4">What would you like to see?</h2>
                                <p className="text-lg text-stone-500 mb-10">Choose the type of demonstration you're interested in</p>

                                <div className="grid gap-3 mb-8">
                                    {[
                                        { id: 'PRODUCT', title: 'Full Product Tour', desc: 'Comprehensive walkthrough of all AbyDash features and capabilities' },
                                        { id: 'FEATURE', title: 'Specific Feature Demo', desc: 'Deep dive into particular features relevant to your needs' },
                                        { id: 'CUSTOM', title: 'Custom Demonstration', desc: 'Tailored demo based on your specific business requirements' }
                                    ].map(type => (
                                        <div key={type.id} className="relative">
                                            <input type="radio" name="demoType" value={type.id} id={`demo${type.id}`} checked={formData.demoType === type.id} onChange={handleDemoTypeChange} className="peer absolute opacity-0 pointer-events-none" />
                                            <label htmlFor={`demo${type.id}`} className="block p-5 border-2 border-stone-200 rounded-xl cursor-pointer transition-all duration-200 bg-white hover:border-orange-400 hover:bg-orange-600/[0.02] peer-checked:border-orange-600 peer-checked:bg-orange-600/[0.05]">
                                                <div className="font-semibold text-base text-stone-800 mb-1">{type.title}</div>
                                                <div className="text-sm text-stone-500">{type.desc}</div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="companyName" className="block font-medium text-sm mb-2 text-stone-800">Company Name</label>
                                        <input type="text" id="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Your company" className="w-full p-4 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200" />
                                    </div>

                                    <div>
                                        <label htmlFor="product" className="block font-medium text-sm mb-2 text-stone-800">Interested In</label>
                                        <div className="relative">
                                            <select id="product" value={formData.product} onChange={handleInputChange} className="w-full p-4 pr-11 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200 appearance-none cursor-pointer">
                                                <option value="">Select a product...</option>
                                                <option value="Restaurant Management">Restaurant Management</option>
                                                <option value="Inventory System">Inventory System</option>
                                                <option value="Booking Platform">Booking Platform</option>
                                                <option value="Delivery Management">Delivery Management</option>
                                                <option value="Full Platform">Full Platform</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-800">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10">
                                    <button className="sm:w-auto w-full bg-transparent border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 text-stone-500 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" onClick={prevStep}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                        </svg>
                                        Back
                                    </button>
                                    <button className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2" onClick={nextStep} disabled={!isStep2Valid}>
                                        Continue
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Details */}
                        {currentStep === 3 && (
                            <div className="animate-[fadeIn_0.5s_forwards]">
                                <span className="inline-block font-serif text-sm font-semibold text-orange-600 uppercase tracking-widest mb-3">Step 3 of 4</span>
                                <h2 className="font-serif text-3xl font-bold text-stone-800 mb-4">Tell us more</h2>
                                <p className="text-lg text-stone-500 mb-10">What specific challenges are you looking to solve?</p>

                                <div>
                                    <label htmlFor="message" className="block font-medium text-sm mb-2 text-stone-800">Your Message</label>
                                    <textarea id="message" value={formData.message} onChange={handleInputChange} placeholder="Tell us about your business, what you're hoping to achieve, or any specific questions you have..." className="w-full p-4 min-h-[160px] border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200 resize-y"></textarea>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10">
                                    <button className="sm:w-auto w-full bg-transparent border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 text-stone-500 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" onClick={prevStep}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                        </svg>
                                        Back
                                    </button>
                                    <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2" onClick={nextStep}>
                                        Continue
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Scheduling */}
                        {currentStep === 4 && (
                            <div className="animate-[fadeIn_0.5s_forwards]">
                                <span className="inline-block font-serif text-sm font-semibold text-orange-600 uppercase tracking-widest mb-3">Step 4 of 4</span>
                                <h2 className="font-serif text-3xl font-bold text-stone-800 mb-4">When works best?</h2>
                                <p className="text-lg text-stone-500 mb-10">Help us find a convenient time for your demo</p>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="preferredDate" className="block font-medium text-sm mb-2 text-stone-800">Preferred Date</label>
                                        <input type="date" id="preferredDate" value={formData.preferredDate} onChange={handleInputChange} min={getTodayDate()} className="w-full p-4 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200" />
                                    </div>

                                    <div>
                                        <label htmlFor="preferredTime" className="block font-medium text-sm mb-2 text-stone-800">Preferred Time</label>
                                        <div className="relative">
                                            <select id="preferredTime" value={formData.preferredTime} onChange={handleInputChange} className="w-full p-4 pr-11 border-2 border-stone-200 rounded-xl font-sans bg-white focus:border-orange-600 focus:ring-4 focus:ring-orange-600/10 outline-none transition-all duration-200 appearance-none cursor-pointer">
                                                <option value="">Select a time range...</option>
                                                <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
                                                <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                                                <option value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-800">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-10">
                                    <button className="sm:w-auto w-full bg-transparent border-2 border-stone-200 hover:bg-stone-100 hover:border-stone-300 text-stone-500 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2" onClick={prevStep}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                        </svg>
                                        Back
                                    </button>
                                    <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center gap-2" onClick={submitForm}>
                                        Submit Request
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Success */}
                        {currentStep === 5 && (
                            <div className="animate-[fadeIn_0.5s_forwards] text-center py-10">
                                <svg className="w-20 h-20 mx-auto mb-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>

                                <h2 className="font-serif text-3xl font-bold text-stone-800 mb-4">We've received your request!</h2>
                                <p className="text-lg text-stone-500 mb-10">Our team will review your information and get back to you within 24 hours to confirm your demo schedule.</p>

                                <div className="mt-8 p-6 bg-orange-600/[0.05] rounded-xl text-left border border-orange-600/10">
                                    <strong className="block mb-3 text-stone-800 font-semibold">What happens next?</strong>
                                    <ol className="list-decimal ml-5 text-stone-500 space-y-2">
                                        <li>We'll send a confirmation email to <span className="text-orange-600 font-semibold">{formData.email}</span></li>
                                        <li>Our team will reach out to finalize the demo schedule</li>
                                        <li>You'll receive a calendar invite with the meeting link</li>
                                    </ol>
                                </div>

                                <div className="flex justify-center mt-10">
                                    <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(234,88,12,0.3)]" onClick={() => window.location.reload()}>
                                        Request Another Demo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Demo;