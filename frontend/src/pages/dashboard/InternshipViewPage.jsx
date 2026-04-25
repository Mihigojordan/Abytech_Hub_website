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
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    icon: Clock },
  REVIEWING:  { label: 'Reviewing', icon: AlertCircle },
  ACCEPTED:   { label: 'Accepted',  icon: CheckCircle },
  REJECTED:   { label: 'Rejected',  icon: XCircle },
  WAITLISTED: { label: 'Waitlisted',icon: AlertCircle },
};

const TYPE_CONFIG = {
  SOFTWARE_DEVELOPMENT: { label: 'Software Development' },
  UI_UX:                { label: 'UI/UX Design' },
  DATA:                 { label: 'Data' },
  MARKETING:            { label: 'Marketing' },
  IT_SUPPORT:           { label: 'IT Support' },
  OTHER:                { label: 'Other' },
};

const PERIOD_CONFIG = {
  ONE_MONTH:    '1 Month',
  THREE_MONTHS: '3 Months',
  SIX_MONTHS:   '6 Months',
  ONE_YEAR:     '1 Year',
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return { background: 'rgba(74,222,128,.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)' };
    case 'REJECTED':
      return { background: 'rgba(232,64,64,.15)', color: '#e84040', border: '1px solid rgba(232,64,64,.3)' };
    case 'PENDING':
      return { background: `rgba(232,98,26,.15)`, color: ORG, border: `1px solid rgba(232,98,26,.3)` };
    case 'REVIEWING':
    case 'IN_PROGRESS':
      return { background: 'rgba(26,92,120,.15)', color: TEAL, border: '1px solid rgba(26,92,120,.3)' };
    default:
      return { background: 'rgba(232,98,26,.15)', color: ORG, border: `1px solid rgba(232,98,26,.3)` };
  }
};

const InternshipViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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
          confirmButtonColor: ORG,
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
        confirmButtonColor: ORG,
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
          confirmButtonColor: ORG,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to accept intern',
          confirmButtonColor: ORG,
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
      confirmButtonColor: '#e84040',
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
          confirmButtonColor: ORG,
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to reject application',
          confirmButtonColor: ORG,
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
        style={{ background: bg }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-4"
            style={{ borderColor: border, borderTopColor: ORG }}
          />
          <p className="mt-4 font-medium" style={{ ...ba(14, 500, { color: text2 }) }}>
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const StatusIcon = STATUS_CONFIG[application.status]?.icon || AlertCircle;
  const statusStyle = getStatusStyle(application.status);

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <div style={{ background: bg2, borderBottom: '1px solid ' + border }}>
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 rounded-lg transition-opacity hover:opacity-80"
                style={{ background: bg3, border: '1px solid ' + border, color: textC }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1
                  className="text-xl sm:text-2xl"
                  style={{ ...bb('clamp(20px,3vw,32px)', { color: ORG, letterSpacing: 2 }) }}
                >
                  Application Details
                </h1>
                <p style={{ ...ba(12, 400, { color: text2, marginTop: 2 }) }}>
                  View internship application information
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleShortlist}
                className="p-2.5 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: application.isShortlisted ? 'rgba(232,98,26,.15)' : bg3,
                  border: '1px solid ' + (application.isShortlisted ? 'rgba(232,98,26,.3)' : border),
                  color: application.isShortlisted ? ORG : text2,
                }}
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

      <div className="mx-auto px-4 sm:px-6 py-8">
        {/* Applicant Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-6"
          style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{ background: ORG, color: '#fff', borderRadius: 4 }}
            >
              {application.fullName?.charAt(0) || '?'}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 style={{ ...ba(22, 700, { color: textC, margin: 0 }) }}>
                  {application.fullName}
                </h2>
                {application.isShortlisted && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1"
                    style={{
                      ...ba(11, 600, { color: ORG }),
                      background: 'rgba(232,98,26,.15)',
                      border: '1px solid rgba(232,98,26,.3)',
                      borderRadius: 4,
                    }}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    Shortlisted
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {/* Status badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1"
                  style={{ ...ba(11, 600, { ...statusStyle, borderRadius: 4 }) }}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {STATUS_CONFIG[application.status]?.label}
                </span>
                {/* Type badge */}
                <span
                  className="inline-flex px-3 py-1"
                  style={{
                    ...ba(11, 600, { color: TEAL }),
                    background: 'rgba(26,92,120,.15)',
                    border: '1px solid rgba(26,92,120,.3)',
                    borderRadius: 4,
                  }}
                >
                  {TYPE_CONFIG[application.internshipType]?.label || application.internshipType}
                </span>
                {application.score && (
                  <span
                    className="inline-flex px-3 py-1"
                    style={{
                      ...ba(11, 600, { color: text2 }),
                      background: bg3,
                      border: '1px solid ' + border,
                      borderRadius: 4,
                    }}
                  >
                    Score: {application.score}/10
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5" style={{ ...ba(13, 400, { color: text2 }) }}>
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${application.email}`}
                    className="transition-opacity hover:opacity-80"
                    style={{ color: ORG }}
                  >
                    {application.email}
                  </a>
                </div>
                {application.phone && (
                  <div className="flex items-center gap-1.5" style={{ ...ba(13, 400, { color: text2 }) }}>
                    <Phone className="w-4 h-4" />
                    <span>{application.phone}</span>
                  </div>
                )}
                {(application.city || application.country) && (
                  <div className="flex items-center gap-1.5" style={{ ...ba(13, 400, { color: text2 }) }}>
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    ...ba(13, 600, { color: '#fff' }),
                    background: '#4ade80',
                    border: 'none',
                    borderRadius: 4,
                  }}
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    ...ba(13, 600, { color: '#fff' }),
                    background: '#e84040',
                    border: 'none',
                    borderRadius: 4,
                  }}
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
              className="p-6"
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
            >
              <h3
                className="mb-4 flex items-center gap-2"
                style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }), borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }}
              >
                <GraduationCap className="w-4 h-4" style={{ color: ORG }} />
                Education &amp; Internship Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.institution && (
                  <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                    <p style={{ ...ba(12, 400, { color: text2, marginBottom: 4 }) }}>Institution</p>
                    <p style={{ ...ba(13, 600, { color: textC } )} }>{ application.institution}</p>
                  </div>
                )}
                {application.fieldOfStudy && (
                  <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                    <p style={{ ...ba(12, 400, { color: text2, marginBottom: 4 }) }}>Field of Study</p>
                    <p style={{ ...ba(13, 600, { color: textC }) }}>{application.fieldOfStudy}</p>
                  </div>
                )}
                {application.level && (
                  <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                    <p style={{ ...ba(12, 400, { color: text2, marginBottom: 4 }) }}>Level</p>
                    <p style={{ ...ba(13, 600, { color: textC }) }}>{application.level}</p>
                  </div>
                )}
                <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                  <p style={{ ...ba(12, 400, { color: text2, marginBottom: 4 }) }}>Preferred Period</p>
                  <p style={{ ...ba(13, 600, { color: textC }) }}>{PERIOD_CONFIG[application.period] || application.period || '—'}</p>
                </div>
                {application.preferredStart && (
                  <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                    <p style={{ ...ba(12, 400, { color: text2, marginBottom: 4 }) }}>Preferred Start</p>
                    <p style={{ ...ba(13, 600, { color: textC }) }}>{formatDate(application.preferredStart)}</p>
                  </div>
                )}
                {application.preferredEnd && (
                  <div className="p-4" style={{ background: bg3, borderRadius: 4 }}>
                    <p style={{ ...ba(12, 400, { color: text2, marginBottom: 4 }) }}>Preferred End</p>
                    <p style={{ ...ba(13, 600, { color: textC }) }}>{formatDate(application.preferredEnd)}</p>
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
                className="p-6"
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
              >
                <h3
                  className="mb-4 flex items-center gap-2"
                  style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }), borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }}
                >
                  <FileText className="w-4 h-4" style={{ color: ORG }} />
                  Cover Letter
                </h3>
                <div
                  className="whitespace-pre-wrap leading-relaxed p-5"
                  style={{ ...ba(14, 400, { color: textC }), background: bg3, borderRadius: 4 }}
                >
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
                className="p-6"
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
              >
                <h3
                  className="mb-4 flex items-center gap-2"
                  style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }), borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }}
                >
                  <Edit className="w-4 h-4" style={{ color: ORG }} />
                  Review Notes
                </h3>
                <div
                  className="whitespace-pre-wrap leading-relaxed p-5"
                  style={{
                    ...ba(14, 400, { color: textC }),
                    background: 'rgba(26,92,120,.08)',
                    border: '1px solid rgba(26,92,120,.2)',
                    borderRadius: 4,
                  }}
                >
                  {application.reviewNotes}
                </div>
                {application.reviewedBy && (
                  <p className="mt-3" style={{ ...ba(11, 400, { color: text2 }) }}>
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
                className="p-6"
                style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
              >
                <h3
                  className="mb-4"
                  style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }), borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }}
                >
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5"
                      style={{
                        ...ba(11, 600, { color: ORG }),
                        background: 'rgba(232,98,26,.1)',
                        border: '1px solid rgba(232,98,26,.25)',
                        borderRadius: 4,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Links & Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6"
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
            >
              <h3
                className="mb-4"
                style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }), borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }}
              >
                Links &amp; Documents
              </h3>
              <div className="space-y-3">
                {application.cvUrl && (
                  <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-opacity hover:opacity-80"
                    style={{
                      ...ba(13, 600, { color: TEAL }),
                      background: 'rgba(26,92,120,.1)',
                      border: '1px solid rgba(26,92,120,.2)',
                      borderRadius: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="flex-1">View CV</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-opacity hover:opacity-80"
                    style={{
                      ...ba(13, 600, { color: ORG }),
                      background: 'rgba(232,98,26,.1)',
                      border: '1px solid rgba(232,98,26,.2)',
                      borderRadius: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="flex-1">Portfolio</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {application.githubUrl && (
                  <a
                    href={application.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-opacity hover:opacity-80"
                    style={{
                      ...ba(13, 600, { color: textC }),
                      background: bg3,
                      border: '1px solid ' + border,
                      borderRadius: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <Github className="w-5 h-5" />
                    <span className="flex-1">GitHub</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {application.linkedinUrl && (
                  <a
                    href={application.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 transition-opacity hover:opacity-80"
                    style={{
                      ...ba(13, 600, { color: TEAL }),
                      background: 'rgba(26,92,120,.1)',
                      border: '1px solid rgba(26,92,120,.2)',
                      borderRadius: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <Linkedin className="w-5 h-5" />
                    <span className="flex-1">LinkedIn</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {!application.cvUrl && !application.portfolioUrl && !application.githubUrl && !application.linkedinUrl && (
                  <p className="text-center py-4" style={{ ...ba(13, 400, { color: text2 }) }}>
                    No links provided
                  </p>
                )}
              </div>
            </motion.div>

            {/* Application Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="p-6"
              style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
            >
              <h3
                className="mb-4"
                style={{ ...bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 }), borderLeft: `3px solid ${ORG}`, paddingLeft: 10 }}
              >
                Application Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ ...ba(12, 400, { color: text2 }) }}>Applied On</span>
                  <span style={{ ...ba(13, 600, { color: textC }) }}>{formatDate(application.createdAt)}</span>
                </div>
                <div className="flex justify-between" style={{ borderTop: '1px solid ' + border, paddingTop: 10 }}>
                  <span style={{ ...ba(12, 400, { color: text2 }) }}>Last Updated</span>
                  <span style={{ ...ba(13, 600, { color: textC }) }}>{formatDate(application.updatedAt)}</span>
                </div>
                <div className="flex justify-between" style={{ borderTop: '1px solid ' + border, paddingTop: 10 }}>
                  <span style={{ ...ba(12, 400, { color: text2 }) }}>Contacted</span>
                  <span style={{ ...ba(13, 600, { color: application.isContacted ? '#4ade80' : text2 }) }}>
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
