import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    User, Globe, Calendar, Mail, Phone, MapPin, Briefcase,
    FileText, Download, Lock, Loader2, Sparkles, ExternalLink,
    Map as MapIcon, Award, FileCode, CheckCircle2, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminAuthService from '../../../../services/adminAuthService';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

// Helper: format ISO date → "12 Jan 2023"
const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

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

export default function ProfileSettings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();

    const urlTab = searchParams.get('tab');
    const validTabs = ['overview', 'documents'];
    const activeTab = validTabs.includes(urlTab) ? urlTab : 'overview';

    const setActiveTab = (newTab) => {
        setSearchParams({ tab: newTab });
    };

    useEffect(() => {
        if (!searchParams.has('tab')) {
            setSearchParams({ tab: 'overview' });
        }
    }, [searchParams, setSearchParams]);

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

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
                <Loader2 style={{ width: 40, height: 40, color: ORG }} className="animate-spin" />
            </div>
        );
    }

    if (error || !admin) {
        return (
            <div style={{ textAlign: 'center', padding: '64px', background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
                <p style={{ ...ba(18, 600, { color: '#e84040', marginBottom: 8 }) }}>Oops!</p>
                <p style={{ ...ba(14, 400, { color: text2 }) }}>{error || 'Admin not found'}</p>
            </div>
        );
    }

    const documents = [
        admin.cv && { name: 'CV / Resume', file: admin.cv, icon: FileCode, color: '#3b82f6' },
        admin.passport && { name: 'Passport', file: admin.passport, icon: Globe, color: '#10b981' },
        admin.identityCard && { name: 'Identity Card', file: admin.identityCard, icon: Shield, color: '#f59e0b' },
    ].filter(Boolean);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header Section */}
            <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', background: bg2, border: `1px solid ${border}` }}>
                <div style={{ height: 160, background: `linear-gradient(135deg, ${TEAL} 0%, #071418 100%)`, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                </div>
                
                <div style={{ padding: '0 32px 32px', marginTop: -60, position: 'relative' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 24 }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={admin.profileImage || 'https://via.placeholder.com/150'}
                                alt={admin.adminName}
                                style={{ width: 120, height: 120, borderRadius: 4, border: `4px solid ${bg2}`, objectFit: 'cover', background: bg3 }}
                            />
                            {admin.is2FA && (
                                <div style={{ position: 'absolute', bottom: -8, right: -8, background: '#10b981', borderRadius: '50%', padding: 6, border: `3px solid ${bg2}` }}>
                                    <Shield style={{ width: 14, height: 14, color: '#fff' }} />
                                </div>
                            )}
                        </div>

                        <div style={{ flex: 1, paddingBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                <h1 style={{ ...bb(32, { color: ORG, margin: 0, lineHeight: 1 }) }}>{admin.adminName}</h1>
                                <span style={{ ...bc(10, 700, { background: 'rgba(232,98,26,.1)', color: ORG, padding: '2px 8px', borderRadius: 4, letterSpacing: 1, textTransform: 'uppercase' }) }}>
                                    {admin.role || 'Administrator'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...ba(13, 400, { color: text2 }) }}>
                                    <MapPin style={{ width: 14, height: 14, color: TEAL }} />
                                    {admin.location || 'Not Specified'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...ba(13, 400, { color: text2 }) }}>
                                    <Briefcase style={{ width: 14, height: 14, color: TEAL }} />
                                    {admin.experience?.[0]?.jobTitle || 'No Title'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...ba(13, 400, { color: text2 }) }}>
                                    <Calendar style={{ width: 14, height: 14, color: TEAL }} />
                                    Joined {formatDate(admin.joinedDate)}
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admin/dashboard/edit-profile/' + id)}
                            style={{ padding: '10px 24px', ...bc(13, 600, { color: '#fff' }), background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 8 }}
                        >
                            Edit Profile
                        </motion.button>
                    </div>
                </div>

                <div style={{ display: 'flex', padding: '0 32px', borderTop: `1px solid ${border}`, background: bg3 }}>
                    {['overview', 'documents'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            style={{
                                padding: '16px 24px',
                                ...bc(12, 700, { 
                                    textTransform: 'uppercase', 
                                    letterSpacing: 1,
                                    color: activeTab === t ? ORG : text2,
                                    borderBottom: `2px solid ${activeTab === t ? ORG : 'transparent'}`,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                })
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'overview' ? '1fr 2fr' : '1fr', gap: 24 }}>
                {activeTab === 'overview' ? (
                    <>
                        {/* Sidebar Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Profile Completion */}
                            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h3 style={{ ...bc(11, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, margin: 0 }) }}>Profile Completion</h3>
                                    <span style={{ ...bb(20, { color: ORG }) }}>{calculateProfileCompletion(admin)}%</span>
                                </div>
                                <div style={{ height: 6, background: bg3, borderRadius: 3, overflow: 'hidden' }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${calculateProfileCompletion(admin)}%` }}
                                        style={{ height: '100%', background: ORG }} 
                                    />
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24 }}>
                                <h3 style={{ ...bc(11, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 20 }) }}>Contact Details</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        { label: 'Email', value: admin.adminEmail, icon: Mail },
                                        { label: 'Phone', value: admin.phone || '—', icon: Phone },
                                        { label: 'ID Number', value: admin.idNumber || '—', icon: Shield },
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, background: bg3, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <item.icon style={{ width: 14, height: 14, color: TEAL }} />
                                            </div>
                                            <div>
                                                <p style={{ ...ba(10, 600, { color: text3, margin: 0, textTransform: 'uppercase' }) }}>{item.label}</p>
                                                <p style={{ ...ba(13, 500, { color: textC, margin: 0, wordBreak: 'break-all' }) }}>{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 24 }}>
                                <h3 style={{ ...bc(11, 700, { letterSpacing: 2, textTransform: 'uppercase', color: text2, marginBottom: 16 }) }}>Professional Skills</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {admin.skills?.map((skill, i) => (
                                        <span key={i} style={{ ...ba(11, 600, { background: 'rgba(26,92,120,.1)', color: TEAL, padding: '4px 10px', borderRadius: 4 }) }}>
                                            {skill}
                                        </span>
                                    ))}
                                    {(!admin.skills || admin.skills.length === 0) && (
                                        <p style={{ ...ba(12, 400, { color: text3, margin: 0 }) }}>No skills listed</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Bio / About */}
                            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <Sparkles style={{ width: 18, height: 18, color: ORG }} />
                                    <h3 style={{ ...bc(16, 700, { color: textC, margin: 0 }) }}>About Me</h3>
                                </div>
                                <p style={{ ...ba(14, 400, { color: text2, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }) }}>
                                    {admin.bio || 'This admin has not added a bio yet. Update your profile to tell us more about yourself.'}
                                </p>
                            </div>

                            {/* Experience Section */}
                            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                    <Award style={{ width: 18, height: 18, color: ORG }} />
                                    <h3 style={{ ...bc(16, 700, { color: textC, margin: 0 }) }}>Professional Experience</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                    {admin.experience?.map((exp, i) => (
                                        <div key={i} style={{ position: 'relative', paddingLeft: 24, borderLeft: `2px solid ${border}` }}>
                                            <div style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, borderRadius: '50%', background: ORG, border: `2px solid ${bg2}` }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <div>
                                                    <h4 style={{ ...ba(15, 700, { color: textC, margin: 0 }) }}>{exp.jobTitle}</h4>
                                                    <p style={{ ...bc(12, 700, { color: TEAL, margin: 0, textTransform: 'uppercase' }) }}>{exp.companyName}</p>
                                                </div>
                                                <span style={{ ...ba(11, 600, { color: text3, background: bg3, padding: '2px 8px', borderRadius: 4 }) }}>
                                                    {exp.from} — {exp.to || 'Present'}
                                                </span>
                                            </div>
                                            <p style={{ ...ba(13, 400, { color: text2, margin: 0 }) }}>{exp.jobDescription}</p>
                                        </div>
                                    ))}
                                    {(!admin.experience || admin.experience.length === 0) && (
                                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                            <Briefcase style={{ width: 40, height: 40, color: text3, margin: '0 auto 12px', opacity: 0.5 }} />
                                            <p style={{ ...ba(13, 400, { color: text3, margin: 0 }) }}>No experience records added</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Portfolio */}
                            {admin.portifilio && admin.portifilio.length > 0 && (
                                <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 32 }}>
                                    <h3 style={{ ...bc(16, 700, { color: textC, marginBottom: 20 }) }}>Public Links</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                        {admin.portifilio.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 12, 
                                                    padding: 12, 
                                                    background: bg3, 
                                                    border: `1px solid ${border}`, 
                                                    borderRadius: 4,
                                                    textDecoration: 'none',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={{ width: 32, height: 32, background: ORG, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', ...bc(14, 700) }}>
                                                    {link.platform?.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ ...ba(12, 600, { color: textC, margin: 0, textTransform: 'capitalize' }) }}>{link.platform}</p>
                                                    <p style={{ ...ba(10, 400, { color: text3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }) }}>Visit Link</p>
                                                </div>
                                                <ExternalLink style={{ width: 14, height: 14, color: text3 }} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Documents Tab */
                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 32 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ ...bc(16, 700, { color: textC, margin: 0 }) }}>Confidential Documents</h3>
                                <p style={{ ...ba(12, 400, { color: text2, margin: 0 }) }}>Access your uploaded credentials and resumes</p>
                            </div>
                            <button 
                                onClick={() => navigate(`/admin/dashboard/edit-profile/${id}?tabs=files`)}
                                style={{ padding: '8px 16px', ...ba(12, 600, { color: '#fff' }), background: ORG, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                            >
                                Upload Documents
                            </button>
                        </div>

                        {documents.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                {documents.map((doc, i) => (
                                    <div
                                        key={i}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 16, 
                                            padding: 16, 
                                            background: bg3, 
                                            border: `1px solid ${border}`, 
                                            borderRadius: 4 
                                        }}
                                    >
                                        <div style={{ width: 48, height: 48, background: `${doc.color}15`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <doc.icon style={{ width: 20, height: 20, color: doc.color }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ ...ba(14, 600, { color: textC, margin: 0 }) }}>{doc.name}</h4>
                                            <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }}>Verified Credential</p>
                                        </div>
                                        <a
                                            href={doc.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ padding: 8, background: bg2, border: `1px solid ${border}`, borderRadius: 4, color: text2, display: 'flex' }}
                                        >
                                            <Download style={{ width: 16, height: 16 }} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '64px 0', background: bg3, border: `1px dashed ${border}`, borderRadius: 4 }}>
                                <FileText style={{ width: 48, height: 48, color: text3, margin: '0 auto 16px', opacity: 0.5 }} />
                                <h4 style={{ ...bc(14, 700, { color: textC, margin: '0 0 4px' }) }}>No Documents Found</h4>
                                <p style={{ ...ba(12, 400, { color: text3, margin: 0 }) }}>You haven't uploaded any documents yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}