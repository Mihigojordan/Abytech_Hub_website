import { useState } from "react";
import { LuGraduationCap } from "react-icons/lu";
import { MdOutlineWorkOutline, MdOutlineVerified, MdPersonOutline } from "react-icons/md";
import { IoIosRocket } from "react-icons/io";

const STEPS = [
  { label: "Personal Info",  tip: "You'll need your digital transcripts for the next step.", time: "8 mins",  icon: <MdPersonOutline /> },
  { label: "Education",      tip: "Have your GPA and institution details ready.",             time: "6 mins",  icon: <LuGraduationCap /> },
  { label: "Experience",     tip: "List any internships, part-time jobs, or volunteer work.", time: "10 mins", icon: <MdOutlineWorkOutline /> },
  { label: "Review",         tip: "Double-check all fields before submitting.",               time: "3 mins",  icon: <MdOutlineVerified /> },
];

const STEP_TITLES = ["Step 1: Personal Profile","Step 2: Education","Step 3: Experience","Step 4: Final Review"];
const STEP_SUBS   = ["Tell us about yourself to get started.","Share your academic background.","List your work experience.","Review and submit your application."];
const PROG_TITLES = ["Drafting Personal Details","Drafting Education Details","Drafting Experience Details","Final Review"];
const IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuC1H0h4QMokaOXGgg-NjajOVeayjb2Niwa4GEqQ-dzW8IHOUa6IY1VsHHO_u4ca0EH9cRLEK9jE5BBxw_nUf51EytS6AaVLhevi59zvn1BkGShBfF_hQoT0vk6e-LfIRTzDWULuwrgXDzOu6P3LQgW34-lsl9gu9jW1Hnk2WO9JuT51uKZ8PJXbKSb93u4B5YOIAdV1qglMykX-Y0-qMvzghOh8uCf6oAzIW9cySj-nZhDj3rmF9mzwCytjJ3q7Zn3qbBhnSf2rw7OG";

const FILL_WIDTHS = ["0%", "33.33%", "66.66%", "100%"];

export default function InternshipApplicationPage() {
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]   = useState(false);

  const pct    = Math.round(((step + 1) / STEPS.length) * 100);
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    if (loading || isLast) return;
    setLoading(true);
    setTimeout(() => { setStep(s => s + 1); setLoading(false); }, 800);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-screen mt-17 bg-slate-100 flex flex-col items-center justify-center p-8"
         style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-13 h-13 bg-primary-500 rounded-2xl flex items-center justify-center p-3">
          <IoIosRocket className="text-white text-2xl" />
        </div>
        <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Internship Application Portal
        </h1>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-4">

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 flex overflow-hidden">
          <div className="w-[42%] min-h-[170px] bg-cover bg-center flex-shrink-0"
               style={{ backgroundImage: `url(${IMG})` }} />
          <div className="flex-1 p-8 flex flex-col justify-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">Candidate Intake</p>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight" style={{ fontFamily: "'inter', sans-serif" }}>
              Launch Your Career
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Complete your profile to connect with world-leading companies. Your data is securely saved as you progress through each step.
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* Card header */}
          <div className="px-10 pt-9 pb-0 flex justify-between items-start">
            <div>
              <h3 className="text-[22px] font-extrabold text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {STEP_TITLES[step]}
              </h3>
              <p className="text-[13px] text-slate-400 font-medium mt-1">{STEP_SUBS[step]}</p>
            </div>
            <span className="bg-slate-100 border border-slate-200 text-primary-500 text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
              Active Session
            </span>
          </div>

          {/* Stepper */}
          <div className="px-10 pt-8 pb-2">
            <div className="relative">
              {/* Track */}
              <div className="absolute left-6 right-6 h-[2px] bg-primary-500 rounded-full" style={{ top: 24 }} />
              <div className="absolute left-6 h-[2px] bg-primary-500 rounded-full transition-all duration-700"
                   style={{ top: 24, width: `calc(${FILL_WIDTHS[step]} * (100% - 48px) / 100)` }} />
              {/* Icons */}
              <div className="relative flex justify-between">
                {STEPS.map((s, i) => {
                  const active = i === step, done = i < step;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2.5">
                      <div className={[
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 text-[22px]",
                        active ? "bg-primary-500  border-primary-500 text-white"
                               : done   ? "bg-white border-primary-500 text-primary-500"
                                        : "bg-white border-slate-200 text-slate-300"
                      ].join(" ")}>
                        {s.icon}
                      </div>
                      <span className={[
                        "text-[11px] font-bold uppercase tracking-wide",
                        active ? "text-slate-800" : "text-slate-400"
                      ].join(" ")}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress card */}
          <div className="px-10 pt-7">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500  inline-block" />
                  <span className="text-[15px] font-bold text-slate-900">{PROG_TITLES[step]}</span>
                </div>
                <div className="text-right">
                 onClick={goNext}
                  <div className="text-[26px] font-extrabold text-primary-500 leading-none">{pct}%</div>
                  <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-0.5">Completion</div>
                </div>
              </div>
              <div className="bg-slate-200 rounded-full h-[7px] mb-4">
                <div className="h-full bg-primary-500  rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.5" fill="currentColor" strokeWidth="2"/>
                </svg>
                <p className="text-[13px] text-slate-500 font-medium">
                  <strong className="text-slate-700 font-semibold">Tip:</strong> {STEPS[step].tip}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 pt-6 pb-9 flex justify-between items-center">
            <p className="text-[13px] text-slate-400 font-medium">
              Estimated time remaining:{" "}
              <strong className="text-slate-700 font-bold">{STEPS[step].time}</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-3 border border-slate-300 bg-white text-slate-500 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                {saved ? "✓ Saved!" : "Save Draft"}
              </button>
              <button
                disabled={loading || isLast}
                className="px-7 py-3 bg-primary-500  text-white rounded-xl text-sm font-bold hover:bg-primary-600 disabled:opacity-60 transition-all flex items-center gap-2"
              >
                {loading ? "Saving..." : isLast ? "Submit Application" : "Next Step →"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}