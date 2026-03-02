import { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, X, Plus, Trash2, FileText, Upload,
  Beaker, Target, FlaskConical, Lightbulb, CheckCircle,
  AlertCircle, Calendar, Clock, Users, TrendingUp, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const uid = () => Math.random().toString(36).slice(2, 9);

const formatDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().slice(0, 10);
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'REVIEW', label: 'Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'PUBLISHED', label: 'Published', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const TYPE_OPTIONS = [
  { value: 'TECHNICAL', label: 'Technical', icon: FlaskConical, color: 'text-blue-600' },
  { value: 'MARKET', label: 'Market', icon: TrendingUp, color: 'text-green-600' },
  { value: 'USER', label: 'User', icon: Users, color: 'text-purple-600' },
  { value: 'PERFORMANCE', label: 'Performance', icon: Target, color: 'text-orange-600' },
  { value: 'OTHER', label: 'Other', icon: Lightbulb, color: 'text-gray-600' },
];

const TABS = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'sections', label: 'Sections', icon: BookOpen },
  { id: 'attachments', label: 'Attachments', icon: Upload },
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

  // Section management (for problem, objective, etc.)
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

  // File handling
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
    if (!form.type) errs.type = 'Type is required';
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

  const renderSectionEditor = (sectionKey, title, bgColor) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addSectionItem(sectionKey)}
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </motion.button>
      </div>

      <AnimatePresence>
        {form[sectionKey].length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${bgColor} rounded-lg p-4 text-center text-xs text-gray-500`}
          >
            No {title.toLowerCase()} added yet
          </motion.div>
        ) : (
          <div className="space-y-3">
            {form[sectionKey].map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${bgColor} rounded-lg p-4 space-y-3`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateSectionItem(sectionKey, item.id, 'title', e.target.value)}
                      placeholder={`${title} title...`}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
                    />
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => updateSectionItem(sectionKey, item.id, 'description', e.target.value)}
                      placeholder="Description..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white resize-none"
                    />
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeSectionItem(sectionKey, item.id)}
                    className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <form onSubmit={handleSubmit} className=" mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Edit Research' : 'Create Research'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit ? 'Update research details' : 'Add a new research project'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map(opt => (
              <motion.button
                key={opt.value}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChange('status', opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.status === opt.value
                    ? opt.color + ' ring-2 ring-offset-1 ring-orange-300'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const count =
                tab.id === 'sections'
                  ? form.problem.length + form.objective.length + form.methodology.length +
                    form.findings.length + form.conclusion.length + form.recommendations.length
                  : tab.id === 'attachments'
                  ? form.attachments.length + existingAttachments.length
                  : null;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'text-orange-600 bg-orange-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {count !== null && count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-600 rounded-full">
                      {count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Research title..."
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-orange-100 transition-all ${
                          errors.title
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-gray-200 focus:border-orange-400'
                        }`}
                      />
                      {errors.title && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.title}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        placeholder="research-slug"
                        className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-orange-100 transition-all ${
                          errors.slug
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-gray-200 focus:border-orange-400'
                        }`}
                      />
                      {errors.slug && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TYPE_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                          <motion.button
                            key={opt.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChange('type', opt.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                              form.type === opt.value
                                ? 'bg-orange-50 border-orange-300 text-orange-700 ring-2 ring-orange-100'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${form.type === opt.value ? 'text-orange-600' : opt.color}`} />
                            {opt.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Brief description of the research..."
                      rows={3}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Summary
                    </label>
                    <textarea
                      value={form.summary}
                      onChange={(e) => handleChange('summary', e.target.value)}
                      placeholder="Executive summary..."
                      rows={4}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Sections Tab */}
              {activeTab === 'sections' && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {renderSectionEditor('problem', 'Problem Statement', 'bg-red-50')}
                  {renderSectionEditor('objective', 'Objectives', 'bg-blue-50')}
                  {renderSectionEditor('methodology', 'Methodology', 'bg-purple-50')}
                  {renderSectionEditor('findings', 'Findings', 'bg-green-50')}
                  {renderSectionEditor('conclusion', 'Conclusion', 'bg-yellow-50')}
                  {renderSectionEditor('recommendations', 'Recommendations', 'bg-indigo-50')}
                </motion.div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <motion.div
                  key="attachments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Upload Zone */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload files</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, etc.</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Existing Attachments */}
                  {existingAttachments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Existing Attachments</h4>
                      <div className="space-y-2">
                        {existingAttachments.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-orange-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">{file.filename || `File ${index + 1}`}</p>
                                {file.size && (
                                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.url && (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              )}
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeExistingAttachment(index)}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Files */}
                  {form.attachments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">New Files to Upload</h4>
                      <div className="space-y-2">
                        {form.attachments.map((file, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between bg-orange-50 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-orange-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeNewFile(index)}
                              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.attachments.length === 0 && existingAttachments.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No attachments yet
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-white transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Save Changes' : 'Create Research'}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResearchForm;
