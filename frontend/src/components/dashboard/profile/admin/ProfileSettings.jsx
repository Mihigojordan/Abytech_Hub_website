// AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams, // ← NEW: for tab in URL
} from 'react-router-dom';
import {
  User, Globe, Calendar, Mail, Phone, MapPin, Briefcase,
  FileText, Download, Lock, Loader2
} from 'lucide-react';
import adminAuthService from '../../../../services/adminAuthService';

// Helper: format ISO date → "12 Jan 2023"
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/* --------------------------------------------------------------
   PROFILE COMPLETION CALCULATOR
   -------------------------------------------------------------- */
const calculateProfileCompletion = (admin) => {
  const fields = [
    admin.adminName,
    admin.adminEmail,
    admin.phone,
    admin.location,
    admin.profileImage,
    admin.bio,
    admin.joinedDate,
    admin.skills?.length,
    admin.portifilio?.length,
    admin.experience?.length,
    admin.cv,
    admin.passport,
    admin.identityCard,
  ];

  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ——————————————————————————————————————————————————————————————
  // TAB MANAGEMENT: Keep tab in URL (?tab=overview|documents)
  // ——————————————————————————————————————————————————————————————
  const urlTab = searchParams.get('tab');
  const validTabs = ['overview', 'documents'];
  const activeTab = validTabs.includes(urlTab) ? urlTab : 'overview';

  const setActiveTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Ensure a tab is always present in the URL
  useEffect(() => {
    if (!searchParams.has('tab')) {
      setSearchParams({ tab: 'overview' });
    }
  }, [searchParams, setSearchParams]);

  // ——————————————————————————————————————————————————————————————
  // FETCH ADMIN DATA
  // ——————————————————————————————————————————————————————————————
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminAuthService.findAdminById(id);
        setAdmin(data);
      } catch (err) {
        setError(err.message || 'Failed to load admin');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAdmin();
  }, [id]);

  // ——————————————————————————————————————————————————————————————
  // LOADING & ERROR STATES
  // ——————————————————————————————————————————————————————————————
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-[rgb(81,96,146)]" />
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-1">Oops!</p>
          <p className="text-sm text-gray-600">{error || 'Admin not found'}</p>
        </div>
      </div>
    );
  }

  // ——————————————————————————————————————————————————————————————
  // PREPARE DOCUMENTS ARRAY
  // ——————————————————————————————————————————————————————————————
  const documents = [
    admin.cv && {
      name: 'CV / Resume',
      file: admin.cv,
      size: '—',
      uploadDate: admin.updatedAt,
    },
    admin.passport && {
      name: 'Passport',
      file: admin.passport,
      size: '—',
      uploadDate: admin.updatedAt,
    },
    admin.identityCard && {
      name: 'Identity Card',
      file: admin.identityCard,
      size: '—',
      uploadDate: admin.updatedAt,
    },
  ].filter(Boolean);

  // ——————————————————————————————————————————————————————————————
  // RENDER
  // ——————————————————————————————————————————————————————————————
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="relative rounded-t-xl overflow-hidden h-46 pb-4">
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
            <div className="flex items-center justify-between w-full">
              <div className="flex items-end gap-4">
                <div className="relative mb-[-32px]">
                  <img
                    src={admin.profileImage || 'https://via.placeholder.com/150'}
                    alt={admin.adminName}
                    className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  {admin.is2FA && (
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white">
                      <Lock className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-0.5">{admin.adminName}</h1>
                  <p className="text-white/90 text-sm mb-1.5">Owner & Founder</p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{admin.location || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{admin.experience?.[0]?.companyName || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b flex gap-1 px-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-[rgb(81,96,146)] border-b-2 border-[rgb(81,96,146)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-[rgb(81,96,146)] border-b-2 border-[rgb(81,96,146)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/edit-profile/' + id)}
            className="ml-auto px-5 py-2 my-1.5 bg-[rgb(81,96,146)] text-white rounded-lg hover:bg-[rgb(71,86,136)] transition-colors text-sm font-medium"
          >
            Edit Profile
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Left Sidebar */}
            <div className="space-y-4">
              {/* Profile Completion */}
              {admin && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Complete Your Profile
                  </h3>

                  {(() => {
                    const pct = calculateProfileCompletion(admin);
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-semibold inline-block py-0.5 px-2 uppercase rounded-full
                              ${pct === 100 ? 'text-[rgb(81,96,146)] bg-[rgb(81,96,146)]/10' :
                                pct >= 70 ? 'text-[rgb(81,96,146)] bg-[rgb(81,96,146)]/10' :
                                'text-amber-600 bg-amber-100'}`}
                          >
                            {pct}%
                          </span>
                        </div>

                        <div className="overflow-hidden h-1.5 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`shadow-none flex flex-col justify-center text-center whitespace-nowrap text-white
                              ${pct === 100 ? 'bg-[rgb(81,96,146)]' :
                                pct >= 70 ? 'bg-[rgb(81,96,146)]' :
                                'bg-gradient-to-r from-amber-500 to-orange-500'}`}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">Full Name :</label>
                    <p className="text-sm text-gray-900 font-medium">{admin.adminName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Mobile :</label>
                    <p className="text-sm text-gray-900 font-medium">{admin.phone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">E-mail :</label>
                    <p className="text-sm text-gray-900 font-medium">{admin.adminEmail}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Identity-card Number :</label>
                    <p className="text-sm text-gray-900 font-medium">{admin.idNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Location :</label>
                    <p className="text-sm text-gray-900 font-medium">{admin.location || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Joining Date :</label>
                    <p className="text-sm text-gray-900 font-medium">
                      {admin.joinedDate ? formatDate(admin.joinedDate) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              {admin.portifilio && admin.portifilio.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Portfolio</h3>
                  <div className="flex gap-2">
                    {admin.portifilio.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.color || 'bg-[rgb(81,96,146)]'} w-9 h-9 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity text-sm font-medium`}
                      >
                        <p className="capitalize">{link?.platform?.trim()?.slice(0, 1)}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {admin.skills && admin.skills.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {admin.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[rgb(81,96,146)]/10 text-[rgb(81,96,146)] rounded-md text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="space-y-5">
                  {/* About */}
                  {admin.bio && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">About</h3>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {admin.bio}
                      </p>
                    </div>
                  )}

                  {/* Designation & Website */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 bg-[rgb(81,96,146)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[rgb(81,96,146)]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Designation :</p>
                        <p className="text-sm font-medium text-gray-900">
                          {admin.experience?.[0]?.jobTitle || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 bg-[rgb(81,96,146)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-[rgb(81,96,146)]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Website :</p>
                        <a
                          href="https://www.abytechub.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[rgb(81,96,146)] hover:underline"
                        >
                          www.abytechub.com
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  {admin.experience && admin.experience.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3">
                        Experience
                      </h3>
                      <div className="space-y-3">
                        {admin.experience.map((exp, i) => (
                          <div key={i} className="border-l-2 border-[rgb(81,96,146)]/30 pl-3 py-1.5">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-sm font-semibold text-gray-900">{exp.jobTitle}</h4>
                              <span className="text-xs text-gray-500">
                                {exp.from} - {exp.to}
                              </span>
                            </div>
                            <p className="text-[rgb(81,96,146)] text-sm font-medium mb-0.5">{exp.companyName}</p>
                            <p className="text-gray-600 text-xs">{exp.jobDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Documents Tab */
          <div className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Uploaded Documents</h3>
                <button 
                onClick={()=> navigate(`/admin/dashboard/edit-profile/${id}?tabs=files`)}
                className="px-4 py-2 bg-[rgb(81,96,146)] text-white rounded-lg hover:bg-[rgb(71,86,136)] transition-colors text-sm font-medium">
                  Upload New
                </button>
              </div>

              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[rgb(81,96,146)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{doc.name}</h4>
                          <p className="text-xs text-gray-500">
                            {doc.size} • Uploaded on {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-[rgb(81,96,146)] hover:bg-[rgb(81,96,146)]/10 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}