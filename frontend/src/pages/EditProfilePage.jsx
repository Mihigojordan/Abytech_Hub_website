// AdminProfileEdit.jsx
import React, { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
  useSearchParams, // ← NEW: for tab in URL
} from 'react-router-dom';
import {
  User, Lock, Briefcase, Upload, Camera, Eye, EyeOff,
  Plus, Trash2, Save, Loader2, CheckCircle, AlertCircle,
  MapPin, ArrowLeft, X
} from 'lucide-react';
import adminAuthService from '../services/adminAuthService';
import { useDashboardTheme } from '../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();

  // ——————————————————————————————————————————————————————————————
  // TAB MANAGEMENT: Keep tab in URL (?tab=personal|password|...)
  // ——————————————————————————————————————————————————————————————
  const urlTab = searchParams.get('tab');
  const validTabs = ['personal', 'password', 'experience', 'files'];
  const activeTab = validTabs.includes(urlTab) ? urlTab : 'personal';

  const setActiveTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Ensure a tab is always present in the URL
  useEffect(() => {
    if (!searchParams.has('tab')) {
      setSearchParams({ tab: 'personal' });
    }
  }, [searchParams, setSearchParams]);

  // ——————————————————————————————————————————————————————————————
  // STATE
  // ——————————————————————————————————————————————————————————————
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form States
  const [personalInfo, setPersonalInfo] = useState({
    adminName: '', adminEmail: '', phone: '', location: '', bio: '',
    profileImage: null, profileImageUrl: '', joinedDate: '', idNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [documents, setDocuments] = useState({
    cv: null, passport: null, identityCard: null
  });

  // ——————————————————————————————————————————————————————————————
  // LOAD ADMIN DATA
  // ——————————————————————————————————————————————————————————————
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        setLoading(true);
        setError(null);
        const admin = await adminAuthService.findAdminById(id);
        if (!admin) throw new Error('Admin not found');

        setPersonalInfo({
          adminName: admin.adminName || '',
          adminEmail: admin.adminEmail || '',
          phone: admin.phone || '',
          location: admin.location || '',
          bio: admin.bio || '',
          profileImage: admin.profileImage || null,
          profileImageUrl: admin.profileImage || '',
          joinedDate: admin.joinedDate ? admin.joinedDate.split('T')[0] : '',
          idNumber: admin.idNumber || '',
        });

        setExperiences(admin.experience || []);
        setSkills(admin.skills || []);
        setPortfolio(admin.portifilio || []);

        setDocuments({
          cv: admin.cv || null,
          passport: admin.passport || null,
          identityCard: admin.identityCard || null
        });
      } catch (err) {
        setError(err.message || 'Failed to load admin');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadAdmin();
  }, [id]);

  // ——————————————————————————————————————————————————————————————
  // HELPERS
  // ——————————————————————————————————————————————————————————————
  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now(), from: '', to: '', companyName: '', jobTitle: '', jobDescription: ''
    }]);
  };

  const removeExperience = (id) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const updateExperience = (id, field, value) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addPortfolio = () => {
    setPortfolio([...portfolio, { id: Date.now(), platform: '', url: '' }]);
  };

  const removePortfolio = (id) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  const updatePortfolio = (id, field, value) => {
    setPortfolio(portfolio.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleFileChange = (type, file) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPersonalInfo(prev => ({ ...prev, profileImage: file, profileImageUrl: url }));
    }
  };

  // ——————————————————————————————————————————————————————————————
  // SUBMIT UPDATE
  // ——————————————————————————————————————————————————————————————
  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();

      // Personal tab
      if (activeTab === 'personal') {
        formData.append('adminName', personalInfo.adminName);
        formData.append('adminEmail', personalInfo.adminEmail);
        // formData.append('idNumber', personalInfo.idNumber);
        if (personalInfo.phone) formData.append('phone', personalInfo.phone);
        if (personalInfo.location) formData.append('location', personalInfo.location);
        if (personalInfo.bio) formData.append('bio', personalInfo.bio);
        if (personalInfo.joinedDate) formData.append('joinedDate', personalInfo.joinedDate);

        if (personalInfo.profileImage instanceof File) {
          formData.append('profileImage', personalInfo.profileImage);
        }
        if (documents.cv instanceof File) formData.append('cv', documents.cv);
        if (documents.passport instanceof File) formData.append('passport', documents.passport);
        if (documents.identityCard instanceof File) formData.append('identityCard', documents.identityCard);

        formData.append('skills', JSON.stringify(skills));
        formData.append('experience', JSON.stringify(experiences));
        formData.append('portifilio', JSON.stringify(portfolio));
      }

      // Password change
      if (activeTab === 'password') {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
          throw new Error('Both current and new passwords are required');
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        formData.append('currentPassword', passwordData.currentPassword);
        formData.append('newPassword', passwordData.newPassword);
      }

      // Experience & Files tabs
      if (['experience', 'files'].includes(activeTab)) {
        formData.append('experience', JSON.stringify(experiences));
        if (documents.cv instanceof File) formData.append('cv', documents.cv);
        if (documents.passport instanceof File) formData.append('passport', documents.passport);
        if (documents.identityCard instanceof File) formData.append('identityCard', documents.identityCard);
      }

      await adminAuthService.updateAdmin(id, formData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (activeTab === 'password') {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  };

  // ——————————————————————————————————————————————————————————————
  // LOADING UI
  // ——————————————————————————————————————————————————————————————
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1 }} 
          style={{ width: 40, height: 40, border: `3px solid ${border}`, borderTopColor: ORG, borderRadius: '50%' }} 
        />
      </div>
    );
  }

  // ——————————————————————————————————————————————————————————————
  // MAIN UI
  // ——————————————————————————————————————————————————————————————
  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: 60 }}>
      {/* Header Bar */}
      <div style={{ background: `${bg2}80`, backdropFilter: 'blur(10px)', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: text3, cursor: 'pointer', ...bc(12, 700), transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.color = ORG}
            onMouseOut={(e) => e.currentTarget.style.color = text3}
          >
            <ArrowLeft size={18} /> GO BACK
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            ACCOUNT / <span style={{ color: ORG }}>EDIT PROFILE</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 mt-8">
        {/* Profile Hero Card */}
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: `linear-gradient(225deg, ${ORG}05 0%, transparent 70%)` }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <div className="relative group">
                <div style={{ width: 100, height: 100, borderRadius: 24, border: `3px solid ${ORG}`, overflow: 'hidden', background: bg, boxShadow: `0 12px 32px ${ORG}20` }}>
                  <img
                    src={personalInfo.profileImageUrl || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  htmlFor="profile-upload-hero"
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 cursor-pointer shadow-lg hover:text-[#ea580c] transition-colors"
                  style={{ background: bg, border: `1px solid ${border}`, color: text2 }}
                >
                  <Camera size={20} />
                </label>
                <input id="profile-upload-hero" type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
              </div>
              
              <div>
                <h1 style={{ ...bb(42, { color: textC, margin: '0 0 4px', lineHeight: 1 }) }}>{personalInfo.adminName || 'NEW ADMIN'}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2" style={{ ...bc(12, 700, { color: text3 }) }}>
                    <MapPin size={14} style={{ color: ORG }} /> {personalInfo.location || 'GLOBAL'}
                  </div>
                  <div className="w-1 h-1 rounded-full" style={{ background: border }}></div>
                  <div className="flex items-center gap-2" style={{ ...bc(12, 700, { color: text3 }) }}>
                    <Briefcase size={14} style={{ color: ORG }} /> {experiences[0]?.jobTitle || 'ADMINISTRATOR'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ 
                padding: '12px 32px', background: ORG, color: '#fff', border: 'none', borderRadius: 14, 
                cursor: 'pointer', ...bc(13, 800), opacity: saving ? 0.5 : 1, transition: 'all 0.2s',
                boxShadow: `0 8px 24px ${ORG}40`
              }}
              onMouseOver={(e) => !saving && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !saving && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: '#ef444415', border: '1px solid #ef444433', color: '#ef4444', ...bc(12, 700) }}>
              <AlertCircle size={18} /> {error.toUpperCase()}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl flex items-center gap-3" style={{ background: '#10b98115', border: '1px solid #10b98133', color: '#10b981', ...bc(12, 700) }}>
              <CheckCircle size={18} /> {activeTab === 'password' ? 'PASSWORD UPDATED' : 'PROFILE SYNCED SUCCESSFULLY'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 6, padding: '6px', background: bg2, border: `1px solid ${border}`, borderRadius: 18, marginBottom: 24, overflowX: 'auto' }} className="no-scrollbar">
          {[
            { key: 'personal', icon: User, label: 'PERSONAL' },
            { key: 'password', icon: Lock, label: 'SECURITY' },
            { key: 'experience', icon: Briefcase, label: 'EXPERIENCE' },
            { key: 'files', icon: Upload, label: 'RESOURCES' },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{ 
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 20px', borderRadius: 14,
                  background: isActive ? bg : 'transparent', color: isActive ? ORG : text3, border: `1px solid ${isActive ? border : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.2s', ...bc(12, 800), whiteSpace: 'nowrap'
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Card */}
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '32px' }}>
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'FULL NAME *', key: 'adminName', type: 'text' },
                  { label: 'EMAIL ADDRESS *', key: 'adminEmail', type: 'email' },
                  { label: 'CONTACT PHONE', key: 'phone', type: 'tel' },
                  { label: 'CURRENT LOCATION', key: 'location', type: 'text' },
                  { label: 'JOINED DATE', key: 'joinedDate', type: 'date' },
                  { label: 'IDENTITY NUMBER', key: 'idNumber', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ ...bc(11, 700, { color: text3, marginBottom: 8, display: 'block' }) }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={personalInfo[field.key]}
                      onChange={e => setPersonalInfo({ ...personalInfo, [field.key]: e.target.value })}
                      style={{ 
                        width: '100%', padding: '12px 16px', background: bg, border: `1px solid ${border}`, 
                        borderRadius: 12, color: textC, ...ba(14, 500), outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = ORG}
                      onBlur={(e) => e.target.style.borderColor = border}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ ...bc(11, 700, { color: text3, marginBottom: 8, display: 'block' }) }}>BIOGRAPHICAL SUMMARY</label>
                <textarea
                  value={personalInfo.bio}
                  onChange={e => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                  rows={4}
                  style={{ 
                    width: '100%', padding: '16px', background: bg, border: `1px solid ${border}`, 
                    borderRadius: 16, color: textC, ...ba(14, 500), outline: 'none', resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = ORG}
                  onBlur={(e) => e.target.style.borderColor = border}
                />
              </div>

              {/* Skills */}
              <div>
                <label style={{ ...bc(11, 700, { color: text3, marginBottom: 12, display: 'block' }) }}>PROFESSIONAL SKILLS</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((skill, i) => (
                    <motion.span 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      key={i} 
                      style={{ 
                        padding: '6px 14px', background: `${ORG}10`, color: ORG, borderRadius: 10, 
                        ...bc(11, 800), display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${ORG}20`
                      }}
                    >
                      {skill.toUpperCase()}
                      <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: ORG, cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSkill()}
                    placeholder="ENTER SKILL..."
                    style={{ 
                      flex: 1, padding: '12px 16px', background: bg, border: `1px solid ${border}`, 
                      borderRadius: 12, color: textC, ...bc(12, 700), outline: 'none'
                    }}
                  />
                  <button onClick={addSkill} style={{ padding: '0 20px', background: ORG, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label style={{ ...bc(11, 700, { color: text3, marginBottom: 12, display: 'block' }) }}>DIGITAL PORTFOLIO LINKS</label>
                <div className="space-y-3">
                  {portfolio.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        value={item.platform}
                        onChange={e => updatePortfolio(item.id, 'platform', e.target.value)}
                        placeholder="PLATFORM"
                        style={{ flex: 1, padding: '12px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 12, color: textC, ...bc(12, 700), outline: 'none' }}
                      />
                      <input
                        type="url"
                        value={item.url}
                        onChange={e => updatePortfolio(item.id, 'url', e.target.value)}
                        placeholder="RESOURCE URL"
                        style={{ flex: 2, padding: '12px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 12, color: textC, ...ba(14, 500), outline: 'none' }}
                      />
                      <button
                        onClick={() => removePortfolio(item.id)}
                        style={{ padding: '0 12px', color: '#ef4444', background: '#ef444410', border: '1px solid #ef444420', borderRadius: 12, cursor: 'pointer' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button onClick={addPortfolio} style={{ background: 'none', border: 'none', color: ORG, ...bc(11, 800), cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
                    <Plus size={16} /> ADD PORTFOLIO RESOURCE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div style={{ padding: '16px 20px', background: `${ORG}05`, border: `1px solid ${ORG}20`, borderRadius: 16 }}>
                <p style={{ ...bc(11, 700, { color: ORG, margin: 0, letterSpacing: '0.05em' }) }}>
                  SECURITY REQUIREMENT: MINIMUM 8 CHARACTERS WITH COMPLEXITY (ALPHA-NUMERIC + SPECIAL).
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'CURRENT AUTHENTICATION *', key: 'currentPassword', show: showPassword, setShow: setShowPassword },
                  { label: 'NEW AUTHENTICATION *', key: 'newPassword', show: showNewPassword, setShow: setShowNewPassword },
                  { label: 'CONFIRM NEW AUTH *', key: 'confirmPassword', show: showConfirmPassword, setShow: setShowConfirmPassword },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ ...bc(11, 700, { color: text3, marginBottom: 8, display: 'block' }) }}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={field.show ? 'text' : 'password'}
                        value={passwordData[field.key]}
                        onChange={e => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                        style={{ width: '100%', padding: '12px 40px 12px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 12, color: textC, outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => field.setShow(!field.show)}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: text3, cursor: 'pointer' }}
                      >
                        {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {experiences.map((exp, i) => (
                  <div key={exp.id} style={{ padding: '24px', background: bg, border: `1px solid ${border}`, borderRadius: 20, position: 'relative' }}>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      style={{ position: 'absolute', top: 20, right: 20, color: '#ef4444', background: '#ef444410', border: 'none', padding: 8, borderRadius: 10, cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <h3 style={{ ...bc(14, 800, { color: textC, marginBottom: 20 }) }}>EXPERIENCE #{i + 1}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label style={{ ...bc(10, 700, { color: text3, marginBottom: 6, display: 'block' }) }}>JOB TITLE *</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={e => updateExperience(exp.id, 'jobTitle', e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: bg2, border: `1px solid ${border}`, borderRadius: 10, color: textC, ...ba(13, 500), outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...bc(10, 700, { color: text3, marginBottom: 6, display: 'block' }) }}>COMPANY *</label>
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={e => updateExperience(exp.id, 'companyName', e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: bg2, border: `1px solid ${border}`, borderRadius: 10, color: textC, ...ba(13, 500), outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...bc(10, 700, { color: text3, marginBottom: 6, display: 'block' }) }}>FROM *</label>
                        <input
                          type="month"
                          value={exp.from}
                          onChange={e => updateExperience(exp.id, 'from', e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', background: bg2, border: `1px solid ${border}`, borderRadius: 10, color: textC, ...bc(11, 700), outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...bc(10, 700, { color: text3, marginBottom: 6, display: 'block' }) }}>TO (OR PRESENT)</label>
                        <input
                          type="text"
                          value={exp.to}
                          onChange={e => updateExperience(exp.id, 'to', e.target.value)}
                          placeholder="Present"
                          style={{ width: '100%', padding: '10px 14px', background: bg2, border: `1px solid ${border}`, borderRadius: 10, color: textC, ...bc(11, 700), outline: 'none' }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label style={{ ...bc(10, 700, { color: text3, marginBottom: 6, display: 'block' }) }}>CORE RESPONSIBILITIES</label>
                      <textarea
                        value={exp.jobDescription}
                        onChange={e => updateExperience(exp.id, 'jobDescription', e.target.value)}
                        rows={3}
                        style={{ width: '100%', padding: '12px', background: bg2, border: `1px solid ${border}`, borderRadius: 12, color: textC, ...ba(13, 500), outline: 'none', resize: 'none' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addExperience} style={{ background: 'none', border: `1px dashed ${ORG}40`, color: ORG, padding: '16px', borderRadius: 16, width: '100%', ...bc(12, 800), cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = `${ORG}05`}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                + ADD PROFESSIONAL EXPERIENCE
              </button>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'cv', name: 'RESUME / CV', desc: 'LATEST PROFESSIONAL RESUME' },
                { type: 'passport', name: 'PASSPORT', desc: 'INTERNATIONAL TRAVEL DOC' },
                { type: 'identityCard', name: 'ID CARD', desc: 'NATIONAL IDENTIFICATION' },
              ].map(doc => (
                <div key={doc.type} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>{doc.name}</h3>
                      {documents[doc.type] && (
                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                      )}
                    </div>
                    <p style={{ ...bc(10, 700, { color: text3, margin: 0 }) }}>{doc.desc}</p>
                  </div>

                  <div style={{ border: `1px dashed ${border}`, borderRadius: 16, padding: '32px 16px', textAlign: 'center', background: `${bg2}40`, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = ORG}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = border}
                  >
                    <input
                      type="file"
                      id={doc.type}
                      onChange={e => handleFileChange(doc.type, e.target.files[0])}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor={doc.type} style={{ cursor: 'pointer' }}>
                      <Upload size={32} style={{ color: text3, marginBottom: 12 }} />
                      {documents[doc.type] ? (
                        <div>
                          <p style={{ ...bc(11, 800, { color: textC, margin: '0 0 4px' }) }}>
                            {documents[doc.type] instanceof File ? documents[doc.type].name.toUpperCase() : 'DOCUMENT ARCHIVED'}
                          </p>
                          <p style={{ ...bc(10, 700, { color: ORG }) }}>CLICK TO UPDATE</p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ ...bc(11, 800, { color: textC, margin: '0 0 4px' }) }}>UPLOAD RESOURCE</p>
                          <p style={{ ...bc(10, 700, { color: text3 }) }}>PDF / JPG / PNG (5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40, paddingTop: 32, borderTop: `1px solid ${border}` }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ 
                padding: '12px 32px', background: ORG, color: '#fff', border: 'none', borderRadius: 12, 
                cursor: 'pointer', ...bc(12, 800), opacity: saving ? 0.5 : 1, transition: 'all 0.2s',
                boxShadow: `0 8px 24px ${ORG}40`
              }}
            >
              {saving ? 'PROCESSING...' : 'SAVE PROFILE'}
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{ padding: '12px 32px', background: 'transparent', color: text3, border: `1px solid ${border}`, borderRadius: 12, cursor: 'pointer', ...bc(12, 800) }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}