import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Star, StarOff, Mail, Phone, MapPin, Calendar,
  GraduationCap, Briefcase, FileText, ExternalLink, Clock, CheckCircle,
  XCircle, AlertCircle, UserCheck, UserX, Send, Shield, Loader2, Globe, Github, Linkedin
} from 'lucide-react';
import Swal from 'sweetalert2';
import internshipService from '../../services/internshipService';

const PRIMARY_COLOR = 'rgb(249, 115, 22)';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  REVIEWING: { label: 'Reviewing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
  ACCEPTED: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  WAITLISTED: { label: 'Waitlisted', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: AlertCircle },
};

const TYPE_CONFIG = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  UI_UX: { label: 'UI/UX Design', color: 'bg-pink-100 text-pink-800 border-pink-200' },
  DATA: { label: 'Data', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  MARKETING: { label: 'Marketing', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  IT_SUPPORT: { label: 'IT Support', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const PERIOD_CONFIG = {
  ONE_MONTH: '1 Month',
  THREE_MONTHS: '3 Months',
  SIX_MONTHS: '6 Months',
  ONE_YEAR: '1 Year',
};

const InternshipViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/admin/dashboard/internships');
        return;
      }

      try {
        const data = await internshipService.getApplicationById(id);
        setApplication(data);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to load application',
          confirmButtonColor: PRIMARY_COLOR,
        }).then(() => {
          navigate('/admin/dashboard/internships');
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/admin/dashboard/internships');
  };

  const handleToggleShortlist = async () => {
    try {
      await internshipService.toggleShortlist(id);
      setApplication(prev => ({ ...prev, isShortlisted: !prev.isShortlisted }));
      Swal.fire({
        icon: 'success',
        title: application.isShortlisted ? 'Removed from shortlist' : 'Added to shortlist',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to update shortlist',
        confirmButtonColor: PRIMARY_COLOR,
      });
    }
  };

  const handleAccept = async () => {
    const result = await Swal.fire({
      title: 'Accept Intern?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p>You are about to accept <strong>${application.fullName}</strong> as an intern.</p>
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3 space-y-2">
            <div class="flex items-center gap-2 text-emerald-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>They will remain an intern until a super-admin converts them into an employee</span>
            </div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Accept Intern',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setAcceptLoading(true);
      try {
        await internshipService.updateApplicationStatus(id, 'ACCEPTED');
        setApplication(prev => ({ ...prev, status: 'ACCEPTED' }));
        Swal.fire({
          icon: 'success',
          title: 'Intern Accepted!',
          text: `${application.fullName} has been accepted as an intern and moved to Intern Management.`,
          confirmButtonColor: PRIMARY_COLOR,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to accept intern',
          confirmButtonColor: PRIMARY_COLOR,
        });
      } finally {
        setAcceptLoading(false);
      }
    }
  };

  const handleReject = async () => {
    const result = await Swal.fire({
      title: 'Reject Application?',
      text: `Are you sure you want to reject ${application.fullName}'s application?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Reject Application',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      setRejectLoading(true);
      try {
        await internshipService.updateApplicationStatus(id, 'REJECTED');
        setApplication(prev => ({ ...prev, status: 'REJECTED' }));
        Swal.fire({
          icon: 'success',
          title: 'Application Rejected',
          text: `${application.fullName}'s application has been rejected.`,
          confirmButtonColor: PRIMARY_COLOR,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to reject application',
          confirmButtonColor: PRIMARY_COLOR,
        });
      } finally {
        setRejectLoading(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
        }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-stone-600 font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const StatusIcon = STATUS_CONFIG[application.status]?.icon || AlertCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
                  Application Details
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  View internship application information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleShortlist}
                className={`p-2.5 rounded-lg transition-colors ${
                  application.isShortlisted
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                    : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title={application.isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
              >
                {application.isShortlisted ? (
                  <Star className="w-5 h-5 fill-current" />
                ) : (
                  <StarOff className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-8 ">
        {/* Applicant Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
              {application.fullName?.charAt(0) || '?'}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{application.fullName}</h2>
                {application.isShortlisted && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <Star className="w-3 h-3 fill-current" />
                    Shortlisted
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[application.status]?.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {STATUS_CONFIG[application.status]?.label}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${TYPE_CONFIG[application.internshipType]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {TYPE_CONFIG[application.internshipType]?.label || application.internshipType}
                </span>
                {application.score && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Score: {application.score}/10
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${application.email}`} className="hover:text-orange-500 transition-colors">
                    {application.email}
                  </a>
                </div>
                {application.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>{application.phone}</span>
                  </div>
                )}
                {(application.city || application.country) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{[application.city, application.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {application.status !== 'ACCEPTED' && (
                <motion.button
                  whileHover={{ scale: acceptLoading ? 1 : 1.02 }}
                  whileTap={{ scale: acceptLoading ? 1 : 0.98 }}
                  onClick={handleAccept}
                  disabled={acceptLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {acceptLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Accept
                    </>
                  )}
                </motion.button>
              )}
              {application.status !== 'REJECTED' && (
                <motion.button
                  whileHover={{ scale: rejectLoading ? 1 : 1.02 }}
                  whileTap={{ scale: rejectLoading ? 1 : 0.98 }}
                  onClick={handleReject}
                  disabled={rejectLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {rejectLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" />
                      Reject
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Education & Internship Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-orange-500" />
                Education & Internship Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.institution && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Institution</p>
                    <p className="font-medium text-gray-900">{application.institution}</p>
                  </div>
                )}
                {application.fieldOfStudy && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Field of Study</p>
                    <p className="font-medium text-gray-900">{application.fieldOfStudy}</p>
                  </div>
                )}
                {application.level && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Level</p>
                    <p className="font-medium text-gray-900">{application.level}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Preferred Period</p>
                  <p className="font-medium text-gray-900">{PERIOD_CONFIG[application.period] || application.period || '—'}</p>
                </div>
                {application.preferredStart && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Preferred Start</p>
                    <p className="font-medium text-gray-900">{formatDate(application.preferredStart)}</p>
                  </div>
                )}
                {application.preferredEnd && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Preferred End</p>
                    <p className="font-medium text-gray-900">{formatDate(application.preferredEnd)}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Cover Letter
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {application.coverLetter}
                </div>
              </motion.div>
            )}

            {/* Review Notes */}
            {application.reviewNotes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-orange-500" />
                  Review Notes
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {application.reviewNotes}
                </div>
                {application.reviewedBy && (
                  <p className="text-xs text-gray-500 mt-3">
                    Reviewed by: {application.reviewedBy.adminName || 'Admin'} on {formatDate(application.reviewedAt)}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {application.skills && application.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links & Documents</h3>
              <div className="space-y-3">
                {application.cvUrl && (
                  <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium flex-1">View CV</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium flex-1">Portfolio</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {application.githubUrl && (
                  <a
                    href={application.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span className="font-medium flex-1">GitHub</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {application.linkedinUrl && (
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-sky-50 text-sky-700 rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="font-medium flex-1">LinkedIn</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {!application.cvUrl && !application.portfolioUrl && !application.githubUrl && !application.linkedinUrl && (
                  <p className="text-sm text-gray-500 text-center py-4">No links provided</p>
                )}
              </div>
            </motion.div>

            {/* Application Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Applied On</span>
                  <span className="font-medium text-gray-900">{formatDate(application.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-gray-900">{formatDate(application.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contacted</span>
                  <span className={`font-medium ${application.isContacted ? 'text-green-600' : 'text-gray-400'}`}>
                    {application.isContacted ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipViewPage;
