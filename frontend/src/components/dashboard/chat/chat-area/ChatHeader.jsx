import { useMemo, useState, useRef, useEffect } from 'react';
import { UserPlus, MoreVertical, Users, ArrowLeft, ShieldCheck, ChevronDown, Info, X, Phone, Video, UserMinus, BellOff, Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
import CallButton from '../ui/CallButton';
import useAdminAuth from '../../../../context/AdminAuthContext';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, bb, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

const ChatHeader = ({ conversation, isTyping, onAddMember, onBack, onInfoClick, onRemoveMember, currentUserRole, onCallStart, callState }) => {
    const { user: currentUser } = useAdminAuth();
    const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();
    const [showMembers, setShowMembers] = useState(false);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const headerMenuRef = useRef(null);

    const isGroup = conversation?.isGroup || false;
    const isAdmin = currentUserRole === 'admin';

    const participant = useMemo(() => {
        if (!conversation?.participants || conversation.participants.length === 0) return null;
        if (isGroup) return null;
        return conversation.participants.find(p => !(p.participantId === currentUser?.id && p.participantType === 'ADMIN')) || null;
    }, [conversation?.participants, currentUser, isGroup]);

    const groupMembers = useMemo(() => {
        if (!isGroup || !conversation?.participants) return [];
        return conversation.participants.filter(p => !(p.participantId === currentUser?.id && p.participantType === 'ADMIN'));
    }, [conversation?.participants, currentUser, isGroup]);

    const displayName = isGroup ? conversation?.name : (participant?.name || conversation?.name || 'Unknown');
    const isOnline = !isGroup && (participant?.isOnline || false);
    const lastSeen = participant?.lastSeen;

    const onlineCount = useMemo(() => {
        if (!isGroup) return 0;
        return groupMembers.filter(m => m.isOnline).length;
    }, [groupMembers, isGroup]);

    const getLastSeenText = (lastSeen) => {
        if (!lastSeen) return 'Offline';
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = (now - lastSeenDate) / 60000;
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    const getStatusText = () => {
        if (isTyping) return isGroup ? 'Someone is typing...' : 'is typing...';
        if (isGroup) return `${groupMembers.length + 1} members${onlineCount > 0 ? `, ${onlineCount} online` : ''}`;
        return isOnline ? 'Online' : getLastSeenText(lastSeen);
    };

    // Close header menu when clicking outside
    useEffect(() => {
        if (!showHeaderMenu) return;
        const handleClickOutside = (e) => {
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
                setShowHeaderMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showHeaderMenu]);

    const menuItemStyle = {
        width: '100%',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
        ...ba(13, 500, { color: text2 })
    };

    return (
        <div style={{
            padding: '14px 24px',
            background: bg,
            borderBottom: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                    </button>
                )}

                {/* Clickable avatar/name area → opens info panel */}
                <div
                    onClick={onInfoClick}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: onInfoClick ? 'pointer' : 'default' }}
                >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {isGroup ? (
                            <div style={{
                                width: 44, height: 44, borderRadius: 10, background: bg2,
                                border: `1px solid ${border}`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <Users style={{ width: 20, height: 20, color: ORG }} />
                            </div>
                        ) : (
                            <Avatar
                                avatar={participant?.avatar || conversation?.avatar}
                                initial={participant?.initial || conversation?.initial}
                                name={displayName}
                                online={isOnline}
                                size="lg"
                            />
                        )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <h2 style={{ ...bb(18, { color: textC, margin: 0, letterSpacing: 0.3 }) }}>{displayName}</h2>
                            {isOnline && <ShieldCheck style={{ width: 14, height: 14, color: '#10b981' }} />}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: isOnline || (isGroup && onlineCount > 0) ? '#10b981' : text3,
                            }} />
                            <p style={{ ...ba(12, 400, { color: isTyping ? ORG : text2, margin: 0 }) }}>
                                {getStatusText()}
                            </p>
                            {isGroup && (
                                <motion.button
                                    whileHover={{ color: ORG }}
                                    onClick={(e) => { e.stopPropagation(); setShowMembers(!showMembers); }}
                                    style={{
                                        background: 'none', border: 'none',
                                        ...ba(11, 600, { color: text3, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 })
                                    }}
                                >
                                    <ChevronDown style={{ width: 12, height: 12, transform: showMembers ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
                    <CallButton onCallStart={onCallStart} callState={callState} />
                </div>

                {isGroup && onAddMember && (
                    <motion.button whileHover={{ scale: 1.05, background: bg2 }} whileTap={{ scale: 0.95 }}
                        onClick={onAddMember}
                        style={{
                            background: 'none', border: `1px solid ${border}`, borderRadius: 8, padding: 10,
                            color: text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            ...ba(12, 600)
                        }}>
                        <UserPlus style={{ width: 18, height: 18, color: ORG }} />
                        <span className="hidden md:inline">Add Member</span>
                    </motion.button>
                )}

                <motion.button whileHover={{ scale: 1.05, background: bg2 }} whileTap={{ scale: 0.95 }}
                    onClick={onInfoClick}
                    style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 8, padding: 10, color: text3, cursor: 'pointer' }}>
                    <Info style={{ width: 20, height: 20 }} />
                </motion.button>

                {/* Three-dots header menu */}
                <div style={{ position: 'relative' }} ref={headerMenuRef}>
                    <motion.button
                        whileHover={{ scale: 1.05, background: bg2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowHeaderMenu(prev => !prev)}
                        style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 8, padding: 10, color: text3, cursor: 'pointer' }}
                    >
                        <MoreVertical style={{ width: 20, height: 20 }} />
                    </motion.button>

                    <AnimatePresence>
                        {showHeaderMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                                    background: bg, border: `1px solid ${border}`, borderRadius: 10,
                                    padding: '4px 0', zIndex: 200, minWidth: 180,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden'
                                }}
                            >
                                <button
                                    style={menuItemStyle}
                                    onMouseEnter={e => e.currentTarget.style.background = bg2}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    onClick={() => setShowHeaderMenu(false)}
                                >
                                    <BellOff style={{ width: 15, height: 15 }} />
                                    <span>Mute Notifications</span>
                                </button>
                                {isGroup && (
                                    <button
                                        style={{ ...menuItemStyle, color: '#ef4444' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        onClick={() => setShowHeaderMenu(false)}
                                    >
                                        <Trash2 style={{ width: 15, height: 15 }} />
                                        <span>Leave Group</span>
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Members Popover */}
            <AnimatePresence>
                {isGroup && showMembers && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute', top: '100%', left: 32, marginTop: 12,
                            background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 24,
                            zIndex: 100, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', width: 320,
                            backdropFilter: 'blur(12px)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3 style={{ ...ba(12, 700, { color: text3, textTransform: 'uppercase', margin: 0, letterSpacing: 1.5 }) }}>Group Members</h3>
                            <button onClick={() => setShowMembers(false)} style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer' }}>
                                <X style={{ width: 16, height: 16 }} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 300, overflowY: 'auto' }} className="custom-scrollbar">
                            {/* You */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, background: 'rgba(232,98,26,0.05)' }}>
                                <Avatar size="sm" initial={currentUser?.adminName?.charAt(0)} name="You" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ ...ba(14, 600, { color: textC, margin: 0 }) }}>You</p>
                                    <p style={{ ...ba(11, 400, { color: ORG, margin: 0 }) }}>{isAdmin ? 'Admin' : 'Member'}</p>
                                </div>
                            </div>
                            {/* Others */}
                            {groupMembers.map((member) => (
                                <div key={`${member.participantType}-${member.participantId}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = bg2}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Avatar size="sm" avatar={member.avatar} initial={member.name?.charAt(0)} name={member.name} online={member.isOnline} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ ...ba(14, 500, { color: text2, margin: 0 }) }}>{member.name}</p>
                                        <p style={{ ...ba(11, 400, { color: member.isOnline ? '#10b981' : text3, margin: 0 }) }}>
                                            {member.role === 'admin' ? <span style={{ color: ORG }}>Admin · </span> : null}
                                            {member.isOnline ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                    {/* Remove button — only for group admins removing non-admin members */}
                                    {isAdmin && onRemoveMember && (
                                        <motion.button
                                            whileHover={{ scale: 1.1, color: '#ef4444' }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => {
                                                onRemoveMember(member.participantId, member.participantType);
                                                setShowMembers(false);
                                            }}
                                            title={`Remove ${member.name}`}
                                            style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                        >
                                            <UserMinus style={{ width: 15, height: 15 }} />
                                        </motion.button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatHeader;
