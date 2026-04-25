import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, X, Plus, Trash2, FileText, Upload,
  Beaker, Target, FlaskConical, Lightbulb, CheckCircle,
  AlertCircle, Calendar, Clock, Users, TrendingUp, BookOpen,
  Zap, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../utils/homeConstants';

const uid = () => Math.random().toString(36).slice(2, 9);

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().slice(0, 10);
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'DRAFT', color: '#94a3b8' },
  { value: 'IN_PROGRESS', label: 'IN PROGRESS', color: TEAL },
  { value: 'COMPLETED', label: 'COMPLETED', color: '#10b981' },
  { value: 'REVIEW', label: 'REVIEW', color: '#f59e0b' },
  { value: 'PUBLISHED', label: 'PUBLISHED', color: '#8b5cf6' },
];

const TYPE_OPTIONS = [
  { value: 'TECHNICAL', label: 'Technical', icon: FlaskConical },
  { value: 'MARKET', label: 'Market', icon: TrendingUp },
  { value: 'USER', label: 'User', icon: Users },
  { value: 'PERFORMANCE', label: 'Performance', icon: Target },
  { value: 'OTHER', label: 'Other', icon: Lightbulb },
];

const TABS = [
  { id: 'details', label: 'CORE DETAILS', icon: FileText },
  { id: 'sections', label: 'RESEARCH SEGMENTS', icon: BookOpen },
  { id: 'attachments', label: 'RESOURCE REPOSITORY', icon: Upload },
];

const parseJsonField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(item => ({ ...item, id: item.id || uid() }));
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed.map(item => ({ ...item, id: item.id || uid() })) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  summary: '',
  type: 'TECHNICAL',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  problem: [],
  objective: [],
  methodology: [],
  findings: [],
  conclusion: [],
  recommendations: [],
  attachments: [],
};

const ResearchForm = ({
  research = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
  const isEdit = !!research;
  const [activeTab, setActiveTab] = useState('details');
  const [errors, setErrors] = useState({});
  const [existingAttachments, setExistingAttachments] = useState([]);

  const [form, setForm] = useState(() => {
    if (research) {
      return {
        title: research.title || '',
        slug: research.slug || '',
        description: research.description || '',
        summary: research.summary || '',
        type: research.type || 'TECHNICAL',
        status: research.status || 'DRAFT',
        startDate: formatDateTimeLocal(research.startDate),
        endDate: formatDateTimeLocal(research.endDate),
        problem: parseJsonField(research.problem),
        objective: parseJsonField(research.objective),
        methodology: parseJsonField(research.methodology),
        findings: parseJsonField(research.findings),
        conclusion: parseJsonField(research.conclusion),
        recommendations: parseJsonField(research.recommendations),
        attachments: [],
      };
    }
    return INITIAL_FORM;
  });

  useEffect(() => {
    if (research?.attachments) {
      const parsed = parseJsonField(research.attachments);
      setExistingAttachments(parsed);
    }
  }, [research]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value) => {
    setForm(prev => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
    if (value.trim()) setErrors(prev => ({ ...prev, title: undefined }));
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const addSectionItem = (sectionKey) => {
    setForm(prev => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], { id: uid(), title: '', description: '' }],
    }));
  };

  const updateSectionItem = (sectionKey, id, field, value) => {
    setForm(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeSectionItem = (sectionKey, id) => {
    setForm(prev => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter(item => item.id !== id),
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setActiveTab('details');
      return;
    }
    onSubmit({
      ...form,
      existingAttachments,
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const SectionLabel = ({ icon: Icon, label, required = false }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, ...bc(11, 800, { color: text3, letterSpacing: '0.05em' }) }}>
      <Icon size={14} style={{ color: ORG }} />
      {label.toUpperCase()} {required && <span style={{ color: ORG }}>*</span>}
    </label>
  );

  const renderSectionEditor = (sectionKey, title, accentColor) => (
    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: 32, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 4, height: 16, background: accentColor, borderRadius: 2 }}></div>
          <h4 style={{ ...bc(14, 800, { color: textC, margin: 0 }) }}>{title.toUpperCase()}</h4>
        </div>
        <button
          type="button"
          onClick={() => addSectionItem(sectionKey)}
          style={{ background: 'none', border: 'none', color: ORG, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', ...bc(11, 800) }}
        >
          <Plus size={14} /> ADD ENTRY
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {form[sectionKey].map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 20, position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => removeSectionItem(sectionKey, item.id)}
              style={{ position: 'absolute', top: 16, right: 16, color: text3, cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <Trash2 size={16} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateSectionItem(sectionKey, item.id, 'title', e.target.value)}
                placeholder="Entry Title..."
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${border}`, color: textC, ...ba(14, 700), padding: '8px 0', outline: 'none' }}
              />
              <textarea
                value={item.description || ''}
                onChange={(e) => updateSectionItem(sectionKey, item.id, 'description', e.target.value)}
                placeholder="Detailed explanation..."
                rows={2}
                style={{ width: '100%', background: 'transparent', border: 'none', color: text2, ...ba(14, 500), outline: 'none', resize: 'none' }}
              />
            </div>
          </motion.div>
        ))}
        {form[sectionKey].length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: text3, ...ba(13, 500), border: `1px dashed ${border}`, borderRadius: 16 }}>No entries in this segment</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 100 }}>
      <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto px-6 py-12">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: text3, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...bc(12, 700) }}
          >
            <ArrowLeft size={16} /> DISCARD & EXIT
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            RESEARCH / <span style={{ color: ORG }}>{isEdit ? 'EDIT' : 'CREATE'} SESSION</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: 0, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.02)' }}
        >
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${border}` }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  flex: 1, padding: '20px', background: activeTab === tab.id ? bg : 'transparent', 
                  border: 'none', color: activeTab === tab.id ? ORG : text3, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...bc(11, 800),
                  transition: 'all 0.2s', borderBottom: activeTab === tab.id ? `2px solid ${ORG}` : 'none'
                }}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 48 }}>
            <AnimatePresence mode="wait">
              {/* Core Details */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <SectionLabel icon={FileText} label="Session Title" required />
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Advanced AI Integration Phase 1"
                        style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                      />
                    </div>
                    <div>
                      <SectionLabel icon={Zap} label="Slug Identifier" required />
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        placeholder="session-slug-id"
                        style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <SectionLabel icon={Target} label="Research Taxonomy" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {TYPE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('type', opt.value)}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12, border: `1px solid ${form.type === opt.value ? ORG : border}`,
                            background: form.type === opt.value ? `${ORG}05` : bg, color: form.type === opt.value ? ORG : text3,
                            cursor: 'pointer', ...bc(11, 800), transition: 'all 0.2s'
                          }}
                        >
                          <opt.icon size={14} /> {opt.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionLabel icon={Clock} label="Status Protocol" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange('status', opt.value)}
                          style={{ 
                            padding: '10px 18px', borderRadius: 10, border: `1px solid ${form.status === opt.value ? opt.color : border}`,
                            background: form.status === opt.value ? `${opt.color}10` : bg, color: form.status === opt.value ? opt.color : text3,
                            cursor: 'pointer', ...bc(10, 800), transition: 'all 0.2s'
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <SectionLabel icon={Calendar} label="Commencement" />
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                      />
                    </div>
                    <div>
                      <SectionLabel icon={CheckCircle} label="Completion" />
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <SectionLabel icon={BookOpen} label="Abstract Overview" />
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="High-level description of research intent..."
                      rows={3}
                      style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none', resize: 'none' }}
                    />
                  </div>

                  <div>
                    <SectionLabel icon={Zap} label="Executive Summary" />
                    <textarea
                      value={form.summary}
                      onChange={(e) => handleChange('summary', e.target.value)}
                      placeholder="Concise summary of outcomes and implications..."
                      rows={4}
                      style={{ width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, color: textC, ...ba(15, 500), outline: 'none', resize: 'none' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Research Segments */}
              {activeTab === 'sections' && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                >
                  {renderSectionEditor('problem', 'Problem Statement', '#ef4444')}
                  {renderSectionEditor('objective', 'Objectives', TEAL)}
                  {renderSectionEditor('methodology', 'Methodology', '#8b5cf6')}
                  {renderSectionEditor('findings', 'Findings', '#10b981')}
                  {renderSectionEditor('conclusion', 'Conclusion', '#f59e0b')}
                  {renderSectionEditor('recommendations', 'Recommendations', ORG)}
                </motion.div>
              )}

              {/* Resource Repository */}
              {activeTab === 'attachments' && (
                <motion.div
                  key="attachments"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 32 }}
                >
                  <label 
                    style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                      width: '100%', padding: '60px 40px', border: `2px dashed ${border}`, borderRadius: 32,
                      background: `${ORG}05`, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = ORG}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = border}
                  >
                    <div style={{ width: 64, height: 64, background: ORG, color: '#fff', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${ORG}40` }}>
                      <Upload size={32} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h3 style={{ ...bc(18, 800, { color: textC, margin: '0 0 8px' }) }}>UPLOAD RESOURCES</h3>
                      <p style={{ ...ba(14, 500, { color: text3, margin: 0 }) }}>Select research documents, data sets, or presentation files</p>
                    </div>
                    <input type="file" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                  </label>

                  {/* Attachment Lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Existing */}
                    {existingAttachments.map((file, index) => (
                      <div key={`existing-${index}`} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <FileText size={18} style={{ color: ORG }} />
                          <div>
                            <p style={{ ...ba(13, 700, { color: textC, margin: 0 }) }}>{file.filename || `Doc_${index + 1}`}</p>
                            <p style={{ ...ba(11, 600, { color: text3, margin: 0 }) }}>EXISTING RESOURCE</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeExistingAttachment(index)} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {/* New */}
                    {form.attachments.map((file, index) => (
                      <div key={`new-${index}`} style={{ background: `${ORG}05`, border: `1px solid ${ORG}30`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <FileText size={18} style={{ color: ORG }} />
                          <div>
                            <p style={{ ...ba(13, 700, { color: ORG, margin: 0 }) }}>{file.name}</p>
                            <p style={{ ...ba(11, 600, { color: ORG, opacity: 0.6, margin: 0 }) }}>PENDING UPLOAD • {formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeNewFile(index)} style={{ background: 'none', border: 'none', color: ORG, cursor: 'pointer' }}><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  {existingAttachments.length === 0 && form.attachments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: text3, ...ba(14, 500) }}>No resources associated with this session</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div style={{ 
          marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '20px 32px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: text3, ...bc(13, 700), cursor: 'pointer' }}
          >
            DISCARD
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ 
              padding: '12px 32px', borderRadius: 12, background: ORG, color: '#fff', border: 'none', 
              cursor: 'pointer', ...bc(13, 700), display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: `0 8px 24px ${ORG}40`, opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? (
              <><div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" /> SAVING...</>
            ) : (
              <><Save size={18} /> {isEdit ? 'SAVE MODIFICATIONS' : 'INITIALIZE SESSION'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResearchForm;
