// AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  User, Globe, Calendar, Mail, Phone, MapPin, Briefcase,
  FileText, Download, Lock, Loader2
} from 'lucide-react';
import adminAuthService from '../services/adminAuthService'; // adjust path if needed

// Helper: format ISO date → "12 Jan 2023"
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function AdminProfile() {
  const { id } = useParams();                     // <-- id from URL
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // -------------------------------------------------
  // Fetch admin when component mounts or id changes
  // -------------------------------------------------
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

  // -------------------------------------------------
  // Loading UI
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // -------------------------------------------------
  // Error UI
  // -------------------------------------------------
  if (error || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-2">Oops!</p>
          <p className="text-gray-700">{error || 'Admin not found'}</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------
  // Build documents array from model fields
  // -------------------------------------------------
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

  // -------------------------------------------------
  // Render UI (same design as your mock)
  // -------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="relative rounded-t-2xl overflow-hidden h-64">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1762422411505-c0cae1fb103c?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80" />
          </div>

          <div className="relative h-full flex items-end p-8">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-end gap-6">
                <div className="relative mb-[-40px]">
                  <img
                    src={admin.profileImage || 'https://via.placeholder.com/150'}
                    alt={admin.adminName}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                  {admin.is2FA && (
                    <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-2 border-2 border-white">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-white mb-4">
                  <h1 className="text-3xl font-bold mb-1">{admin.adminName}</h1>
                  <p className="text-blue-100 mb-2">Owner & Founder</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{admin.location || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{admin.experience?.[0]?.companyName || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

             
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b flex gap-1 px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Documents
          </button>
          <button 
          onClick={()=> navigate('/admin/dashboard/edit-profile')}
          className="ml-auto px-6 py-2 my-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium">
            Edit Profile
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="grid grid-cols-3 gap-6 mt-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion (static 90% for demo) */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Complete Your Profile</h3>
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      90%
                    </span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: '90%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Full Name :</label>
                    <p className="text-gray-900 font-medium">{admin.adminName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Mobile :</label>
                    <p className="text-gray-900 font-medium">{admin.phone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">E-mail :</label>
                    <p className="text-gray-900 font-medium">{admin.adminEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Location :</label>
                    <p className="text-gray-900 font-medium">{admin.location || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Joining Date :</label>
                    <p className="text-gray-900 font-medium">
                      {admin.joinedDate ? formatDate(admin.joinedDate) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio */}
              {admin.portifilio && admin.portifilio.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Portfolio</h3>
                  <div className="flex gap-3">
                    {admin.portifilio.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${link.color || 'bg-gray-700'} w-10 h-10 rounded-lg flex items-center justify-center text-white hover:opacity-80 transition-opacity`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {admin.skills && admin.skills.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {admin.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-6">
                  {/* About */}
                  {admin.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {admin.bio}
                      </p>
                    </div>
                  )}

                  {/* Designation & Website */}
                  <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Designation :</p>
                        <p className="font-medium text-gray-900">
                          {admin.experience?.[0]?.jobTitle || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Website :</p>
                        <a
                          href="https://www.velzon.com"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          www.velzon.com
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  {admin.experience && admin.experience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {admin.experience.map((exp, i) => (
                          <div key={i} className="border-l-2 border-blue-200 pl-4 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{exp.jobTitle}</h4>
                              <span className="text-sm text-gray-500">
                                {exp.from} - {exp.to}
                              </span>
                            </div>
                            <p className="text-blue-600 font-medium mb-1">{exp.companyName}</p>
                            <p className="text-gray-600 text-sm">{exp.jobDescription}</p>
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
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Upload New
                </button>
              </div>

              {documents.length > 0 ? (
                documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-500">
                          {doc.size} • Uploaded on {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}