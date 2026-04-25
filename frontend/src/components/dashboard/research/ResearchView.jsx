import React from 'react';
import {
  ArrowLeft, Edit, Calendar, Clock, Users, FileText, Download,
  Beaker, Target, FlaskConical, Lightbulb, TrendingUp, BookOpen,
  AlertCircle, CheckCircle, Eye, ChevronRight, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../utils/homeConstants';

const STATUS_CONFIG = {
  DRAFT: { label: 'DRAFT', color: '#94a3b8' },
  IN_PROGRESS: { label: 'IN PROGRESS', color: TEAL },
  COMPLETED: { label: 'COMPLETED', color: '#10b981' },
  REVIEW: { label: 'REVIEW', color: '#f59e0b' },
  PUBLISHED: { label: 'PUBLISHED', color: '#8b5cf6' },
};

const TYPE_CONFIG = {
  TECHNICAL: { label: 'Technical', icon: FlaskConical },
  MARKET: { label: 'Market', icon: TrendingUp },
  USER: { label: 'User', icon: Users },
  PERFORMANCE: { label: 'Performance', icon: Target },
  OTHER: { label: 'Other', icon: Lightbulb },
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
  const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
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

  const renderSection = (title, items, accentColor) => {
    if (!items || items.length === 0) return null;
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 4, height: 20, background: accentColor, borderRadius: 2 }}></div>
          <h3 style={{ ...bc(14, 800, { color: textC, letterSpacing: '0.05em' }) }}>{title.toUpperCase()}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: 24 }}
            >
              {item.title && (
                <h4 style={{ ...bc(13, 800, { color: accentColor, marginBottom: 8 }) }}>{item.title.toUpperCase()}</h4>
              )}
              {item.description && (
                <p style={{ ...ba(14, 500, { color: text2, margin: 0, lineHeight: 1.6 }) }}>{item.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: bg, minHeight: '100vh', paddingBottom: 80 }}>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: text3, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...bc(12, 700) }}
          >
            <ArrowLeft size={16} /> BACK TO REPOSITORY
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            RESEARCH / <span style={{ color: ORG }}>SESSION VIEW</span>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: '48px', 
            marginBottom: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' 
          }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: `linear-gradient(225deg, ${ORG}05 0%, transparent 70%)` }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ background: `${statusConfig.color}15`, color: statusConfig.color, padding: '6px 16px', borderRadius: 10, ...bc(10, 800) }}>
                {statusConfig.label}
              </span>
              <span style={{ color: text3, ...bc(10, 800) }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: text2, ...bc(10, 800) }}>
                <TypeIcon size={14} style={{ color: ORG }} /> {typeConfig.label.toUpperCase()}
              </div>
            </div>

            <h1 style={{ ...bc(48, 800, { color: textC, margin: '0 0 16px', lineHeight: 1.1 }) }}>{research.title}</h1>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} style={{ color: ORG }} />
                </div>
                <div>
                  <p style={{ ...bc(10, 800, { color: text3, margin: 0 }) }}>PRINCIPAL INVESTIGATOR</p>
                  <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{research.owner?.adminName || '—'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} style={{ color: TEAL }} />
                </div>
                <div>
                  <p style={{ ...bc(10, 800, { color: text3, margin: 0 }) }}>TIME HORIZON</p>
                  <p style={{ ...ba(14, 700, { color: textC, margin: 0 }) }}>{formatDate(research.startDate)} — {formatDate(research.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onEdit}
            style={{ 
              position: 'absolute', top: 48, right: 48, background: ORG, color: '#fff', border: 'none', 
              padding: '12px 24px', borderRadius: 12, cursor: 'pointer', ...bc(12, 800),
              display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 25px ${ORG}40`
            }}
          >
            <Edit size={16} /> MODIFY SESSION
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {research.description && (
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 32, padding: 40, marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ORG}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} style={{ color: ORG }} />
                  </div>
                  <h3 style={{ ...bc(16, 800, { color: textC, margin: 0 }) }}>ABSTRACT</h3>
                </div>
                <p style={{ ...ba(16, 500, { color: text2, margin: 0, lineHeight: 1.8 }) }}>{research.description}</p>
              </div>
            )}

            {research.summary && (
              <div style={{ background: `${TEAL}05`, border: `1px solid ${TEAL}20`, borderRadius: 32, padding: 40, marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${TEAL}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={18} style={{ color: TEAL }} />
                  </div>
                  <h3 style={{ ...bc(16, 800, { color: TEAL, margin: 0 }) }}>EXECUTIVE SUMMARY</h3>
                </div>
                <p style={{ ...ba(16, 600, { color: textC, margin: 0, lineHeight: 1.8 }) }}>{research.summary}</p>
              </div>
            )}

            {renderSection('Problem Statement', problem, '#ef4444')}
            {renderSection('Objectives', objective, TEAL)}
            {renderSection('Methodology', methodology, '#8b5cf6')}
            {renderSection('Key Findings', findings, '#10b981')}
            {renderSection('Strategic Conclusion', conclusion, '#f59e0b')}
            {renderSection('Actionable Recommendations', recommendations, ORG)}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div style={{ position: 'sticky', top: 40 }}>
              {/* Attachments */}
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 32, padding: 32, marginBottom: 24 }}>
                <h3 style={{ ...bc(14, 800, { color: textC, marginBottom: 24, letterSpacing: '0.05em' }) }}>RESOURCE REPOSITORY ({attachments.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {attachments.length > 0 ? attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 4 }}
                      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${ORG}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} style={{ color: ORG }} />
                        </div>
                        <div>
                          <p style={{ ...ba(13, 700, { color: textC, margin: 0, maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }) }}>{file.filename || `Doc_${index + 1}`}</p>
                          {file.size && <p style={{ ...ba(11, 600, { color: text3, margin: 0 }) }}>{formatFileSize(file.size)}</p>}
                        </div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ color: text3, hover: { color: ORG } }}>
                        <Download size={18} />
                      </a>
                    </motion.div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: text3, ...ba(13, 500) }}>No supplementary files</div>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 32, padding: 32 }}>
                <h3 style={{ ...bc(14, 800, { color: textC, marginBottom: 20, letterSpacing: '0.05em' }) }}>SESSION METRICS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...ba(12, 600, { color: text3 }) }}>PUBLISHED</span>
                    <span style={{ ...ba(12, 700, { color: textC }) }}>{formatDate(research.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...ba(12, 600, { color: text3 }) }}>SLUG ID</span>
                    <code style={{ ...ba(11, 700, { color: ORG, background: `${ORG}10`, padding: '2px 8px', borderRadius: 4 }) }}>{research.slug}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchView;
