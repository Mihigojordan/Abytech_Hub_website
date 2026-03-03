import React, { useEffect, useState, useRef } from "react";
import Header from "../components/header";
import {
  User, Mail, Phone, Building, GraduationCap, MapPin, Briefcase,
  FileText, Link as LinkIcon, Send, CheckCircle, AlertCircle,
  Plus, X, Upload, File, Sparkles, ArrowRight, ArrowLeft,
  Code2, Palette, BarChart3, Megaphone, Monitor, Grid3X3,
  Clock, Star, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import internshipService from "../services/internshipService";

const ORANGE = "#FF5A00";

const InternshipApplicationPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const cvInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", institution: "",
    fieldOfStudy: "", level: "", country: "", city: "",
    internshipType: "", period: "", coverLetter: "",
    skills: [], portfolioUrl: "", githubUrl: "", linkedinUrl: "",
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    document.documentElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) { setError("Please upload a PDF or Word document"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File size must be less than 5MB"); return; }
    setCvFile(file);
    setError("");
  };

  const removeCvFile = () => {
    setCvFile(null);
    if (cvInputRef.current) cvInputRef.current.value = "";
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const removeSkill = (s) => setFormData((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === "skills") submitData.append(k, JSON.stringify(v));
        else if (v) submitData.append(k, v);
      });
      if (cvFile) submitData.append("cv", cvFile);
      await internshipService.submitApplication(submitData);
      setSuccess(true);
      setFormData({ fullName: "", email: "", phone: "", institution: "", fieldOfStudy: "", level: "", country: "", city: "", internshipType: "", period: "", coverLetter: "", skills: [], portfolioUrl: "", githubUrl: "", linkedinUrl: "" });
      setCvFile(null);
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const internshipTypes = [
    { value: "SOFTWARE_DEVELOPMENT", label: "Software Dev", desc: "Web & mobile apps", icon: Code2 },
    { value: "UI_UX", label: "UI/UX Design", desc: "User experiences", icon: Palette },
    { value: "DATA", label: "Data & Analytics", desc: "Data and insights", icon: BarChart3 },
    { value: "MARKETING", label: "Digital Marketing", desc: "Grow our presence", icon: Megaphone },
    { value: "IT_SUPPORT", label: "IT Support", desc: "Tech infrastructure", icon: Monitor },
    { value: "OTHER", label: "Other", desc: "Other tech roles", icon: Grid3X3 },
  ];

  const periods = [
    { value: "ONE_MONTH", label: "1 Month" },
    { value: "THREE_MONTHS", label: "3 Months" },
    { value: "SIX_MONTHS", label: "6 Months" },
    { value: "ONE_YEAR", label: "1 Year" },
  ];

  const levels = ["High School", "Undergraduate", "Graduate", "Post-Graduate", "Recent Graduate", "Other"];

  const isStep1Valid = () => formData.fullName && formData.email && formData.phone && formData.institution && formData.fieldOfStudy && formData.level;
  const isStep2Valid = () => formData.country && formData.city && formData.internshipType && formData.period;

  const steps = [
    { n: 1, label: "Personal Info", icon: User },
    { n: 2, label: "Internship", icon: Briefcase },
    { n: 3, label: "Documents", icon: FileText },
  ];

  const inputClass = "w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all placeholder:text-gray-400";
  const iconInputClass = "w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition-all placeholder:text-gray-400";

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/20">
        <Header title="Apply for Internship" path="internship" />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100/60 to-amber-100/60 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100/60 to-emerald-100/60 rounded-full blur-3xl -ml-16 -mb-16" />
            <div className="relative">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted! 🎉</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Thank you for applying to AbyTech Hub's internship program. We've received your application and will review it shortly. You'll hear from us via email.
                </p>
                <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSuccess(false)}
                  className="inline-flex items-center space-x-2 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                  style={{ backgroundColor: ORANGE }}>
                  <Plus className="w-4 h-4" />
                  <span>Submit Another Application</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── MAIN PAGE ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-amber-50/10">
      <Header title="Apply for Internship" path="internship" />

      {/* Hero */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-orange-100/50 to-amber-100/50 rounded-full blur-3xl -mr-36 -mt-36" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl -ml-28 -mb-28" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
                <Sparkles className="w-5 h-5" style={{ color: ORANGE }} />
              </motion.div>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">Internship Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Launch Your <span style={{ color: ORANGE }}>Tech Career</span> with Us
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Join AbyTech Hub's internship program and gain hands-on experience in cutting-edge technologies. Work alongside industry experts and build real-world projects.
            </p>
          </motion.div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Zap, title: "Real Projects", desc: "Work on actual client projects and build your portfolio", color: "from-orange-500 to-amber-500" },
              { icon: Star, title: "Mentorship", desc: "Learn from experienced professionals in the industry", color: "from-blue-500 to-indigo-500" },
              { icon: ArrowRight, title: "Career Growth", desc: "Potential for full-time positions after completion", color: "from-green-500 to-emerald-500" },
            ].map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group text-left">
                <div className={`w-10 h-10 bg-gradient-to-br ${b.color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                  <b.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Step Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ scale: step === s.n ? 1.1 : 1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shadow-sm ${step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                    style={step >= s.n && step !== s.n ? {} : step === s.n ? { backgroundColor: ORANGE } : {}}
                  >
                    {step > s.n ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </motion.div>
                  <span className={`text-[10px] font-medium mt-1.5 ${step === s.n ? 'text-orange-500' : step > s.n ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-3 mb-4">
                    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div animate={{ width: step > s.n ? '100%' : '0%' }} transition={{ duration: 0.4 }} className="h-full rounded-full" style={{ backgroundColor: ORANGE }} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={() => setError("")} className="ml-auto hover:bg-red-100 rounded-full p-1 transition"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Personal Info ───────────────────────────── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-5">
                  <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,90,0,0.1)' }}>
                      <User className="w-4 h-4" style={{ color: ORANGE }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
                      <p className="text-xs text-gray-400">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name *", name: "fullName", type: "text", placeholder: "John Doe", Icon: User },
                      { label: "Email Address *", name: "email", type: "email", placeholder: "you@example.com", Icon: Mail },
                      { label: "Phone Number *", name: "phone", type: "tel", placeholder: "+250 7XX XXX XXX", Icon: Phone },
                      { label: "Institution/University *", name: "institution", type: "text", placeholder: "University of Rwanda", Icon: Building },
                      { label: "Field of Study *", name: "fieldOfStudy", type: "text", placeholder: "Computer Science", Icon: GraduationCap },
                    ].map(({ label, name, type, placeholder, Icon }) => (
                      <div key={name}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                        <div className="relative">
                          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} required className={iconInputClass} />
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Education Level *</label>
                      <select name="level" value={formData.level} onChange={handleChange} required className={inputClass}>
                        <option value="">Select level</option>
                        {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <motion.button type="button" whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(2)} disabled={!isStep1Valid()}
                      className="inline-flex items-center space-x-2 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: ORANGE }}>
                      <span>Next Step</span><ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Internship Details ──────────────────────── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,90,0,0.1)' }}>
                      <Briefcase className="w-4 h-4" style={{ color: ORANGE }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Internship Details</h3>
                      <p className="text-xs text-gray-400">Choose your area and duration</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Country *", name: "country", placeholder: "Rwanda" },
                      { label: "City *", name: "city", placeholder: "Kigali" },
                    ].map(({ label, name, placeholder }) => (
                      <div key={name}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="text" name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} required className={iconInputClass} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-3">Department / Area of Interest *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {internshipTypes.map((t) => {
                        const selected = formData.internshipType === t.value;
                        return (
                          <label key={t.value} className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all group ${selected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <input type="radio" name="internshipType" value={t.value} checked={selected} onChange={handleChange} className="sr-only" />
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all ${selected ? 'bg-orange-500' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                              <t.icon className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <span className={`text-xs font-semibold ${selected ? 'text-orange-700' : 'text-gray-800'}`}>{t.label}</span>
                            <span className={`text-[10px] mt-0.5 ${selected ? 'text-orange-500' : 'text-gray-400'}`}>{t.desc}</span>
                            {selected && <CheckCircle className="absolute top-2.5 right-2.5 w-4 h-4 text-orange-500" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-3">Preferred Duration *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {periods.map((p) => {
                        const selected = formData.period === p.value;
                        return (
                          <label key={p.value} className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                            <input type="radio" name="period" value={p.value} checked={selected} onChange={handleChange} className="sr-only" />
                            <Clock className={`w-4 h-4 mb-1 ${selected ? 'text-orange-500' : 'text-gray-400'}`} />
                            <span className={`text-xs font-semibold ${selected ? 'text-orange-700' : 'text-gray-800'}`}>{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(1)}
                      className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 border-2 border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                      <ArrowLeft className="w-4 h-4" /><span>Previous</span>
                    </motion.button>
                    <motion.button type="button" whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(3)} disabled={!isStep2Valid()}
                      className="inline-flex items-center space-x-2 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: ORANGE }}>
                      <span>Next Step</span><ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Documents & Skills ──────────────────────── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,90,0,0.1)' }}>
                      <FileText className="w-4 h-4" style={{ color: ORANGE }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Documents & Skills</h3>
                      <p className="text-xs text-gray-400">Upload your CV and list your skills</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Skills</label>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill (e.g., React, Python)" className={`${inputClass} flex-1`} />
                      <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addSkill}
                        className="px-4 py-3 text-white rounded-xl transition-colors shadow-sm" style={{ backgroundColor: ORANGE }}>
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, i) => (
                          <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(255,90,0,0.1)', color: ORANGE }}>
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:opacity-70 transition-opacity"><X className="w-3 h-3" /></button>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cover Letter *</label>
                    <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange}
                      placeholder="Tell us about yourself, why you want to join AbyTech Hub, and what you hope to learn..."
                      required rows={5} className={`${inputClass} resize-none`} />
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">CV / Resume *</label>
                    <input type="file" ref={cvInputRef} onChange={handleCvChange} accept=".pdf,.doc,.docx" className="hidden" />
                    {!cvFile ? (
                      <div onClick={() => cvInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Upload className="w-8 h-8 text-gray-300 group-hover:text-orange-400 mx-auto mb-3 transition-colors" />
                        </motion.div>
                        <p className="text-sm font-medium text-gray-600 group-hover:text-orange-600 transition-colors">Click to upload your CV / Resume</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX — max 5 MB</p>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="border-2 rounded-xl p-4 flex items-center justify-between" style={{ borderColor: ORANGE, backgroundColor: 'rgba(255,90,0,0.04)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,90,0,0.15)' }}>
                            <File className="w-5 h-5" style={{ color: ORANGE }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{cvFile.name}</p>
                            <p className="text-xs text-gray-400">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={removeCvFile} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Portfolio URL", name: "portfolioUrl", placeholder: "https://yourportfolio.com" },
                      { label: "GitHub URL", name: "githubUrl", placeholder: "https://github.com/username" },
                      { label: "LinkedIn URL", name: "linkedinUrl", placeholder: "https://linkedin.com/in/username" },
                    ].map(({ label, name, placeholder }) => (
                      <div key={name}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="url" name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} className={iconInputClass} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep(2)}
                      className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 border-2 border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                      <ArrowLeft className="w-4 h-4" /><span>Previous</span>
                    </motion.button>
                    <motion.button type="submit" whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                      disabled={loading || !formData.coverLetter || !cvFile}
                      className="inline-flex items-center space-x-2 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: ORANGE }}>
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></>
                      ) : (
                        <><Send className="w-4 h-4" /><span>Submit Application</span></>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternshipApplicationPage;
