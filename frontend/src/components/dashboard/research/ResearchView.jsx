import {
  ArrowLeft, Edit, Calendar, Clock, Users, FileText, Download,
  Beaker, Target, FlaskConical, Lightbulb, TrendingUp, BookOpen,
  AlertCircle, CheckCircle, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
  REVIEW: { label: 'Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  PUBLISHED: { label: 'Published', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const TYPE_CONFIG = {
  TECHNICAL: { label: 'Technical', icon: FlaskConical, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  MARKET: { label: 'Market', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
  USER: { label: 'User', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  PERFORMANCE: { label: 'Performance', icon: Target, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  OTHER: { label: 'Other', icon: Lightbulb, color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

const parseJsonField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ResearchView = ({ research, onEdit, onBack }) => {
  const statusConfig = STATUS_CONFIG[research.status] || STATUS_CONFIG.DRAFT;
  const typeConfig = TYPE_CONFIG[research.type] || TYPE_CONFIG.OTHER;
  const TypeIcon = typeConfig.icon;

  const problem = parseJsonField(research.problem);
  const objective = parseJsonField(research.objective);
  const methodology = parseJsonField(research.methodology);
  const findings = parseJsonField(research.findings);
  const conclusion = parseJsonField(research.conclusion);
  const recommendations = parseJsonField(research.recommendations);
  const attachments = parseJsonField(research.attachments);

  const renderSection = (title, items, bgColor, iconColor) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${bgColor} rounded-xl p-4`}
            >
              {item.title && (
                <h4 className={`text-sm font-semibold ${iconColor} mb-2`}>{item.title}</h4>
              )}
              {item.description && (
                <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className=" mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Research Details</h1>
              <p className="text-xs text-gray-500 mt-0.5">View research information</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors border border-yellow-200"
          >
            <Edit className="w-4 h-4" />
            Edit
          </motion.button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Title Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${typeConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <TypeIcon className={`w-7 h-7 ${typeConfig.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{research.title}</h2>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slug */}
            {research.slug && (
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium">Slug:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">{research.slug}</code>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Owner</p>
                <p className="text-sm font-semibold text-gray-900">{research.owner?.adminName || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Start Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(research.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">End Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(research.endDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Created</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(research.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Description & Summary */}
          <div className="p-6 space-y-6">
            {research.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Description</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
                  {research.description}
                </p>
              </div>
            )}

            {research.summary && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">Summary</h3>
                <p className="text-sm text-gray-600 bg-orange-50 rounded-xl p-4 leading-relaxed">
                  {research.summary}
                </p>
              </div>
            )}
          </div>

          {/* Research Sections */}
          <div className="p-6 border-t border-gray-100 space-y-8">
            {renderSection('Problem Statement', problem, 'bg-red-50', 'text-red-700')}
            {renderSection('Objectives', objective, 'bg-blue-50', 'text-blue-700')}
            {renderSection('Methodology', methodology, 'bg-purple-50', 'text-purple-700')}
            {renderSection('Findings', findings, 'bg-green-50', 'text-green-700')}
            {renderSection('Conclusion', conclusion, 'bg-yellow-50', 'text-yellow-700')}
            {renderSection('Recommendations', recommendations, 'bg-indigo-50', 'text-indigo-700')}
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Attachments ({attachments.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{file.filename || `File ${index + 1}`}</p>
                        {file.size && (
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        )}
                      </div>
                    </div>
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-white transition-all"
            >
              Back to List
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md shadow-orange-200 transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Research
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchView;
