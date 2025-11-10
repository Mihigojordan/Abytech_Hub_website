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
  MapPin
} from 'lucide-react';
import adminAuthService from '../services/adminAuthService';

export default function AdminProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
        formData.append('idNumber', personalInfo.idNumber);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-[rgb(81,96,146)]" />
      </div>
    );
  }

  // ——————————————————————————————————————————————————————————————
  // MAIN UI
  // ——————————————————————————————————————————————————————————————
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="relative rounded-t-xl overflow-hidden h-56">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1762422411505-c0cae1fb103c?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(81,96,146)]/90 to-[rgb(81,96,146)]/70" />
          </div>

          <div className="relative h-full flex items-end p-6">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-end gap-4">
                <div className="relative mb-[-32px]">
                  {/* Profile image placeholder */}
                </div>
                <div className="text-white mb-3">
                  <h1 className="text-2xl font-bold mb-0.5">Edit Profile - {personalInfo.adminName || '—'}</h1>
                  <p className="text-white/90 text-sm mb-1.5">Update your profile information and settings</p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{personalInfo.location || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{experiences[0]?.companyName || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banners */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle className="w-4 h-4" />
            {activeTab === 'password' ? 'Password changed successfully!' : 'Profile updated successfully!'}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border-b">
          <div className="flex gap-1 px-4">
            {[
              { key: 'personal', icon: User, label: 'Personal Details' },
              { key: 'password', icon: Lock, label: 'Change Password' },
              { key: 'experience', icon: Briefcase, label: 'Experience' },
              { key: 'files', icon: Upload, label: 'Upload Files' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-[rgb(81,96,146)] border-b-2 border-[rgb(81,96,146)]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-4">
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              {/* Profile Picture */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={personalInfo.profileImageUrl || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-[rgb(81,96,146)] text-white p-1.5 rounded-full hover:bg-[rgb(71,86,136)] cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>
              </div>

              {/* Basic Info + Joined Date */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *', key: 'adminName', type: 'text' },
                  { label: 'Email *', key: 'adminEmail', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel' },
                  { label: 'Location', key: 'location', type: 'text' },
                  { label: 'Joined Date', key: 'joinedDate', type: 'date' },
                  { label: 'Identity Card Number', key: 'idNumber', type: 'number' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={personalInfo[field.key]}
                      onChange={e => setPersonalInfo({ ...personalInfo, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  value={personalInfo.bio}
                  onChange={e => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[rgb(81,96,146)]/10 text-[rgb(81,96,146)] rounded-lg text-xs font-medium flex items-center gap-1.5">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-[rgb(81,96,146)] hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addSkill()}
                    placeholder="Add a skill"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                  />
                  <button onClick={addSkill} className="px-3 py-2 bg-[rgb(81,96,146)] text-white rounded-lg hover:bg-[rgb(71,86,136)]">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Portfolio Links</label>
                <div className="space-y-2">
                  {portfolio.map(item => (
                    <div key={item.id} className="flex gap-2">
                      <input
                        type="text"
                        value={item.platform}
                        onChange={e => updatePortfolio(item.id, 'platform', e.target.value)}
                        placeholder="Platform (e.g., GitHub)"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                      />
                      <input
                        type="url"
                        value={item.url}
                        onChange={e => updatePortfolio(item.id, 'url', e.target.value)}
                        placeholder="URL"
                        className="flex-[2] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                      />
                      <button
                        onClick={() => removePortfolio(item.id)}
                        className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addPortfolio} className="flex items-center gap-1.5 px-3 py-2 text-[rgb(81,96,146)] hover:bg-[rgb(81,96,146)]/10 rounded-lg text-xs font-medium">
                    <Plus className="w-3.5 h-3.5" /> Add Portfolio Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-amber-50 lg:col-span-2 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Password Requirements:</strong> At least 8 characters, including uppercase, lowercase, number, and special character.
                </p>
              </div>
              {[
                { label: 'Current Password *', key: 'currentPassword', show: showPassword, setShow: setShowPassword },
                { label: 'New Password *', key: 'newPassword', show: showNewPassword, setShow: setShowNewPassword },
                { label: 'Confirm New Password *', key: 'confirmPassword', show: showConfirmPassword, setShow: setShowConfirmPassword },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.show ? 'text' : 'password'}
                      value={passwordData[field.key]}
                      onChange={e => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => field.setShow(!field.show)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {experiences.map((exp, i) => (
                <div key={exp.id} className="border border-gray-200 rounded-lg p-4 relative">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-3 right-3 text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Experience {i + 1}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['jobTitle', 'companyName'].map(f => (
                      <div key={f}>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          {f === 'jobTitle' ? 'Job Title *' : 'Company Name *'}
                        </label>
                        <input
                          type="text"
                          value={exp[f]}
                          onChange={e => updateExperience(exp.id, f, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">From *</label>
                      <input
                        type="month"
                        value={exp.from}
                        onChange={e => updateExperience(exp.id, 'from', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">To</label>
                      <input
                        type="text"
                        value={exp.to}
                        onChange={e => updateExperience(exp.id, 'to', e.target.value)}
                        placeholder="Present"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Description</label>
                    <textarea
                      value={exp.jobDescription}
                      onChange={e => updateExperience(exp.id, 'jobDescription', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(81,96,146)] focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
              <button onClick={addExperience} className="flex items-center gap-1.5 px-3 py-2 text-[rgb(81,96,146)] hover:bg-[rgb(81,96,146)]/10 rounded-lg text-xs font-medium">
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {[
                { type: 'cv', name: 'CV / Resume' },
                { type: 'passport', name: 'Passport' },
                { type: 'identityCard', name: 'Identity Card' },
              ].map(doc => (
                <div key={doc.type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Upload your {doc.name.toLowerCase()}</p>
                    </div>
                    {documents[doc.type] && !(documents[doc.type] instanceof File) && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Uploaded</span>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[rgb(81,96,146)] transition-colors">
                    <input
                      type="file"
                      id={doc.type}
                      onChange={e => handleFileChange(doc.type, e.target.files[0])}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label htmlFor={doc.type} className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      {documents[doc.type] ? (
                        <div>
                          <p className="text-xs font-medium text-gray-900 mb-0.5">
                            {documents[doc.type] instanceof File ? documents[doc.type].name : 'Already uploaded'}
                          </p>
                          <p className="text-xs text-gray-500">Click to change</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-medium text-gray-900 mb-0.5">Click to upload</p>
                          <p className="text-xs text-gray-500">PDF, JPG or PNG (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save / Cancel */}
          <div className="flex items-center gap-2 pt-4 border-t mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-[rgb(81,96,146)] text-white rounded-lg hover:bg-[rgb(71,86,136)] disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}