import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import reportService from '../../../services/reportService';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../utils/homeConstants';
import { 
  FileText, Calendar, Upload, Edit3, 
  ArrowLeft, Eye, Save, X, Check,
  Clock, AlertCircle, FilePlus, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UpsertReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bg, bg2, textC, text2, text3, border, isDark } = useDashboardTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [createdAt, setCreatedAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState('editor'); // 'editor' or 'file'
  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const report = await reportService.getReportById(id);
        setTitle(report.title || '');
        setContent(report.content || '');
        if (report.createdAt) {
          const date = new Date(report.createdAt);
          setCreatedAt(date.toISOString().slice(0, 16));
        }
        if (report.reportUrl) setInputMethod('file');
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'LOAD FAILED',
          text: err.message,
          confirmButtonColor: ORG,
        }).then(() => navigate('/admin/dashboard/report'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setReportFile(file);
  };

  const handlePreview = () => {
    if (!title.trim()) {
      Swal.fire({ icon: 'warning', title: 'TITLE REQUIRED', text: 'Please provide a title for the report', confirmButtonColor: ORG });
      return;
    }
    if (inputMethod === 'editor' && (!content.trim() || content === '<p><br></p>')) {
      Swal.fire({ icon: 'warning', title: 'CONTENT EMPTY', text: 'Please write some content', confirmButtonColor: ORG });
      return;
    }
    
    if (inputMethod === 'editor') {
      Swal.fire({
        title: `<span style="font-family: 'Bebas Neue'; letter-spacing: 1px;">${title.toUpperCase()}</span>`,
        html: `<div style="text-align: left; background: ${bg}; color: ${textC}; padding: 24px; border-radius: 16px;" class="ql-editor">${content}</div>`,
        width: '800px',
        background: bg2,
        confirmButtonText: 'CLOSE PREVIEW',
        confirmButtonColor: ORG,
      });
    } else {
      Swal.fire({ icon: 'info', title: 'FILE MODE', text: 'File preview is not available for uploads.', confirmButtonColor: TEAL });
    }
  };

  const submitReport = async () => {
    if (!title.trim() || !createdAt) {
      Swal.fire({ icon: 'error', title: 'VALIDATION ERROR', text: 'Title and Date are required', confirmButtonColor: ORG });
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        title: title.trim(),
        createdAt: new Date(createdAt).toISOString(),
      };
      if (inputMethod === 'editor') reportData.content = content;
      else if (inputMethod === 'file' && reportFile) reportData.reportFile = reportFile;

      if (isEditMode) await reportService.updateReport(id, reportData);
      else await reportService.createReport(reportData);

      await Swal.fire({ icon: 'success', title: 'SUCCESS', text: `Report ${isEditMode ? 'updated' : 'created'} successfully`, confirmButtonColor: TEAL });
      navigate('/admin/dashboard/report');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'FAILED', text: err.message, confirmButtonColor: ORG });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionLabel = ({ icon: Icon, label, required = false }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, ...bc(12, 800, { color: text3, letterSpacing: '0.05em' }) }}>
      <Icon size={14} style={{ color: ORG }} />
      {label.toUpperCase()} {required && <span style={{ color: ORG }}>*</span>}
    </label>
  );

  if (isLoading) return (
    <div style={{ height: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${border}`, borderTopColor: ORG, borderRadius: '50%' }} className="animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, paddingBottom: 100 }}>
      <div className="max-w-[1000px] mx-auto px-4 py-12">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <button
            onClick={() => navigate('/admin/dashboard/report')}
            style={{ background: 'none', border: 'none', color: text3, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', ...bc(12, 700) }}
          >
            <ArrowLeft size={16} /> DISCARD & EXIT
          </button>
          <div style={{ ...bc(12, 800, { color: text3, letterSpacing: '0.1em' }) }}>
            REPORTS / <span style={{ color: ORG }}>{isEditMode ? 'EDIT' : 'CREATE'} SESSION</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 40, padding: '48px', boxShadow: '0 20px 60px rgba(0,0,0,0.02)' }}
        >
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ ...bc(40, 800, { color: textC, margin: '0 0 8px' }) }}>{isEditMode ? 'REFINE REPORT' : 'NEW PROGRESS LOG'}</h1>
            <p style={{ ...ba(16, 500, { color: text2, margin: 0 }) }}>Document your results and maintain transparency with the team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Title */}
            <div>
              <SectionLabel icon={FileText} label="Report Title" required />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekly Operations Summary"
                style={{ 
                  width: '100%', padding: '16px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, 
                  color: textC, ...ba(15, 500), outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Date */}
            <div>
              <SectionLabel icon={Clock} label="Report Timestamp" required />
              <input
                type="datetime-local"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                style={{ 
                  width: '100%', padding: '15px 20px', background: bg, border: `1px solid ${border}`, borderRadius: 16, 
                  color: textC, ...ba(15, 500), outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Input Method Toggle */}
          <div style={{ marginBottom: 40 }}>
            <SectionLabel icon={Zap} label="Submission Method" />
            <div style={{ display: 'flex', gap: 8, background: bg, padding: 6, borderRadius: 16, border: `1px solid ${border}`, width: 'fit-content' }}>
              {[
                { id: 'editor', label: 'WRITTEN LOG', icon: Edit3 },
                { id: 'file', label: 'FILE UPLOAD', icon: Upload }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setInputMethod(m.id)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 12, border: 'none',
                    background: inputMethod === m.id ? ORG : 'transparent',
                    color: inputMethod === m.id ? '#fff' : text3,
                    cursor: 'pointer', ...bc(11, 800, { transition: 'all 0.2s' })
                  }}
                >
                  <m.icon size={14} /> {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {inputMethod === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              >
                <SectionLabel icon={Edit3} label="Detailed Content" required />
                <div style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}`, background: '#fff' }}>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    placeholder="Capture your achievements, challenges, and next steps..."
                    style={{ height: 400 }}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'blockquote', 'code-block'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              >
                <SectionLabel icon={Upload} label="Report Document" required />
                <div 
                  style={{ 
                    border: `2px dashed ${border}`, borderRadius: 32, padding: '60px 40px', textAlign: 'center',
                    background: `${ORG}05`, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = ORG}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = border}
                  onClick={() => document.getElementById('reportFile').click()}
                >
                  <div style={{ width: 64, height: 64, background: ORG, color: '#fff', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 8px 24px ${ORG}40` }}>
                    <FilePlus size={32} />
                  </div>
                  <h3 style={{ ...bc(18, 800, { color: textC, margin: '0 0 8px' }) }}>{reportFile ? reportFile.name : 'SELECT DOCUMENT'}</h3>
                  <p style={{ ...ba(14, 500, { color: text3, margin: 0 }) }}>PDF, DOCX, or Excel files preferred (Max 10MB)</p>
                  <input type="file" id="reportFile" hidden onChange={handleFileChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Actions */}
        <div style={{ 
          marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: bg2, border: `1px solid ${border}`, borderRadius: 24, padding: '20px 32px'
        }}>
          <button
            onClick={() => navigate('/admin/dashboard/report')}
            style={{ background: 'none', border: 'none', color: text3, ...bc(13, 700), cursor: 'pointer' }}
          >
            DISCARD
          </button>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={handlePreview}
              style={{ padding: '12px 24px', borderRadius: 12, background: bg, border: `1px solid ${border}`, color: text2, cursor: 'pointer', ...bc(13, 700), display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Eye size={18} /> PREVIEW
            </button>
            <button
              onClick={submitReport}
              disabled={isSubmitting}
              style={{ 
                padding: '12px 32px', borderRadius: 12, background: ORG, color: '#fff', border: 'none', 
                cursor: 'pointer', ...bc(13, 700), display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: `0 8px 24px ${ORG}40`, opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Save size={18} /> {isSubmitting ? 'SAVING...' : isEditMode ? 'UPDATE LOG' : 'PUBLISH REPORT'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid ${border} !important; padding: 12px 20px !important; background: ${isDark ? '#f8f9fa' : '#fff'} !important; }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { padding: 24px !important; font-family: 'Barlow', sans-serif !important; font-size: 15px !important; color: #1a1a1a !important; line-height: 1.7 !important; }
        .ql-editor.ql-blank::before { color: #999 !important; font-style: normal !important; }
      `}</style>
    </div>
  );
};

export default UpsertReportPage;