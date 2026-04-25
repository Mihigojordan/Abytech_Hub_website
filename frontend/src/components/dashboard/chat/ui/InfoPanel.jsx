import { useMemo } from 'react';
import { X, Users, Image as ImageIcon, FileText, Download } from 'lucide-react';
import Avatar from './Avatar';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../../../api/api';

/**
 * InfoPanel — slide-in right panel showing contact/group info and shared media.
 * Triggered by clicking the info icon or conversation name in ChatHeader.
 */
const InfoPanel = ({ isOpen, conversation, messages = [], onClose }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    const isGroup = conversation?.isGroup || false;

    // Collect all shared images from loaded messages
    const sharedImages = useMemo(() => {
        const imgs = [];
        messages.forEach(msg => {
            if (msg.images && msg.images.length > 0) {
                msg.images.forEach(img => {
                    const url = typeof img === 'string' ? img : img.imageUrl;
                    if (url) imgs.push({ url, timestamp: msg.timestamp });
                });
            }
        });
        return imgs.reverse();
    }, [messages]);

    // Collect all shared files
    const sharedDocs = useMemo(() => {
        const docs = [];
        messages.forEach(msg => {
            if (msg.files && msg.files.length > 0) {
                msg.files.forEach(f => docs.push({ ...f, timestamp: msg.timestamp }));
            }
        });
        return docs.reverse();
    }, [messages]);

    const formatFileSize = (size) => {
        if (!size) return '';
        if (typeof size === 'string') return size;
        if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
        if (size >= 1024) return (size / 1024).toFixed(1) + ' KB';
        return size + ' B';
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
    };

    const participant = useMemo(() => {
        if (isGroup || !conversation?.participants) return null;
        return conversation.participants.find(p => p.participantType !== 'ADMIN' || p.participantId !== conversation?.createdBy)
            || conversation.participants[0];
    }, [conversation, isGroup]);

    const groupMembers = useMemo(() => {
        if (!isGroup || !conversation?.participants) return [];
        return conversation.participants;
    }, [conversation, isGroup]);

    const SectionTitle = ({ icon: Icon, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 12px', padding: '0 4px' }}>
            <Icon style={{ width: 14, height: 14, color: ORG }} />
            <span style={{ ...bc(11, 700, { color: text3, textTransform: 'uppercase', letterSpacing: 1.2 }) }}>{label}</span>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute', inset: 0, zIndex: 40,
                            background: 'rgba(0,0,0,0.2)'
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        style={{
                            position: 'absolute', top: 0, right: 0, bottom: 0,
                            width: 320, background: bg, borderLeft: `1px solid ${border}`,
                            zIndex: 50, display: 'flex', flexDirection: 'column',
                            boxShadow: '-20px 0 50px rgba(0,0,0,0.15)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', borderBottom: `1px solid ${border}`
                        }}>
                            <h3 style={{ ...bb(16, { color: textC, margin: 0 }) }}>
                                {isGroup ? 'Group Info' : 'Contact Info'}
                            </h3>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4, display: 'flex' }}
                            >
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="custom-scrollbar">

                            {/* Hero section */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
                                {isGroup ? (
                                    <div style={{
                                        width: 80, height: 80, borderRadius: 16, background: bg2,
                                        border: `1px solid ${border}`, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', marginBottom: 16
                                    }}>
                                        <Users style={{ width: 36, height: 36, color: ORG }} />
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: 16 }}>
                                        <Avatar
                                            avatar={participant?.avatar || conversation?.avatar}
                                            initial={participant?.initial || conversation?.initial}
                                            name={conversation?.name}
                                            online={participant?.isOnline}
                                            size="xl"
                                        />
                                    </div>
                                )}

                                <h2 style={{ ...bb(20, { color: textC, margin: '0 0 4px', textAlign: 'center' }) }}>
                                    {conversation?.name}
                                </h2>

                                {isGroup ? (
                                    <p style={{ ...ba(13, 400, { color: text2, margin: 0 }) }}>
                                        {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: participant?.isOnline ? '#10b981' : text3
                                        }} />
                                        <p style={{ ...ba(13, 400, { color: participant?.isOnline ? '#10b981' : text2, margin: 0 }) }}>
                                            {participant?.isOnline ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Group Members */}
                            {isGroup && groupMembers.length > 0 && (
                                <>
                                    <SectionTitle icon={Users} label="Members" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {groupMembers.map((member, i) => (
                                            <div key={`${member.participantType}-${member.participantId}-${i}`}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '8px 10px', borderRadius: 8, background: 'transparent',
                                                    transition: 'background 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = bg2}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Avatar
                                                    avatar={member.avatar}
                                                    initial={member.name?.charAt(0)}
                                                    name={member.name}
                                                    online={member.isOnline}
                                                    size="sm"
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ ...ba(13, 500, { color: textC, margin: 0 }) }} className="truncate">
                                                        {member.name}
                                                    </p>
                                                    <p style={{ ...ba(11, 400, { color: member.isOnline ? '#10b981' : text3, margin: 0 }) }}>
                                                        {member.role === 'admin' ? <span style={{ color: ORG }}>Admin · </span> : null}
                                                        {member.isOnline ? 'Online' : 'Offline'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Shared Images */}
                            {sharedImages.length > 0 && (
                                <>
                                    <SectionTitle icon={ImageIcon} label={`Media (${sharedImages.length})`} />
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: 4, borderRadius: 8, overflow: 'hidden'
                                    }}>
                                        {sharedImages.slice(0, 9).map((img, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    aspectRatio: '1', overflow: 'hidden',
                                                    background: bg2, borderRadius: 4, cursor: 'pointer'
                                                }}
                                            >
                                                <img
                                                    src={getImageUrl(img.url)}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {sharedImages.length > 9 && (
                                        <p style={{ ...ba(12, 400, { color: ORG, margin: '8px 0 0', textAlign: 'center', cursor: 'pointer' }) }}>
                                            +{sharedImages.length - 9} more
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Shared Documents */}
                            {sharedDocs.length > 0 && (
                                <>
                                    <SectionTitle icon={FileText} label={`Documents (${sharedDocs.length})`} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {sharedDocs.slice(0, 10).map((doc, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '10px 12px', background: bg2,
                                                    border: `1px solid ${border}`, borderRadius: 8
                                                }}
                                            >
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 8, background: bg3,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>
                                                    <FileText style={{ width: 16, height: 16, color: ORG }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ ...ba(13, 500, { color: textC, margin: 0 }) }} className="truncate">
                                                        {doc.fileName || 'Document'}
                                                    </p>
                                                    <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }}>
                                                        {formatFileSize(doc.fileSize)}
                                                    </p>
                                                </div>
                                                {doc.fileUrl && (
                                                    <a
                                                        href={getImageUrl(doc.fileUrl)}
                                                        download={doc.fileName}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ color: text3, display: 'flex' }}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <Download style={{ width: 15, height: 15 }} />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {sharedImages.length === 0 && sharedDocs.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <p style={{ ...ba(13, 400, { color: text3, margin: 0 }) }}>No shared media yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default InfoPanel;
