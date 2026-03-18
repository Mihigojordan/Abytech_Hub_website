import React, { useState, useEffect, useRef } from 'react'

// ─── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'internsPortal_applicationData'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { }
}

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  currentStep: 1,
  lastSaved: null,
  personal: { photo: null, fullName: '', email: '', phone: '', linkedin: '', bio: '' },
  academic: { institution: '', degree: '', major: '', gpa: '', graduationYear: '', transcript: null },
  professional: { company: '', role: '', duration: '', skills: '', coverLetter: '', portfolio: '' },
}

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, num: '01', category: 'Current Step', label: 'Personal Identity' },
  { id: 2, num: '02', category: 'Academic', label: 'Excellence' },
  { id: 3, num: '03', category: 'Professional', label: 'Journey' },
  { id: 4, num: '04', category: 'Finalize', label: 'Review & Submit' },
]

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    diamond: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 2L2 8l10 14L22 8l-4-6H6zm1.5 2h9l2.5 4H5L7.5 4zM4.5 9h15L12 19.5 4.5 9z" />
      </svg>
    ),
    camera: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4z" />
        <path d="M9 3L7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9zm3 14a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
      </svg>
    ),
    phone: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5S10.67 19 11.5 19s1.5.67 1.5 1.5S12.33 22 11.5 22zm4.5-4H7V4h9v14z" />
      </svg>
    ),
    share: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 0 0 0-6 3 3 0 0 0-3 3c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 0 0 6 9a3 3 0 0 0 0 6c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a3 3 0 1 0 3-2.92z" />
      </svg>
    ),
    shield: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
      </svg>
    ),
    arrow: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
    upload: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
      </svg>
    ),
    person: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    check: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    ),
    school: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z" />
      </svg>
    ),
    work: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm-8-1a1 1 0 0 1 2 0c0 .14-.05.33-.1.5h-1.8c-.05-.17-.1-.36-.1-.5zM19 17H11V8h8v9z" />
        <path d="M4 8H2v13c0 1.1.9 2 2 2h13v-2H4V8z" />
      </svg>
    ),
  }
  return icons[name] || null
}

// ─── Input components ─────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1B]/70 mb-3">
    {children}
  </label>
)

const Input = ({ icon, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 pointer-events-none">
        <Icon name={icon} className="w-5 h-5" />
      </span>
    )}
    <input
      {...props}
      className={`w-full ${icon ? 'pl-14' : 'pl-5'} pr-5 py-4 rounded-xl border border-[#D1D1CF] bg-white text-[#1A1A1B] focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] text-sm`}
    />
  </div>
)

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full px-5 py-4 rounded-xl border border-[#D1D1CF] bg-white text-[#1A1A1B] focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] resize-none text-sm"
  />
)

// ─── Step 1: Personal Identity ────────────────────────────────────────────────
const PersonalStep = ({ data, onChange }) => {
  const fileRef = useRef()

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange('photo', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-14">
      {/* Photo upload card */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-10 p-10 rounded-3xl bg-white border border-[#D1D1CF] shadow-sm">
        <div className="relative group flex-shrink-0">
          <div className="w-36 h-36 rounded-full bg-[#F9F9F7] flex items-center justify-center overflow-hidden border-2 border-primary-500/20 ring-8 ring-[#F9F9F7] group-hover:border-primary-500/50 transition-colors shadow-inner">
            {data.photo
              ? <img src={data.photo} alt="Candidate" className="w-full h-full object-cover" />
              : <Icon name="person" className="w-16 h-16 text-gray-300" />
            }
          </div>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="absolute bottom-1 right-1 bg-[#1A1A1B] text-primary-500 p-2.5 rounded-full shadow-2xl hover:scale-110 transition-transform"
          >
            <Icon name="camera" className="w-5 h-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1A1A1B]">Candidate Photograph</h3>
          <p className="text-base text-[#4A4A4E] mt-2 max-w-sm font-light">
            Upload a high-resolution professional portrait. Recommended format: JPG/PNG (Max 5MB).
          </p>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="mt-5 text-xs font-black text-primary-500 tracking-[0.2em] uppercase hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            Select File <Icon name="upload" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <Label>Full Legal Name</Label>
          <Input type="text" placeholder="Alexander Rivera" value={data.fullName} onChange={e => onChange('fullName', e.target.value)} />
        </div>
        <div>
          <Label>Primary Email</Label>
          <Input type="email" placeholder="alex.rivera@ivy-university.edu" value={data.email} onChange={e => onChange('email', e.target.value)} />
        </div>
        <div>
          <Label>Contact Number</Label>
          <Input icon="phone" type="tel" placeholder="+1 (555) 0123-4567" value={data.phone} onChange={e => onChange('phone', e.target.value)} />
        </div>
        <div>
          <Label>Professional Profile (LinkedIn)</Label>
          <Input icon="share" type="url" placeholder="linkedin.com/in/alexrivera" value={data.linkedin} onChange={e => onChange('linkedin', e.target.value)} />
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label>Executive Summary</Label>
        <Textarea
          rows={6}
          placeholder="Articulate your career aspirations and what drives your pursuit of excellence..."
          value={data.bio}
          onChange={e => onChange('bio', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Step 2: Academic Excellence ─────────────────────────────────────────────
const AcademicStep = ({ data, onChange }) => {
  const fileRef = useRef()
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    onChange('transcript', file.name)
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <Label>Institution Name</Label>
          <Input type="text" placeholder="Harvard University" value={data.institution} onChange={e => onChange('institution', e.target.value)} />
        </div>
        <div>
          <Label>Degree Program</Label>
          <Input type="text" placeholder="Bachelor of Science" value={data.degree} onChange={e => onChange('degree', e.target.value)} />
        </div>
        <div>
          <Label>Field of Study / Major</Label>
          <Input type="text" placeholder="Computer Science" value={data.major} onChange={e => onChange('major', e.target.value)} />
        </div>
        <div>
          <Label>Cumulative GPA</Label>
          <Input type="text" placeholder="3.95 / 4.00" value={data.gpa} onChange={e => onChange('gpa', e.target.value)} />
        </div>
        <div>
          <Label>Expected Graduation Year</Label>
          <Input type="text" placeholder="2025" value={data.graduationYear} onChange={e => onChange('graduationYear', e.target.value)} />
        </div>
        <div>
          <Label>Academic Transcript</Label>
          <div
            onClick={() => fileRef.current.click()}
            className="w-full px-5 py-4 rounded-xl border border-dashed border-primary-500/40 bg-primary-500/5 text-[#4A4A4E] cursor-pointer hover:border-primary-500/70 hover:bg-primary-500/10 transition-all flex items-center gap-3 text-sm"
          >
            <Icon name="upload" className="w-5 h-5 text-primary-500" />
            {data.transcript ? <span className="text-[#1A1A1B] font-medium">{data.transcript}</span> : <span className="text-gray-400">Upload transcript (PDF)</span>}
          </div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Professional Journey ────────────────────────────────────────────
const ProfessionalStep = ({ data, onChange }) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
      <div>
        <Label>Most Recent Company</Label>
        <Input type="text" placeholder="McKinsey & Company" value={data.company} onChange={e => onChange('company', e.target.value)} />
      </div>
      <div>
        <Label>Role / Title</Label>
        <Input type="text" placeholder="Business Analyst" value={data.role} onChange={e => onChange('role', e.target.value)} />
      </div>
      <div>
        <Label>Duration</Label>
        <Input type="text" placeholder="Jun 2023 – Aug 2023" value={data.duration} onChange={e => onChange('duration', e.target.value)} />
      </div>
      <div>
        <Label>Portfolio / Personal Site</Label>
        <Input icon="share" type="url" placeholder="yourportfolio.com" value={data.portfolio} onChange={e => onChange('portfolio', e.target.value)} />
      </div>
    </div>
    <div>
      <Label>Key Skills</Label>
      <Input type="text" placeholder="Python, Data Analysis, Strategic Planning, Public Speaking" value={data.skills} onChange={e => onChange('skills', e.target.value)} />
    </div>
    <div>
      <Label>Cover Letter / Statement of Purpose</Label>
      <Textarea
        rows={8}
        placeholder="Describe your professional journey, achievements, and why you're an exceptional candidate..."
        value={data.coverLetter}
        onChange={e => onChange('coverLetter', e.target.value)}
      />
    </div>
  </div>
)

// ─── Step 4: Review & Submit ──────────────────────────────────────────────────
const ReviewStep = ({ appData, onSubmit }) => {
  const { personal, academic, professional } = appData

  const Section = ({ title, icon, rows }) => (
    <div className="p-8 rounded-2xl bg-white border border-[#D1D1CF] shadow-sm space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-[#D1D1CF]">
        <div className="w-8 h-8 rounded-lg bg-[#1A1A1B] flex items-center justify-center text-primary-500">
          <Icon name={icon} className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1A1A1B]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(([label, val]) => val ? (
          <div key={label}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1B]/50 mb-1">{label}</p>
            <p className="text-sm text-[#1A1A1B] font-medium">{val}</p>
          </div>
        ) : null)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-start gap-4">
        <Icon name="shield" className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#4A4A4E] font-medium">
          Please review your application carefully before submitting. All data has been saved securely and both previously saved and current data will be submitted together.
        </p>
      </div>

      {personal.photo && (
        <div className="flex items-center gap-5 p-6 rounded-2xl bg-white border border-[#D1D1CF] shadow-sm">
          <img src={personal.photo} alt="Candidate" className="w-20 h-20 rounded-full object-cover border-2 border-primary-500/30" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1B]/50 mb-1">Candidate Photo</p>
            <p className="text-sm font-bold text-[#1A1A1B]">{personal.fullName || 'Unnamed Candidate'}</p>
            <p className="text-xs text-[#4A4A4E]">{personal.email}</p>
          </div>
        </div>
      )}

      <Section title="Personal Identity" icon="person" rows={[
        ['Full Name', personal.fullName],
        ['Email', personal.email],
        ['Phone', personal.phone],
        ['LinkedIn', personal.linkedin],
        ['Executive Summary', personal.bio],
      ]} />

      <Section title="Academic Excellence" icon="school" rows={[
        ['Institution', academic.institution],
        ['Degree', academic.degree],
        ['Major', academic.major],
        ['GPA', academic.gpa],
        ['Graduation Year', academic.graduationYear],
        ['Transcript', academic.transcript],
      ]} />

      <Section title="Professional Journey" icon="work" rows={[
        ['Company', professional.company],
        ['Role', professional.role],
        ['Duration', professional.duration],
        ['Portfolio', professional.portfolio],
        ['Key Skills', professional.skills],
      ]} />

      {professional.coverLetter && (
        <div className="p-8 rounded-2xl bg-white border border-[#D1D1CF] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1B]/50 mb-3">Cover Letter</p>
          <p className="text-sm text-[#4A4A4E] leading-relaxed whitespace-pre-wrap">{professional.coverLetter}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InternsPortal() {
  const [appData, setAppData] = useState(() => {
    const saved = loadFromStorage()
    return saved || INITIAL_STATE
  })
  const [submitted, setSubmitted] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)
  const rightRef = useRef()

  // Persist every change
  useEffect(() => {
    saveToStorage({ ...appData, lastSaved: new Date().toISOString() })
  }, [appData])

  const goTo = (step) => {
    setAppData(prev => ({ ...prev, currentStep: step }))
    if (rightRef.current) rightRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = () => {
    saveToStorage({ ...appData, lastSaved: new Date().toISOString() })
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 2000)
  }

  const handleSubmit = () => {
    // Merge any old + current data (already in appData via localStorage)
    const finalData = { ...loadFromStorage(), ...appData, submittedAt: new Date().toISOString() }
    saveToStorage(finalData)
    setSubmitted(true)
  }

  // Field updaters
  const updateSection = (section, field, value) => {
    setAppData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const { currentStep, personal, academic, professional } = appData
  const step = STEPS.find(s => s.id === currentStep)

  if (submitted) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-8" style={{ fontFamily: "'I', serif" }}>
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1B] flex items-center justify-center mx-auto text-primary-500">
            <Icon name="check" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1B]">Application Submitted</h1>
          <p className="text-[#4A4A4E] leading-relaxed">
            Thank you for applying to the Global Excellence Summer Internship Program. Our executive recruitment panel will review your application and contact you within 5–7 business days.
          </p>
          <p className="text-xs text-primary-500 font-bold uppercase tracking-widest">Submitted at {new Date().toLocaleString()}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen flex flex-col slate-100 mt-16 overflow-hidden"
      style={{
        fontFamily: "'Inter', serif",
        backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(197,160,89,0.03) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(197,160,89,0.02) 0%, transparent 50%)'
      }}
    >
      {/* Top gold bar */}
      <div className="h-1.5 bg-primary-500 w-full flex-shrink-0" style={{ opacity: 0.9 }} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden max-w-[1440px] mx-auto w-full px-8">

        {/* ── LEFT SIDEBAR (fixed) ────────────────────────────────────────── */}
        <aside className="w-80 flex-shrink-0 py-12 pr-8 flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="bg-primary-500 p-2 rounded flex items-center justify-center text-primary-100">
              <Icon name="diamond" className="w-5 h-5" />
            </div>
            <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#1A1A1B]" style={{ fontFamily:"'Inter', serif"}}>
              Global Excellence
            </h2>
          </div>

          {/* Step nav */}
          <nav>
            <ol className="space-y-10">
              {STEPS.map((s, idx) => {
                const isActive = s.id === currentStep
                const isCompleted = s.id < currentStep
                return (
                  <li key={s.id} className="flex items-start gap-5">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => goTo(s.id)}
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${isActive
                            ? 'border-primary-500 bg-white text-primary-500 shadow-sm'
                            : isCompleted
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border-gray-200 text-gray-400'
                          }`}
                      >
                        {isCompleted ? <Icon name="check" className="w-4 h-4" /> : s.num}
                      </button>
                      {idx < STEPS.length - 1 && (
                        <div className={`w-px h-12 mt-2 ${isActive || isCompleted ? 'bg-primary-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} style={{ fontFamily:"'Inter', serif"}}>
                        {isActive ? 'Current Step' : s.category}
                      </p>
                      <p className={`text-sm font-bold ${isActive ? 'text-[#1A1A1B]' : isCompleted ? 'text-[#4A4A4E]' : 'text-gray-400'}`}>
                        {s.label}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* Last saved indicator */}
          {appData.lastSaved && (
            <div className="mt-auto pt-8">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold" style={{ fontFamily: "'inter', sans-serif" }}>
                Auto-saved · {new Date(appData.lastSaved).toLocaleTimeString()}
              </p>
            </div>
          )}
        </aside>

        {/* ── RIGHT CONTENT (scrollable Y only) ──────────────────────────── */}
        <section
          ref={rightRef}
          className="flex-1 overflow-hidden py-12 pl-8"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D1CF transparent' }}
        >
          {/* Header */}
          <header className="mb-14">
            <h1 className="text-5xl font-extrabold tracking-tight text-[#1A1A1B] mb-5" style={{ letterSpacing: '-0.02em' }}>
              {currentStep === 1 && 'Personal Details'}
              {currentStep === 2 && 'Academic Excellence'}
              {currentStep === 3 && 'Professional Journey'}
              {currentStep === 4 && 'Review & Submit'}
            </h1>
            <p className="text-xl text-[#4A4A4E] font-light max-w-2xl leading-relaxed">
              {currentStep === 1 && 'Please curate your personal profile. This information will be presented to our executive recruitment panel for the Summer Internship Program.'}
              {currentStep === 2 && 'Share your academic achievements and institutional background. Your scholarly excellence sets the foundation for this opportunity.'}
              {currentStep === 3 && 'Detail your professional experience and unique competencies. Illuminate the journey that has shaped your professional identity.'}
              {currentStep === 4 && 'Review your complete application before final submission. Ensure all details accurately represent your candidacy.'}
            </p>
          </header>

          {/* Step content */}
          <div className="max-w-4xl">
            {currentStep === 1 && (
              <PersonalStep data={personal} onChange={(f, v) => updateSection('personal', f, v)} />
            )}
            {currentStep === 2 && (
              <AcademicStep data={academic} onChange={(f, v) => updateSection('academic', f, v)} />
            )}
            {currentStep === 3 && (
              <ProfessionalStep data={professional} onChange={(f, v) => updateSection('professional', f, v)} />
            )}
            {currentStep === 4 && (
              <ReviewStep appData={appData} onSubmit={handleSubmit} />
            )}

            {/* Footer actions */}
            <div className="mt-16 pt-10 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 border-t border-[#D1D1CF]">
              <div className="flex items-center gap-3 text-[#4A4A4E]">
                <Icon name="shield" className="w-5 h-5 text-primary-500" />
                <p className="text-xs font-bold tracking-wide uppercase" style={{ fontFamily:"'Inter', serif"}}>
                  Secure Encrypted Submission
                </p>
              </div>

              <div className="flex items-center gap-8">
                <button
                  type="button"
                  onClick={handleSave}
                  className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-[#1A1A1B] transition-colors"
                  style={{ fontFamily:"'Inter', serif"}}
                >
                  {saveFlash ? '✓ Saved!' : 'Save Progress'}
                </button>

                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => goTo(currentStep - 1)}
                    className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                    style={{ fontFamily:"'Inter', serif"}}
                  >
                    ← Back
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => goTo(currentStep + 1)}
                    className="bg-primary-500 text-white px-12 py-5 rounded-xl font-bold flex items-center gap-4 hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 text-sm"
                  >
                    Continue
                    <Icon name="arrow" className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-primary-500 text-white px-12 py-5 rounded-xl font-bold flex items-center gap-4 hover:bg-primary-600 transition-all shadow-xl text-sm"
                  >
                    Submit Application
                    <Icon name="check" className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-[#D1D1CF]/50">
              <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em] uppercase" style={{ fontFamily:"'Inter', serif"}}>
                  © 2024 Global Internship Excellence
                </p>
                <div className="flex gap-8">
                  <a href="#" className="text-[10px] text-gray-500 hover:text-primary-500 transition-colors font-bold tracking-[0.2em] uppercase" style={{ fontFamily:"'Inter', serif"}}>
                    Concierge Support
                  </a>
                  <a href="#" className="text-[10px] text-gray-500 hover:text-primary-500 transition-colors font-bold tracking-[0.2em] uppercase" style={{ fontFamily:"'Inter', serif"}}>
                    Privacy Protocol
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  )
}