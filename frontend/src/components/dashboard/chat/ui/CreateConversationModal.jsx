import { useState, useEffect, useMemo } from 'react';
import { X, MessageSquare, Search, Users, Check, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import adminAuthService from '../../../../services/adminAuthService';
import chatService from '../../../../services/chatService';
import useAdminAuth from '../../../../context/AdminAuthContext';
import api from '../../../../api/api';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, bb, ba, bc } from '../../../../utils/homeConstants';

const CreateConversationModal = ({ isOpen, onClose, onConversationCreated }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [creating, setCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('admins');
    const { user: currentAdmin } = useAdminAuth();

    useEffect(() => {
        if (isOpen) {
            fetchParticipants();
            setSelectedParticipants([]);
            setGroupName('');
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const [adminsResponse, usersResponse] = await Promise.all([
                adminAuthService.getAllAdmins(),
                api.get('/user-auth/users').then(res => res.data).catch(() => [])
            ]);
            setAdmins((adminsResponse || []).filter(a => a.id !== currentAdmin?.id));
            setUsers(usersResponse || []);
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const isGroup = selectedParticipants.length > 1;

    const filteredAdmins = useMemo(() =>
        admins.filter(a =>
            a.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
        ), [admins, searchQuery]);

    const filteredUsers = useMemo(() =>
        users.filter(u =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ), [users, searchQuery]);

    const toggleParticipant = (participant, type) => {
        const key = `${type}-${participant.id}`;
        const isSelected = selectedParticipants.some(p => p.key === key);
        if (isSelected) {
            setSelectedParticipants(prev => prev.filter(p => p.key !== key));
        } else {
            setSelectedParticipants(prev => [...prev, {
                key,
                id: participant.id,
                type,
                name: type === 'ADMIN' ? participant.adminName : participant.name,
                avatar: type === 'ADMIN' ? participant.profileImage : participant.avatar,
                email: type === 'ADMIN' ? participant.adminEmail : participant.email,
            }]);
        }
    };

    const isParticipantSelected = (id, type) =>
        selectedParticipants.some(p => p.id === id && p.type === type);

    const handleCreate = async () => {
        if (selectedParticipants.length === 0) return;
        if (isGroup && !groupName.trim()) {
            alert('Please enter a group name');
            return;
        }
        try {
            setCreating(true);
            const participantIds = [currentAdmin.id, ...selectedParticipants.map(p => p.id)];
            const participantTypes = ['ADMIN', ...selectedParticipants.map(p => p.type)];
            const name = isGroup ? groupName.trim() : selectedParticipants[0].name;
            const conversation = await chatService.createConversation({ participantIds, participantTypes, isGroup, name });
            onConversationCreated(conversation);
            onClose();
        } catch (error) {
            console.error('Failed to create conversation:', error);
            alert('Failed to create conversation. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        background: bg3, border: `1px solid ${border}`, borderRadius: 8,
        padding: '9px 12px', color: textC, outline: 'none',
        ...ba(14, 400),
    };

    const tabStyle = (active) => ({
        flex: 1, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
        borderBottom: active ? `2px solid ${ORG}` : '2px solid transparent',
        color: active ? ORG : text3,
        ...bc(13, 600),
        transition: 'color 0.15s',
    });

    const canCreate = selectedParticipants.length > 0 && (!isGroup || groupName.trim());

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(7,20,24,0.75)', backdropFilter: 'blur(4px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        style={{
                            position: 'relative', zIndex: 1,
                            background: bg, border: `1px solid ${border}`,
                            borderRadius: 16, width: '100%', maxWidth: 480,
                            maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header gradient strip */}
                        <div style={{ height: 3, background: `linear-gradient(90deg, ${ORG}, #6366f1)` }} />

                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', borderBottom: `1px solid ${border}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 8, background: bg2,
                                    border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {isGroup
                                        ? <Users style={{ width: 16, height: 16, color: ORG }} />
                                        : <MessageSquare style={{ width: 16, height: 16, color: ORG }} />}
                                </div>
                                <h2 style={{ ...bb(16, { color: textC, margin: 0 }) }}>
                                    {isGroup ? 'Create Group' : 'New Conversation'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 6 }}
                            >
                                <X style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        {/* Group Name Input */}
                        {isGroup && (
                            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, background: bg2 }}>
                                <label style={{ ...bc(11, 700, { color: text3, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }) }}>
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter group name..."
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    style={inputStyle}
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Selected Chips */}
                        {selectedParticipants.length > 0 && (
                            <div style={{ padding: '10px 20px', borderBottom: `1px solid ${border}`, background: bg2 }}>
                                <p style={{ ...ba(11, 400, { color: text3, margin: '0 0 8px' }) }}>
                                    {selectedParticipants.length} selected
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {selectedParticipants.map(p => (
                                        <div key={p.key} style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '4px 10px 4px 6px', background: bg3,
                                            border: `1px solid ${border}`, borderRadius: 20,
                                        }}>
                                            <Avatar avatar={p.avatar} name={p.name} initial={p.name?.charAt(0)} size="xs" />
                                            <span style={{ ...ba(12, 500, { color: textC }) }}>{p.name}</span>
                                            <button
                                                onClick={() => toggleParticipant({ id: p.id }, p.type)}
                                                style={{ background: 'none', border: 'none', color: text3, cursor: 'pointer', display: 'flex', padding: 0, marginLeft: 2 }}
                                            >
                                                <X style={{ width: 12, height: 12 }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search */}
                        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}` }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: text3 }} />
                                <input
                                    type="text"
                                    placeholder="Search participants..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ ...inputStyle, paddingLeft: 32 }}
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: `1px solid ${border}` }}>
                            <button style={tabStyle(activeTab === 'admins')} onClick={() => setActiveTab('admins')}>
                                Admins ({filteredAdmins.length})
                            </button>
                            <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>
                                Users ({filteredUsers.length})
                            </button>
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="custom-scrollbar">
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        border: `2px solid ${border}`, borderTopColor: ORG,
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                </div>
                            ) : (() => {
                                const list = activeTab === 'admins'
                                    ? filteredAdmins.map(a => ({ ...a, _key: a.id, _type: 'ADMIN', _name: a.adminName, _email: a.adminEmail, _avatar: a.profileImage }))
                                    : filteredUsers.map(u => ({ ...u, _key: u.id, _type: 'USER', _name: u.name, _email: u.email, _avatar: u.avatar }));

                                if (list.length === 0) return (
                                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                                        <UserPlus style={{ width: 40, height: 40, color: text3, margin: '0 auto 12px', display: 'block' }} />
                                        <p style={{ ...ba(13, 400, { color: text3, margin: 0 }) }}>
                                            No {activeTab === 'admins' ? 'admins' : 'users'} found
                                        </p>
                                    </div>
                                );

                                return list.map(item => {
                                    const selected = isParticipantSelected(item._key, item._type);
                                    return (
                                        <div
                                            key={`${item._type}-${item._key}`}
                                            onClick={() => toggleParticipant(
                                                item._type === 'ADMIN'
                                                    ? { id: item._key, adminName: item._name, adminEmail: item._email, profileImage: item._avatar }
                                                    : { id: item._key, name: item._name, email: item._email, avatar: item._avatar },
                                                item._type
                                            )}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '10px 20px', cursor: 'pointer',
                                                background: selected ? bg2 : 'transparent',
                                                borderBottom: `1px solid ${border}`,
                                                transition: 'background 0.12s',
                                            }}
                                            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = bg2; }}
                                            onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Avatar avatar={item._avatar} name={item._name} initial={item._name?.charAt(0)} size="sm" />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ ...ba(13, 500, { color: textC, margin: 0 }) }} className="truncate">
                                                    {item._name}
                                                </p>
                                                <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }} className="truncate">
                                                    {item._email}
                                                </p>
                                            </div>
                                            <div style={{
                                                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                                border: `2px solid ${selected ? ORG : border}`,
                                                background: selected ? ORG : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s',
                                            }}>
                                                {selected && <Check style={{ width: 11, height: 11, color: '#fff' }} />}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
                            padding: '14px 20px', borderTop: `1px solid ${border}`,
                        }}>
                            <button
                                onClick={onClose}
                                disabled={creating}
                                style={{
                                    padding: '8px 18px', background: bg2, border: `1px solid ${border}`,
                                    borderRadius: 8, color: text2, cursor: 'pointer',
                                    ...ba(13, 500), opacity: creating ? 0.5 : 1,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating || !canCreate}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '8px 20px', background: canCreate && !creating ? ORG : bg3,
                                    border: `1px solid ${canCreate && !creating ? ORG : border}`,
                                    borderRadius: 8, color: canCreate && !creating ? '#fff' : text3,
                                    cursor: canCreate && !creating ? 'pointer' : 'not-allowed',
                                    ...ba(13, 600), transition: 'all 0.15s',
                                }}
                            >
                                {creating ? (
                                    <>
                                        <div style={{
                                            width: 14, height: 14, borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        {isGroup ? <Users style={{ width: 14, height: 14 }} /> : <MessageSquare style={{ width: 14, height: 14 }} />}
                                        {isGroup ? 'Create Group' : 'Start Chat'}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateConversationModal;
