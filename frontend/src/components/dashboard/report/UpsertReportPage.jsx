import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Swal from 'sweetalert2';
import reportService from '../../../services/reportService';

const UpsertReportPage = () => {
  const { id } = useParams(); // Get report ID from URL params
  const navigate = useNavigate(); // For navigation
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = Boolean(id); // Determine if we're editing or creating

  // Fetch report data if in edit mode
  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return; // Skip if no ID (create mode)

      setIsLoading(true);
      try {
        const report = await reportService.getReportById(id);
        
        setTitle(report.title || '');
        
        setContent(report.content || '');
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Report',
          text: err.message || 'Could not fetch report data',
          confirmButtonColor: '#ef4444'
        }).then(() => {
          navigate('/admin/dashboard/report');
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  // Handle preview
  const handlePreview = () => {
    if (!title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Title',
        text: 'Please enter a report title',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Content',
        text: 'Please write some content for the report',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    Swal.fire({
      title: title,
      html: `
        <div class="text-left">
          <div class="ql-editor" style="padding: 1rem;">
            ${content}
          </div>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      confirmButtonText: 'Close Preview',
      confirmButtonColor: '#3b82f6',
      customClass: {
        htmlContainer: 'swal-preview-container'
      }
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Title is required',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!content.trim() || content === '<p><br></p>') {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Report content is required',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Ask user what they want to do
    const result = await Swal.fire({
      title: 'Ready to Submit?',
      text: 'Would you like to preview your report before submitting?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Preview First',
      denyButtonText: isEditMode ? 'Update Now' : 'Submit Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      denyButtonColor: '#10b981',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      // Show preview
      handlePreview();
      return;
    }

    if (result.isDenied) {
      // Proceed with submission
      await submitReport();
    }
  };

  // Submit report to backend
  const submitReport = async () => {
    setIsSubmitting(true);

    try {
      const reportData = {
        title: title.trim(),
        content: content
      };

      if (isEditMode) {
        // Update existing report
        await reportService.updateReport(id, reportData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Report Updated!',
          text: 'Your report has been successfully updated',
          confirmButtonColor: '#10b981'
        });
      } else {
        // Create new report
        await reportService.createReport(reportData);
        
        await Swal.fire({
          icon: 'success',
          title: 'Report Created!',
          text: 'Your report has been successfully saved',
          confirmButtonColor: '#10b981'
        });
      }

      // Navigate back to reports list
      navigate('/admin/dashboard/report');

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || `An error occurred while ${isEditMode ? 'updating' : 'saving'} the report`,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (title.trim() || (content.trim() && content !== '<p><br></p>')) {
      Swal.fire({
        title: 'Discard Changes?',
        text: 'You have unsaved changes. Are you sure you want to leave?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Discard',
        cancelButtonText: 'No, Stay',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/admin/dashboard/report');
        }
      });
    } else {
      navigate('/admin/dashboard/report');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            📋 {isEditMode ? 'Update Report' : 'Create New Report'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? 'Edit your work progress report' : 'Write your daily work progress report'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Report Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Daily Progress Report - October 21, 2025"
              disabled={isSubmitting}
            />
          </div>

          {/* Rich Text Editor */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Report Content <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Start writing your report here..."
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['blockquote', 'code-block'],
                  ['link', 'image'],
                  [{ align: [] }],
                  [{ color: [] }, { background: [] }],
                  ['clean']
                ]
              }}
              formats={[
                'header',
                'bold',
                'italic',
                'underline',
                'strike',
                'blockquote',
                'code-block',
                'list',
                'bullet',
                'link',
                'image',
                'align',
                'color',
                'background'
              ]}
              className="bg-white rounded-lg"
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              Cancel
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                👁️ Preview
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
              >
                {isSubmitting 
                  ? '💾 Saving...' 
                  : isEditMode 
                    ? '💾 Update Report' 
                    : '💾 Submit Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Preview */}
      <style jsx>{`
        .swal-preview-container .ql-editor {
          padding: 1rem;
          max-height: 500px;
          overflow-y: auto;
        }
        
        .swal-preview-container .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }
        
        .swal-preview-container .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }
        
        .swal-preview-container .ql-editor h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
        }
        
        .swal-preview-container .ql-editor ul,
        .swal-preview-container .ql-editor ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .swal-preview-container .ql-editor ul {
          list-style-type: disc;
        }
        
        .swal-preview-container .ql-editor ol {
          list-style-type: decimal;
        }
        
        .swal-preview-container .ql-editor li {
          margin-bottom: 0.5em;
        }
        
        .swal-preview-container .ql-editor p {
          margin-bottom: 1em;
        }
        
        .swal-preview-container .ql-editor strong {
          font-weight: bold;
        }
        
        .swal-preview-container .ql-editor em {
          font-style: italic;
        }
        
        .swal-preview-container .ql-editor blockquote {
          border-left: 4px solid #ccc;
          padding-left: 1em;
          margin-left: 0;
          font-style: italic;
        }

        .ql-container {
          min-height: 400px;
        }
        
        .ql-editor {
          min-height: 400px;
        }
      `}</style>
    </div>
  );
};

export default UpsertReportPage;