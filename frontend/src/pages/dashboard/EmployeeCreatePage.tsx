import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Camera, FileText, Lock, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import adminAuthService from '../../services/adminAuthService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../utils/homeConstants';

interface EmployeeFormState {
  adminName: string;
  adminEmail: string;
  phone: string;
  location: string;
  password: string;
  confirmPassword: string;
  bio: string;
  idNumber: string;
  joinedDate: string;
  skills: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const INITIAL_FORM: EmployeeFormState = {
  adminName: '',
  adminEmail: '',
  phone: '',
  location: '',
  password: '',
  confirmPassword: '',
  bio: '',
  idNumber: '',
  joinedDate: '',
  skills: '',
  status: 'ACTIVE',
};

const EmployeeCreatePage = () => {
  const navigate = useNavigate();
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const [formData, setFormData] = useState<EmployeeFormState>(INITIAL_FORM);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inputStyle = {
    background: bg3,
    border: `1px solid ${border}`,
    color: textC,
    borderRadius: 4,
    outline: 'none',
    padding: '10px 12px',
    width: '100%',
    ...ba(14, 400, {}),
  };

  const labelStyle = { ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase' as const, color: text2, display: 'flex' }) };

  const handleChange = (field: keyof EmployeeFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProfileImage(file);
    setProfilePreview(file ? URL.createObjectURL(file) : null);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.adminName.trim()) nextErrors.adminName = 'Full name is required';
    if (!formData.adminEmail.trim()) nextErrors.adminEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) nextErrors.adminEmail = 'Invalid email format';
    if (!formData.password) nextErrors.password = 'Password is required';
    else if (formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (formData.confirmPassword !== formData.password) nextErrors.confirmPassword = 'Passwords do not match';
    if (formData.idNumber && !/^\d+$/.test(formData.idNumber)) nextErrors.idNumber = 'ID number must contain digits only';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      await adminAuthService.createEmployee({
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        bio: formData.bio.trim(),
        idNumber: formData.idNumber.trim(),
        joinedDate: formData.joinedDate,
        skills: skillsArray,
        status: formData.status,
        ...(profileImage ? { profileImage } : {}),
      });

      navigate('/admin/dashboard/employee');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
        <div className="mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/dashboard/employee')}
              className="flex items-center gap-2 px-4 py-2 transition-opacity hover:opacity-80"
              style={{ ...ba(13, 500, { color: textC }), background: bg3, border: `1px solid ${border}`, borderRadius: 4 }}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </motion.button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <UserPlus className="w-5 h-5" style={{ color: ORG }} />
                <h1 style={{ ...bb('clamp(22px,3vw,32px)', { color: ORG, letterSpacing: 2 }) }}>Add Employee</h1>
              </div>
              <p style={{ ...ba(13, 400, { color: text2 }) }}>
                Create a new employee account. They will be able to log in with the email and password set here.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-10 ">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}
        >
          <div className="p-8 space-y-6">
            {submitError && (
              <div
                style={{
                  background: 'rgba(232,64,64,.1)',
                  border: '1px solid rgba(232,64,64,.3)',
                  borderRadius: 4,
                  padding: 12,
                  color: '#e84040',
                  fontSize: 12,
                }}
              >
                {submitError}
              </div>
            )}

            {/* Profile photo */}
            <div className="flex items-center gap-4">
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: bg3,
                  border: `1px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User className="w-6 h-6" style={{ color: text2 }} />
                )}
              </div>
              <label
                className="flex items-center gap-2 px-4 py-2 transition-opacity hover:opacity-80"
                style={{ ...ba(12, 600, { color: textC, cursor: 'pointer' }), background: bg3, border: `1px solid ${border}`, borderRadius: 4 }}
              >
                <Camera className="w-4 h-4" style={{ color: ORG }} />
                {profileImage ? profileImage.name : 'Upload profile photo'}
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2" style={labelStyle}><User className="w-4 h-4" style={{ color: ORG }} />Full Name *</label>
                <input
                  value={formData.adminName}
                  onChange={(e) => handleChange('adminName', e.target.value)}
                  placeholder="e.g. Jane Doe"
                  style={{ ...inputStyle, border: `1px solid ${errors.adminName ? '#e84040' : border}` }}
                />
                {errors.adminName && <p style={{ fontSize: 11, color: '#e84040', marginTop: 4 }}>{errors.adminName}</p>}
              </div>
              <div>
                <label className="mb-2" style={labelStyle}><Mail className="w-4 h-4" style={{ color: ORG }} />Email *</label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                  placeholder="e.g. jane@abytech.com"
                  style={{ ...inputStyle, border: `1px solid ${errors.adminEmail ? '#e84040' : border}` }}
                />
                {errors.adminEmail && <p style={{ fontSize: 11, color: '#e84040', marginTop: 4 }}>{errors.adminEmail}</p>}
              </div>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2" style={labelStyle}><Phone className="w-4 h-4" style={{ color: ORG }} />Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +250 780 000 000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2" style={labelStyle}><MapPin className="w-4 h-4" style={{ color: ORG }} />Location</label>
                <input
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Kigali, Rwanda"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2" style={labelStyle}><Lock className="w-4 h-4" style={{ color: ORG }} />Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{ ...inputStyle, border: `1px solid ${errors.password ? '#e84040' : border}` }}
                />
                {errors.password && <p style={{ fontSize: 11, color: '#e84040', marginTop: 4 }}>{errors.password}</p>}
              </div>
              <div>
                <label className="mb-2" style={labelStyle}><Lock className="w-4 h-4" style={{ color: ORG }} />Confirm Password *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  style={{ ...inputStyle, border: `1px solid ${errors.confirmPassword ? '#e84040' : border}` }}
                />
                {errors.confirmPassword && <p style={{ fontSize: 11, color: '#e84040', marginTop: 4 }}>{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* ID Number, Joined Date, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-2" style={labelStyle}><FileText className="w-4 h-4" style={{ color: ORG }} />ID Number</label>
                <input
                  value={formData.idNumber}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  placeholder="National ID"
                  style={{ ...inputStyle, border: `1px solid ${errors.idNumber ? '#e84040' : border}` }}
                />
                {errors.idNumber && <p style={{ fontSize: 11, color: '#e84040', marginTop: 4 }}>{errors.idNumber}</p>}
              </div>
              <div>
                <label className="mb-2" style={labelStyle}>Joined Date</label>
                <input
                  type="date"
                  value={formData.joinedDate}
                  onChange={(e) => handleChange('joinedDate', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="mb-2" style={labelStyle}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                  style={inputStyle}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="mb-2" style={labelStyle}><Briefcase className="w-4 h-4" style={{ color: ORG }} />Skills</label>
              <input
                value={formData.skills}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="Comma-separated, e.g. React, NestJS, Figma"
                style={inputStyle}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-2" style={labelStyle}>Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Short bio about the employee..."
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            <div
              className="p-4"
              style={{ ...ba(13, 400, { color: ORG }), background: 'rgba(232,98,26,.08)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4 }}
            >
              Note: CV, passport, ID card uploads, work experience, and portfolio can be added later from the employee's profile edit page. Dashboard permissions are assigned separately from the Permissions page.
            </div>
          </div>

          <div className="px-8 py-5 flex justify-end gap-4" style={{ background: bg3, borderTop: `1px solid ${border}` }}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/admin/dashboard/employee')}
              className="px-6 py-3 transition-opacity hover:opacity-80"
              style={{ ...ba(13, 600, { color: textC }), background: bg3, border: `1px solid ${border}`, borderRadius: 4, cursor: 'pointer' }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
              style={{ ...ba(13, 600, { color: '#fff' }), background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }} />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EmployeeCreatePage;
