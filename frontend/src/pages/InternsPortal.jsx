import React, { useEffect, useRef, useState } from 'react';
import internshipService from '../services/internshipService';

const STORAGE_KEY = 'internsPortal_applicationData';

const TYPE_OPTIONS = [
  { value: 'SOFTWARE_DEVELOPMENT', label: 'Software Development' },
  { value: 'UI_UX', label: 'UI/UX Design' },
  { value: 'DATA', label: 'Data & Analytics' },
  { value: 'MARKETING', label: 'Digital Marketing' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
  { value: 'OTHER', label: 'General' },
];

const PERIOD_OPTIONS = [
  { value: 'ONE_MONTH', label: '1 Month' },
  { value: 'THREE_MONTHS', label: '3 Months' },
  { value: 'SIX_MONTHS', label: '6 Months' },
  { value: 'ONE_YEAR', label: '1 Year' },
];

const INITIAL_STATE = {
  currentStep: 1,
  lastSaved: null,
  personal: {
    photo: null,
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    country: '',
    city: '',
    bio: '',
  },
  academic: {
    institution: '',
    degree: '',
    major: '',
    gpa: '',
    graduationYear: '',
    internshipType: '',
    period: '',
    preferredStart: '',
    preferredEnd: '',
    cvName: '',
  },
  professional: {
    company: '',
    role: '',
    duration: '',
    skills: '',
    coverLetter: '',
    portfolio: '',
    github: '',
  },
};

const STEPS = [
  { id: 1, num: '01', category: 'Current Step', label: 'Personal Identity' },
  { id: 2, num: '02', category: 'Academic', label: 'Excellence' },
  { id: 3, num: '03', category: 'Professional', label: 'Journey' },
  { id: 4, num: '04', category: 'Finalize', label: 'Review & Submit' },
];

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read internship draft:', error);
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save internship draft:', error);
    return false;
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear internship draft:', error);
  }
}

function mergeInitialState(saved) {
  if (!saved) {
    return INITIAL_STATE;
  }

  return {
    ...INITIAL_STATE,
    ...saved,
    personal: { ...INITIAL_STATE.personal, ...(saved.personal || {}) },
    academic: {
      ...INITIAL_STATE.academic,
      ...(saved.academic || {}),
      cvName: saved.academic?.cvName || saved.academic?.transcript || '',
    },
    professional: { ...INITIAL_STATE.professional, ...(saved.professional || {}) },
  };
}

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function isValidUrl(value) {
  if (!value) return true;

  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

function formatUrl(value) {
  if (!value) return '';
  return value.startsWith('http') ? value : `https://${value}`;
}

function splitSkills(value) {
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function buildCombinedCoverLetter(personal, academic, professional) {
  const sections = [
    personal.bio && `Executive Summary:\n${personal.bio}`,
    professional.coverLetter && `Cover Letter:\n${professional.coverLetter}`,
    (professional.company || professional.role || professional.duration) && `Recent Experience:\nCompany: ${professional.company || '—'}\nRole: ${professional.role || '—'}\nDuration: ${professional.duration || '—'}`,
    (academic.gpa || academic.graduationYear) && `Academic Notes:\nGPA: ${academic.gpa || '—'}\nGraduation Year: ${academic.graduationYear || '—'}`,
  ].filter(Boolean);

  return sections.join('\n\n');
}

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
  };

  return icons[name] || null;
};

const Label = ({ children }) => (
  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1B]/70 mb-3">
    {children}
  </label>
);

const FieldError = ({ message }) => (
  message ? <p className="mt-2 text-xs font-medium text-red-600">{message}</p> : null
);

const Input = ({ icon, error, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400 pointer-events-none">
        <Icon name={icon} className="w-5 h-5" />
      </span>
    )}
    <input
      {...props}
      className={`w-full ${icon ? 'pl-14' : 'pl-5'} pr-5 py-4 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-[#D1D1CF] focus:ring-primary-500 focus:border-primary-500'} bg-white text-[#1A1A1B] outline-none transition-all placeholder:text-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] text-sm`}
    />
  </div>
);

const Select = ({ error, children, ...props }) => (
  <select
    {...props}
    className={`w-full px-5 py-4 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-[#D1D1CF] focus:ring-primary-500 focus:border-primary-500'} bg-white text-[#1A1A1B] outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] text-sm`}
  >
    {children}
  </select>
);

const Textarea = ({ error, ...props }) => (
  <textarea
    {...props}
    className={`w-full px-5 py-4 rounded-xl border ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-[#D1D1CF] focus:ring-primary-500 focus:border-primary-500'} bg-white text-[#1A1A1B] outline-none transition-all placeholder:text-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] resize-none text-sm`}
  />
);

const PersonalStep = ({ data, errors, onChange }) => {
  const fileRef = useRef(null);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => onChange('photo', loadEvent.target?.result || null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-14">
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
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-1 right-1 bg-[#1A1A1B] text-primary-500 p-2.5 rounded-full shadow-2xl hover:scale-110 transition-transform"
          >
            <Icon name="camera" className="w-5 h-5" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1A1A1B]">Candidate Photograph</h3>
          <p className="text-base text-[#4A4A4E] mt-2 max-w-sm font-light">
            Upload a high-resolution professional portrait. This stays in your local draft and review screen.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-5 text-xs font-black text-primary-500 tracking-[0.2em] uppercase hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            Select File <Icon name="upload" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <Label>Full Legal Name</Label>
          <Input type="text" placeholder="Alexander Rivera" value={data.fullName} onChange={(e) => onChange('fullName', e.target.value)} error={errors.fullName} />
          <FieldError message={errors.fullName} />
        </div>
        <div>
          <Label>Primary Email</Label>
          <Input type="email" placeholder="alex.rivera@ivy-university.edu" value={data.email} onChange={(e) => onChange('email', e.target.value)} error={errors.email} />
          <FieldError message={errors.email} />
        </div>
        <div>
          <Label>Contact Number</Label>
          <Input icon="phone" type="tel" placeholder="+1 (555) 0123-4567" value={data.phone} onChange={(e) => onChange('phone', e.target.value)} error={errors.phone} />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <Label>Professional Profile (LinkedIn)</Label>
          <Input icon="share" type="url" placeholder="linkedin.com/in/alexrivera" value={data.linkedin} onChange={(e) => onChange('linkedin', e.target.value)} error={errors.linkedin} />
          <FieldError message={errors.linkedin} />
        </div>
        <div>
          <Label>Country</Label>
          <Input type="text" placeholder="Rwanda" value={data.country} onChange={(e) => onChange('country', e.target.value)} error={errors.country} />
          <FieldError message={errors.country} />
        </div>
        <div>
          <Label>City</Label>
          <Input type="text" placeholder="Kigali" value={data.city} onChange={(e) => onChange('city', e.target.value)} error={errors.city} />
          <FieldError message={errors.city} />
        </div>
      </div>

      <div>
        <Label>Executive Summary</Label>
        <Textarea
          rows={6}
          placeholder="Articulate your career aspirations and what drives your pursuit of excellence..."
          value={data.bio}
          onChange={(e) => onChange('bio', e.target.value)}
          error={errors.bio}
        />
        <FieldError message={errors.bio} />
      </div>
    </div>
  );
};

const AcademicStep = ({ data, errors, onChange, onCvChange }) => {
  const fileRef = useRef(null);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onCvChange(file);
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <Label>Institution Name</Label>
          <Input type="text" placeholder="Harvard University" value={data.institution} onChange={(e) => onChange('institution', e.target.value)} error={errors.institution} />
          <FieldError message={errors.institution} />
        </div>
        <div>
          <Label>Degree Program</Label>
          <Input type="text" placeholder="Bachelor of Science" value={data.degree} onChange={(e) => onChange('degree', e.target.value)} error={errors.degree} />
          <FieldError message={errors.degree} />
        </div>
        <div>
          <Label>Field of Study / Major</Label>
          <Input type="text" placeholder="Computer Science" value={data.major} onChange={(e) => onChange('major', e.target.value)} error={errors.major} />
          <FieldError message={errors.major} />
        </div>
        <div>
          <Label>Cumulative GPA</Label>
          <Input type="text" placeholder="3.95 / 4.00" value={data.gpa} onChange={(e) => onChange('gpa', e.target.value)} error={errors.gpa} />
          <FieldError message={errors.gpa} />
        </div>
        <div>
          <Label>Expected Graduation Year</Label>
          <Input type="text" placeholder="2026" value={data.graduationYear} onChange={(e) => onChange('graduationYear', e.target.value)} error={errors.graduationYear} />
          <FieldError message={errors.graduationYear} />
        </div>
        <div>
          <Label>Internship Track</Label>
          <Select value={data.internshipType} onChange={(e) => onChange('internshipType', e.target.value)} error={errors.internshipType}>
            <option value="">Select internship track</option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <FieldError message={errors.internshipType} />
        </div>
        <div>
          <Label>Preferred Duration</Label>
          <Select value={data.period} onChange={(e) => onChange('period', e.target.value)} error={errors.period}>
            <option value="">Select duration</option>
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          <FieldError message={errors.period} />
        </div>
        <div>
          <Label>Preferred Start Date</Label>
          <Input type="date" value={data.preferredStart} onChange={(e) => onChange('preferredStart', e.target.value)} error={errors.preferredStart} />
          <FieldError message={errors.preferredStart} />
        </div>
        <div>
          <Label>Preferred End Date</Label>
          <Input type="date" value={data.preferredEnd} onChange={(e) => onChange('preferredEnd', e.target.value)} error={errors.preferredEnd} />
          <FieldError message={errors.preferredEnd} />
        </div>
        <div className="md:col-span-2">
          <Label>Resume / CV</Label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`w-full px-5 py-4 rounded-xl border border-dashed ${errors.cvName ? 'border-red-300 bg-red-50/60' : 'border-primary-500/40 bg-primary-500/5'} text-[#4A4A4E] cursor-pointer hover:border-primary-500/70 hover:bg-primary-500/10 transition-all flex items-center gap-3 text-sm`}
          >
            <Icon name="upload" className="w-5 h-5 text-primary-500" />
            {data.cvName ? <span className="text-[#1A1A1B] font-medium">{data.cvName}</span> : <span className="text-gray-400">Upload resume or CV (PDF, DOC, DOCX)</span>}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
          <FieldError message={errors.cvName} />
        </div>
      </div>
    </div>
  );
};

const ProfessionalStep = ({ data, errors, onChange }) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
      <div>
        <Label>Most Recent Company</Label>
        <Input type="text" placeholder="McKinsey & Company" value={data.company} onChange={(e) => onChange('company', e.target.value)} error={errors.company} />
        <FieldError message={errors.company} />
      </div>
      <div>
        <Label>Role / Title</Label>
        <Input type="text" placeholder="Business Analyst" value={data.role} onChange={(e) => onChange('role', e.target.value)} error={errors.role} />
        <FieldError message={errors.role} />
      </div>
      <div>
        <Label>Duration</Label>
        <Input type="text" placeholder="Jun 2023 - Aug 2023" value={data.duration} onChange={(e) => onChange('duration', e.target.value)} error={errors.duration} />
        <FieldError message={errors.duration} />
      </div>
      <div>
        <Label>Portfolio / Personal Site</Label>
        <Input icon="share" type="url" placeholder="yourportfolio.com" value={data.portfolio} onChange={(e) => onChange('portfolio', e.target.value)} error={errors.portfolio} />
        <FieldError message={errors.portfolio} />
      </div>
      <div className="md:col-span-2">
        <Label>GitHub Profile</Label>
        <Input icon="share" type="url" placeholder="github.com/yourhandle" value={data.github} onChange={(e) => onChange('github', e.target.value)} error={errors.github} />
        <FieldError message={errors.github} />
      </div>
    </div>
    <div>
      <Label>Key Skills</Label>
      <Input type="text" placeholder="Python, Data Analysis, Strategic Planning, Public Speaking" value={data.skills} onChange={(e) => onChange('skills', e.target.value)} error={errors.skills} />
      <FieldError message={errors.skills} />
    </div>
    <div>
      <Label>Cover Letter / Statement of Purpose</Label>
      <Textarea
        rows={8}
        placeholder="Describe your professional journey, achievements, and why you're an exceptional candidate..."
        value={data.coverLetter}
        onChange={(e) => onChange('coverLetter', e.target.value)}
        error={errors.coverLetter}
      />
      <FieldError message={errors.coverLetter} />
    </div>
  </div>
);

const ReviewStep = ({ appData, submissionMeta }) => {
  const { personal, academic, professional } = appData;

  const Section = ({ title, icon, rows }) => (
    <div className="p-8 rounded-2xl bg-white border border-[#D1D1CF] shadow-sm space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-[#D1D1CF]">
        <div className="w-8 h-8 rounded-lg bg-[#1A1A1B] flex items-center justify-center text-primary-500">
          <Icon name={icon} className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#1A1A1B]">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(([label, value]) => value ? (
          <div key={label}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1B]/50 mb-1">{label}</p>
            <p className="text-sm text-[#1A1A1B] font-medium whitespace-pre-wrap break-words">{value}</p>
          </div>
        ) : null)}
      </div>
    </div>
  );

  const internshipType = TYPE_OPTIONS.find((option) => option.value === academic.internshipType)?.label || academic.internshipType;
  const period = PERIOD_OPTIONS.find((option) => option.value === academic.period)?.label || academic.period;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-start gap-4">
        <Icon name="shield" className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#4A4A4E] font-medium">
          Review the final payload before submission. Drafts are stored locally in this browser, and the application is only sent to the backend when you submit on this step.
        </p>
      </div>

      {submissionMeta?.saveMode === 'local' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Save Progress is local-only. The backend currently exposes a public submit endpoint, but no public draft or resume endpoint.
        </div>
      )}

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
        ['LinkedIn', formatUrl(personal.linkedin)],
        ['Country', personal.country],
        ['City', personal.city],
        ['Executive Summary', personal.bio],
      ]} />

      <Section title="Academic Excellence" icon="school" rows={[
        ['Institution', academic.institution],
        ['Degree', academic.degree],
        ['Major', academic.major],
        ['GPA', academic.gpa],
        ['Graduation Year', academic.graduationYear],
        ['Internship Track', internshipType],
        ['Duration', period],
        ['Preferred Start', academic.preferredStart],
        ['Preferred End', academic.preferredEnd],
        ['Resume / CV', academic.cvName],
      ]} />

      <Section title="Professional Journey" icon="work" rows={[
        ['Company', professional.company],
        ['Role', professional.role],
        ['Duration', professional.duration],
        ['Portfolio', formatUrl(professional.portfolio)],
        ['GitHub', formatUrl(professional.github)],
        ['Key Skills', professional.skills],
      ]} />

      {professional.coverLetter && (
        <div className="p-8 rounded-2xl bg-white border border-[#D1D1CF] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1B]/50 mb-3">Cover Letter</p>
          <p className="text-sm text-[#4A4A4E] leading-relaxed whitespace-pre-wrap">{professional.coverLetter}</p>
        </div>
      )}
    </div>
  );
};

export default function InternsPortal() {
  const [appData, setAppData] = useState(() => mergeInitialState(loadFromStorage()));
  const [cvFile, setCvFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const rightRef = useRef(null);

  useEffect(() => {
    saveToStorage({ ...appData, lastSaved: new Date().toISOString() });
  }, [appData]);

  const scrollToTop = () => {
    if (rightRef.current) {
      rightRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateSection = (section, field, value) => {
    setAppData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleCvChange = (file) => {
    setCvFile(file);
    updateSection('academic', 'cvName', file.name);
  };

  const validateStep = (stepId) => {
    const errors = {};
    const { personal, academic, professional } = appData;

    if (stepId === 1) {
      if (!personal.fullName.trim()) errors.fullName = 'Full name is required.';
      if (!personal.email.trim()) errors.email = 'Email is required.';
      else if (!isValidEmail(personal.email.trim())) errors.email = 'Enter a valid email address.';
      if (personal.linkedin && !isValidUrl(personal.linkedin)) errors.linkedin = 'Enter a valid LinkedIn URL.';
    }

    if (stepId === 2) {
      if (!academic.institution.trim()) errors.institution = 'Institution is required.';
      if (!academic.degree.trim()) errors.degree = 'Degree program is required.';
      if (!academic.major.trim()) errors.major = 'Field of study is required.';
      if (!academic.internshipType) errors.internshipType = 'Select an internship track.';
      if (!academic.period) errors.period = 'Select a preferred duration.';
      if (academic.preferredStart && academic.preferredEnd && academic.preferredEnd < academic.preferredStart) {
        errors.preferredEnd = 'End date must be after the start date.';
      }
    }

    if (stepId === 3) {
      if (!professional.skills.trim()) errors.skills = 'Add at least one skill.';
      if (!professional.coverLetter.trim()) errors.coverLetter = 'Cover letter is required.';
      if (professional.portfolio && !isValidUrl(professional.portfolio)) errors.portfolio = 'Enter a valid portfolio URL.';
      if (professional.github && !isValidUrl(professional.github)) errors.github = 'Enter a valid GitHub URL.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllSteps = () => {
    for (const step of [1, 2, 3]) {
      if (!validateStep(step)) {
        setAppData((prev) => ({ ...prev, currentStep: step }));
        scrollToTop();
        return false;
      }
    }

    setValidationErrors({});
    return true;
  };

  const goTo = (targetStep) => {
    if (targetStep === appData.currentStep) return;

    if (targetStep > appData.currentStep) {
      for (let step = 1; step < targetStep; step += 1) {
        if (!validateStep(step)) {
          setAppData((prev) => ({ ...prev, currentStep: step }));
          scrollToTop();
          return;
        }
      }
    }

    setValidationErrors({});
    setAppData((prev) => ({ ...prev, currentStep: targetStep }));
    scrollToTop();
  };

  const handleNext = () => {
    if (validateStep(appData.currentStep)) {
      goTo(appData.currentStep + 1);
    } else {
      scrollToTop();
    }
  };

  const handleSave = () => {
    const saved = saveToStorage({ ...appData, lastSaved: new Date().toISOString() });
    if (!saved) return;

    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = new FormData();
      const { personal, academic, professional } = appData;

      payload.append('fullName', personal.fullName.trim());
      payload.append('email', personal.email.trim());
      if (personal.phone.trim()) payload.append('phone', personal.phone.trim());
      if (academic.institution.trim()) payload.append('institution', academic.institution.trim());
      if (academic.major.trim()) payload.append('fieldOfStudy', academic.major.trim());
      if (academic.degree.trim()) payload.append('level', academic.degree.trim());
      if (personal.country.trim()) payload.append('country', personal.country.trim());
      if (personal.city.trim()) payload.append('city', personal.city.trim());
      payload.append('internshipType', academic.internshipType);
      if (academic.period) payload.append('period', academic.period);
      if (academic.preferredStart) payload.append('preferredStart', academic.preferredStart);
      if (academic.preferredEnd) payload.append('preferredEnd', academic.preferredEnd);

      const coverLetter = buildCombinedCoverLetter(personal, academic, professional);
      if (coverLetter) payload.append('coverLetter', coverLetter);

      const skills = splitSkills(professional.skills);
      payload.append('skills', JSON.stringify(skills));

      if (professional.portfolio.trim()) payload.append('portfolioUrl', formatUrl(professional.portfolio.trim()));
      if (professional.github.trim()) payload.append('githubUrl', formatUrl(professional.github.trim()));
      if (personal.linkedin.trim()) payload.append('linkedinUrl', formatUrl(personal.linkedin.trim()));
      if (cvFile) payload.append('cv', cvFile);

      const response = await internshipService.submitApplication(payload);

      clearStorage();
      setSubmittedApplication(response);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { currentStep, personal, academic, professional, lastSaved } = appData;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ fontFamily: "'Inter', serif" }}>
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1B] flex items-center justify-center mx-auto text-primary-500">
            <Icon name="check" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1B]">Application Submitted</h1>
          <p className="text-[#4A4A4E] leading-relaxed">
            Thank you for applying to the Global Excellence Summer Internship Program. Your application has been submitted to the backend review queue.
          </p>
          {submittedApplication?.id && (
            <p className="text-xs text-primary-500 font-bold uppercase tracking-widest">Application ID {submittedApplication.id}</p>
          )}
          <p className="text-xs text-primary-500 font-bold uppercase tracking-widest">Submitted at {new Date().toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col slate-100 mt-16"
      style={{
        fontFamily: "'Inter', serif",
        backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(197,160,89,0.03) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(197,160,89,0.02) 0%, transparent 50%)',
      }}
    >
      <div className="h-1.5 bg-primary-500 w-full flex-shrink-0" style={{ opacity: 0.9 }} />

      <div className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-8 rounded-[28px] border border-[#D1D1CF] bg-white/90 shadow-sm px-5 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="bg-primary-500 p-2 rounded flex items-center justify-center text-primary-100">
              <Icon name="diamond" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-black tracking-[0.25em] uppercase text-[#1A1A1B]" style={{ fontFamily: "'Inter', serif" }}>
                Global Excellence
              </h2>
              <div className="mt-5 overflow-x-auto pb-2">
                <nav className="min-w-max">
                  <ol className="flex items-start gap-3 sm:gap-4 lg:gap-6">
              {STEPS.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                      <li key={step.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => goTo(step.id)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${isActive
                          ? 'border-primary-500 bg-primary-500 text-white shadow-sm'
                          : isCompleted
                            ? 'border-primary-500 bg-primary-500 text-white'
                            : 'border-gray-200 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Icon name="check" className="w-4 h-4" /> : step.num}
                      </button>
                        <div className="min-w-[140px] sm:min-w-[160px]">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-primary-500' : isCompleted ? 'text-[#1A1A1B]/60' : 'text-gray-400'}`} style={{ fontFamily: "'Inter', serif" }}>
                        {isActive ? 'Current Step' : step.category}
                      </p>
                          <p className={`text-sm font-bold ${isActive ? 'text-[#1A1A1B]' : isCompleted ? 'text-[#4A4A4E]' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                        {index < STEPS.length - 1 && (
                          <div className={`hidden sm:block w-12 lg:w-16 h-px ${isActive || isCompleted ? 'bg-primary-500' : 'bg-gray-200'}`} />
                        )}
                  </li>
                );
              })}
                  </ol>
                </nav>
              </div>
            </div>

            {lastSaved && (
              <div className="lg:pl-6 lg:border-l lg:border-[#D1D1CF] flex-shrink-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Auto-saved
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1A1A1B]">
                  {new Date(lastSaved).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        <section
          ref={rightRef}
          className="overflow-y-auto overflow-x-hidden pb-10"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D1CF transparent' }}
        >
          <div className="max-w-4xl mx-auto">
            <header className="mb-14">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1A1A1B] mb-5" style={{ letterSpacing: '-0.02em' }}>
                {currentStep === 1 && 'Personal Details'}
                {currentStep === 2 && 'Academic Excellence'}
                {currentStep === 3 && 'Professional Journey'}
                {currentStep === 4 && 'Review & Submit'}
              </h1>
              <p className="text-lg sm:text-xl text-[#4A4A4E] font-light max-w-2xl leading-relaxed">
                {currentStep === 1 && 'Please curate your personal profile. This information will be presented to our executive recruitment panel for the Summer Internship Program.'}
                {currentStep === 2 && 'Share your academic background and internship preferences. This step now matches the backend internship contract.'}
                {currentStep === 3 && 'Detail your professional experience and unique competencies. These details are included in the final application payload.'}
                {currentStep === 4 && 'Review your complete application before final submission. Drafts stay in local storage until you submit.'}
              </p>
            </header>

            {submitError && (
              <div className="max-w-4xl mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="max-w-4xl">
              {currentStep === 1 && (
                <PersonalStep data={personal} errors={validationErrors} onChange={(field, value) => updateSection('personal', field, value)} />
              )}
              {currentStep === 2 && (
                <AcademicStep
                  data={academic}
                  errors={validationErrors}
                  onChange={(field, value) => updateSection('academic', field, value)}
                  onCvChange={handleCvChange}
                />
              )}
              {currentStep === 3 && (
                <ProfessionalStep data={professional} errors={validationErrors} onChange={(field, value) => updateSection('professional', field, value)} />
              )}
              {currentStep === 4 && (
                <ReviewStep appData={appData} submissionMeta={{ saveMode: 'local' }} />
              )}

              <div className="mt-16 pt-10 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 border-t border-[#D1D1CF]">
                <div className="flex items-center gap-3 text-[#4A4A4E]">
                  <Icon name="shield" className="w-5 h-5 text-primary-500" />
                  <p className="text-xs font-bold tracking-wide uppercase" style={{ fontFamily: "'Inter', serif" }}>
                    Secure Encrypted Submission
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-[#1A1A1B] transition-colors"
                    style={{ fontFamily: "'Inter', serif" }}
                  >
                    {saveFlash ? 'Saved Locally' : 'Save Progress'}
                  </button>

                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => goTo(currentStep - 1)}
                      className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                      style={{ fontFamily: "'Inter', serif" }}
                      disabled={isSubmitting}
                    >
                      ← Back
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-primary-500 text-white px-12 py-5 rounded-xl font-bold flex items-center gap-4 hover:bg-primary-600 transition-all shadow-xl shadow-gray-200 text-sm disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      Continue
                      <Icon name="arrow" className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-primary-500 text-white px-12 py-5 rounded-xl font-bold flex items-center gap-4 hover:bg-primary-600 transition-all shadow-xl text-sm disabled:opacity-60"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      <Icon name="check" className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              <footer className="mt-16 py-8 border-t border-[#D1D1CF]/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-5">
                  <p className="text-[10px] text-gray-400 font-bold tracking-[0.25em] uppercase" style={{ fontFamily: "'Inter', serif" }}>
                    © 2024 Global Internship Excellence
                  </p>
                  <div className="flex gap-8">
                    <a href="#" className="text-[10px] text-gray-500 hover:text-primary-500 transition-colors font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', serif" }}>
                      Concierge Support
                    </a>
                    <a href="#" className="text-[10px] text-gray-500 hover:text-primary-500 transition-colors font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Inter', serif" }}>
                      Privacy Protocol
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
