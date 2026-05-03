import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Check, UserPlus, Users, Shield, ShieldOff, UserMinus, LogOut, Camera, Edit3 } from 'lucide-react';
import adminAuthService from '../../../../services/adminAuthService';
import chatService from '../../../../services/chatService';
import useAdminAuth from '../../../../context/AdminAuthContext';
import api from '../../../../api/api';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';

const AddMemberModal = ({ isOpen, onClose, conversation, onMembersAdded, currentUserRole }) => {
    const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
    const { user: currentAdmin } = useAdminAuth();

    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [adding, setAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('admins');
    const [mainTab, setMainTab] = useState('add');
    const [manageSearch, setManageSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [leavingGroup, setLeavingGroup] = useState(false);

    // ── Group settings state ──
    const avatarInputRef = useRef(null);
    const [groupName, setGroupName] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsSaved, setSettingsSaved] = useState(false);

    const isGroupAdmin = currentUserRole === 'admin';

    const existingMemberIds = useMemo(() => {
        if (!conversation?.participants) return new Set();
        return new Set(
            conversation.participants.map(p => `${p.participantType}-${p.participantId}`)
        );
    }, [conversation?.participants]);

    useEffect(() => {
        if (isOpen) {
            fetchParticipants();
            setSelectedParticipants([]);
            setSearchQuery('');
            setManageSearch('');
            setMainTab('add');
            setActiveTab('admins');
            // seed group settings
            setGroupName(conversation?.name || '');
            setAvatarFile(null);
            setAvatarPreview(conversation?.avatar || null);
            setSettingsSaved(false);
        }
    }, [isOpen]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const [adminsResponse, usersResponse] = await Promise.all([
                adminAuthService.getAllAdmins(),
                api.get('/user-auth/users').then(res => res.data).catch(() => [])
            ]);
            setAdmins(adminsResponse || []);
            setUsers(usersResponse || []);
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAdmins = useMemo(() => {
        return admins
            .filter(admin => !existingMemberIds.has(`ADMIN-${admin.id}`))
            .filter(admin =>
                admin.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                admin.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [admins, searchQuery, existingMemberIds]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => !existingMemberIds.has(`USER-${user.id}`))
            .filter(user =>
                user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [users, searchQuery, existingMemberIds]);

    // Current members for manage tab
    const currentMembers = useMemo(() => {
        if (!conversation?.participants) return [];
        return conversation.participants.filter(p => {
            const name = p.participantType === 'ADMIN'
                ? (admins.find(a => a.id === p.participantId)?.adminName || p.participantId)
                : (users.find(u => u.id === p.participantId)?.name || p.participantId);
            const email = p.participantType === 'ADMIN'
                ? (admins.find(a => a.id === p.participantId)?.adminEmail || '')
                : (users.find(u => u.id === p.participantId)?.email || '');
            return (
                name.toLowerCase().includes(manageSearch.toLowerCase()) ||
                email.toLowerCase().includes(manageSearch.toLowerCase())
            );
        });
    }, [conversation?.participants, admins, users, manageSearch]);

    const toggleParticipant = (participant, type) => {
        const participantKey = `${type}-${participant.id}`;
        const isSelected = selectedParticipants.some(p => p.key === participantKey);
        if (isSelected) {
            setSelectedParticipants(prev => prev.filter(p => p.key !== participantKey));
        } else {
            setSelectedParticipants(prev => [
                ...prev,
                {
                    key: participantKey,
                    id: participant.id,
                    type,
                    name: type === 'ADMIN' ? participant.adminName : participant.name,
                    avatar: type === 'ADMIN' ? participant.profileImage : participant.avatar
                }
            ]);
        }
    };

    const isParticipantSelected = (id, type) => {
        return selectedParticipants.some(p => p.id === id && p.type === type);
    };

    const handleAddMembers = async () => {
        if (selectedParticipants.length === 0 || !conversation?.id) return;
        try {
            setAdding(true);
            await chatService.addMembersToConversation(
                conversation.id,
                selectedParticipants.map(p => p.id),
                selectedParticipants.map(p => p.type)
            );
            onMembersAdded?.(selectedParticipants);
            onClose();
        } catch (error) {
            console.error('Failed to add members:', error);
            alert('Failed to add members. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveMember = async (participant) => {
        if (!confirm(`Remove this member from the group?`)) return;
        const key = `remove-${participant.participantId}-${participant.participantType}`;
        try {
            setActionLoading(key);
            await chatService.removeMember(conversation.id, participant.participantId, participant.participantType);
            onMembersAdded?.();
        } catch (error) {
            alert(error.message || 'Failed to remove member');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (participant, newRole) => {
        const key = `role-${participant.participantId}-${participant.participantType}`;
        try {
            setActionLoading(key);
            await chatService.updateMemberRole(
                conversation.id,
                participant.participantId,
                participant.participantType,
                newRole
            );
            onMembersAdded?.();
        } catch (error) {
            alert(error.message || 'Failed to update role');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeaveGroup = async () => {
        if (!confirm('Are you sure you want to leave this group?')) return;
        try {
            setLeavingGroup(true);
            await chatService.leaveGroup(conversation.id);
            onMembersAdded?.();
            onClose();
        } catch (error) {
            alert(error.message || 'Failed to leave group');
        } finally {
            setLeavingGroup(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleUpdateGroup = async () => {
        if (!groupName.trim() && !avatarFile) return;
        try {
            setSavingSettings(true);
            await chatService.updateGroup(conversation.id, groupName.trim() || undefined, avatarFile || undefined);
            onMembersAdded?.();          // refresh conversation in parent
            setSettingsSaved(true);
            setTimeout(() => setSettingsSaved(false), 2500);
        } catch (error) {
            alert(error.message || 'Failed to update group');
        } finally {
            setSavingSettings(false);
        }
    };

    const getMemberInfo = (participant) => {
        if (participant.participantType === 'ADMIN') {
            const admin = admins.find(a => a.id === participant.participantId);
            return {
                name: admin?.adminName || participant.participantId,
                email: admin?.adminEmail || '',
                avatar: admin?.profileImage || null,
                initials: (admin?.adminName || 'A').charAt(0).toUpperCase(),
            };
        } else {
            const user = users.find(u => u.id === participant.participantId);
            return {
                name: user?.name || participant.participantId,
                email: user?.email || '',
                avatar: user?.avatar || null,
                initials: (user?.name || 'U').charAt(0).toUpperCase(),
            };
        }
    };

    if (!isOpen) return null;

    // Theme-aware class helpers
    const modalBg = isDark ? '#0a1e28' : '#ffffff';
    const headerBorderColor = border;
    const inputBg = isDark ? '#071418' : '#f9fafb';
    const inputBorderColor = isDark ? 'rgba(255,255,255,0.12)' : '#d1d5db';
    const inputFocusRing = '#e07b39';
    const accentColor = '#e07b39';
    const accentLight = isDark ? 'rgba(224,123,57,0.15)' : '#fff3eb';
    const accentText = isDark ? '#f4a261' : '#c2541a';
    const hoverBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
    const selectedBg = isDark ? 'rgba(224,123,57,0.12)' : '#fff3eb';
    const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0';
    const dangerColor = '#ef4444';
    const dangerLight = isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2';
    const greenColor = '#22c55e';
    const greenLight = isDark ? 'rgba(34,197,94,0.12)' : '#f0fdf4';

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50,
        }}>
            <div style={{
                background: modalBg,
                borderRadius: 16,
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                width: '100%',
                maxWidth: 500,
                margin: '0 16px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${border}`,
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: `1px solid ${headerBorderColor}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36,
                            background: accentLight,
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Users style={{ width: 18, height: 18, color: accentColor }} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textC }}>
                                {conversation?.name}
                            </h2>
                            <p style={{ margin: 0, fontSize: 12, color: text2 }}>
                                {conversation?.participants?.length || 0} members
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 8,
                            border: 'none', cursor: 'pointer',
                            background: 'transparent',
                            color: text2,
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <X style={{ width: 18, height: 18 }} />
                    </button>
                </div>

                {/* Main Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: `1px solid ${headerBorderColor}`,
                    padding: '0 8px',
                }}>
                    <MainTabBtn
                        label="Add Members"
                        icon={<UserPlus style={{ width: 14, height: 14 }} />}
                        active={mainTab === 'add'}
                        onClick={() => setMainTab('add')}
                        accentColor={accentColor}
                        textC={textC}
                        text2={text2}
                    />
                    {isGroupAdmin && (
                        <MainTabBtn
                            label="Manage Members"
                            icon={<Shield style={{ width: 14, height: 14 }} />}
                            active={mainTab === 'manage'}
                            onClick={() => setMainTab('manage')}
                            accentColor={accentColor}
                            textC={textC}
                            text2={text2}
                        />
                    )}
                    {isGroupAdmin && (
                        <MainTabBtn
                            label="Settings"
                            icon={<Edit3 style={{ width: 14, height: 14 }} />}
                            active={mainTab === 'settings'}
                            onClick={() => setMainTab('settings')}
                            accentColor={accentColor}
                            textC={textC}
                            text2={text2}
                        />
                    )}
                </div>

                {/* ── ADD MEMBERS PANEL ── */}
                {mainTab === 'add' && (
                    <>
                        {/* Selected chips */}
                        {selectedParticipants.length > 0 && (
                            <div style={{
                                padding: '10px 16px',
                                borderBottom: `1px solid ${headerBorderColor}`,
                                background: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
                            }}>
                                <p style={{ margin: '0 0 8px', fontSize: 11, color: text3, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                    Adding {selectedParticipants.length} member{selectedParticipants.length > 1 ? 's' : ''}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {selectedParticipants.map(participant => (
                                        <div key={participant.key} style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            padding: '4px 8px 4px 6px',
                                            background: accentLight,
                                            color: accentText,
                                            borderRadius: 100,
                                            fontSize: 12, fontWeight: 500,
                                        }}>
                                            <span>{participant.name}</span>
                                            <button
                                                onClick={() => toggleParticipant({ id: participant.id }, participant.type)}
                                                style={{
                                                    width: 16, height: 16, border: 'none', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'transparent', borderRadius: '50%', padding: 0, color: 'inherit',
                                                }}
                                            >
                                                <X style={{ width: 11, height: 11 }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search */}
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${headerBorderColor}` }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{
                                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                    width: 15, height: 15, color: text3, pointerEvents: 'none',
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        paddingLeft: 36, paddingRight: 12,
                                        paddingTop: 8, paddingBottom: 8,
                                        background: inputBg,
                                        border: `1px solid ${inputBorderColor}`,
                                        borderRadius: 8,
                                        fontSize: 13, color: textC,
                                        outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = inputFocusRing}
                                    onBlur={e => e.target.style.borderColor = inputBorderColor}
                                />
                            </div>
                        </div>

                        {/* Sub-tabs */}
                        <div style={{ display: 'flex', gap: 4, padding: '8px 16px', borderBottom: `1px solid ${headerBorderColor}` }}>
                            {['admins', 'users'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        flex: 1, padding: '6px 0',
                                        borderRadius: 6,
                                        border: 'none', cursor: 'pointer',
                                        fontSize: 12, fontWeight: 500,
                                        background: activeTab === tab ? accentLight : 'transparent',
                                        color: activeTab === tab ? accentText : text2,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {tab === 'admins' ? `Admins (${filteredAdmins.length})` : `Users (${filteredUsers.length})`}
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 260 }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        border: `3px solid ${accentColor}`,
                                        borderTopColor: 'transparent',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                </div>
                            ) : activeTab === 'admins' ? (
                                filteredAdmins.length === 0 ? (
                                    <EmptyState text="No admins available to add" text2={text2} text3={text3} />
                                ) : (
                                    filteredAdmins.map(admin => {
                                        const selected = isParticipantSelected(admin.id, 'ADMIN');
                                        return (
                                            <PersonRow
                                                key={admin.id}
                                                name={admin.adminName}
                                                sub={admin.adminEmail}
                                                avatar={admin.profileImage}
                                                initials={(admin.adminName || 'A').charAt(0).toUpperCase()}
                                                avatarBg={accentLight}
                                                avatarColor={accentText}
                                                selected={selected}
                                                onClick={() => toggleParticipant(admin, 'ADMIN')}
                                                accentColor={accentColor}
                                                selectedBg={selectedBg}
                                                hoverBg={hoverBg}
                                                textC={textC}
                                                text2={text2}
                                                dividerColor={dividerColor}
                                            />
                                        );
                                    })
                                )
                            ) : (
                                filteredUsers.length === 0 ? (
                                    <EmptyState text="No users available to add" text2={text2} text3={text3} />
                                ) : (
                                    filteredUsers.map(user => {
                                        const selected = isParticipantSelected(user.id, 'USER');
                                        return (
                                            <PersonRow
                                                key={user.id}
                                                name={user.name}
                                                sub={user.email}
                                                avatar={user.avatar}
                                                initials={(user.name || 'U').charAt(0).toUpperCase()}
                                                avatarBg={greenLight}
                                                avatarColor={greenColor}
                                                selected={selected}
                                                onClick={() => toggleParticipant(user, 'USER')}
                                                accentColor={accentColor}
                                                selectedBg={selectedBg}
                                                hoverBg={hoverBg}
                                                textC={textC}
                                                text2={text2}
                                                dividerColor={dividerColor}
                                            />
                                        );
                                    })
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderTop: `1px solid ${headerBorderColor}`,
                        }}>
                            {/* Leave group for non-admins */}
                            {!isGroupAdmin && (
                                <button
                                    onClick={handleLeaveGroup}
                                    disabled={leavingGroup}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 14px',
                                        border: `1px solid ${dangerColor}`,
                                        borderRadius: 8,
                                        background: 'transparent',
                                        color: dangerColor,
                                        fontSize: 13, fontWeight: 500,
                                        cursor: leavingGroup ? 'not-allowed' : 'pointer',
                                        opacity: leavingGroup ? 0.6 : 1,
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!leavingGroup) e.currentTarget.style.background = dangerLight; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <LogOut style={{ width: 14, height: 14 }} />
                                    {leavingGroup ? 'Leaving...' : 'Leave Group'}
                                </button>
                            )}
                            {isGroupAdmin && <div />}

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={onClose}
                                    disabled={adding}
                                    style={{
                                        padding: '7px 16px',
                                        border: `1px solid ${inputBorderColor}`,
                                        borderRadius: 8,
                                        background: 'transparent',
                                        color: text2,
                                        fontSize: 13, fontWeight: 500,
                                        cursor: 'pointer',
                                        opacity: adding ? 0.5 : 1,
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMembers}
                                    disabled={adding || selectedParticipants.length === 0}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '7px 18px',
                                        border: 'none', borderRadius: 8,
                                        background: accentColor,
                                        color: '#fff',
                                        fontSize: 13, fontWeight: 500,
                                        cursor: adding || selectedParticipants.length === 0 ? 'not-allowed' : 'pointer',
                                        opacity: adding || selectedParticipants.length === 0 ? 0.5 : 1,
                                        transition: 'opacity 0.15s',
                                    }}
                                >
                                    {adding ? (
                                        <>
                                            <div style={{
                                                width: 14, height: 14, borderRadius: '50%',
                                                border: '2px solid rgba(255,255,255,0.4)',
                                                borderTopColor: '#fff',
                                                animation: 'spin 0.7s linear infinite',
                                            }} />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus style={{ width: 14, height: 14 }} />
                                            Add{selectedParticipants.length > 0 ? ` (${selectedParticipants.length})` : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* ── MANAGE MEMBERS PANEL ── */}
                {mainTab === 'manage' && isGroupAdmin && (
                    <>
                        {/* Search */}
                        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${headerBorderColor}` }}>
                            <div style={{ position: 'relative' }}>
                                <Search style={{
                                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                    width: 15, height: 15, color: text3, pointerEvents: 'none',
                                }} />
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    value={manageSearch}
                                    onChange={e => setManageSearch(e.target.value)}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        paddingLeft: 36, paddingRight: 12,
                                        paddingTop: 8, paddingBottom: 8,
                                        background: inputBg,
                                        border: `1px solid ${inputBorderColor}`,
                                        borderRadius: 8,
                                        fontSize: 13, color: textC,
                                        outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = inputFocusRing}
                                    onBlur={e => e.target.style.borderColor = inputBorderColor}
                                />
                            </div>
                        </div>

                        {/* Member list */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 340 }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        border: `3px solid ${accentColor}`,
                                        borderTopColor: 'transparent',
                                        animation: 'spin 0.7s linear infinite',
                                    }} />
                                </div>
                            ) : currentMembers.length === 0 ? (
                                <EmptyState text="No members found" text2={text2} text3={text3} />
                            ) : (
                                currentMembers.map(participant => {
                                    const info = getMemberInfo(participant);
                                    const isSelf = participant.participantId === currentAdmin?.id &&
                                        participant.participantType === (currentAdmin?.type || 'ADMIN');
                                    const isAdmin = participant.role === 'admin';
                                    const actionKey = `role-${participant.participantId}-${participant.participantType}`;
                                    const removeKey = `remove-${participant.participantId}-${participant.participantType}`;
                                    const busy = actionLoading === actionKey || actionLoading === removeKey;

                                    return (
                                        <div
                                            key={`${participant.participantType}-${participant.participantId}`}
                                            style={{
                                                display: 'flex', alignItems: 'center',
                                                padding: '10px 16px',
                                                borderBottom: `1px solid ${dividerColor}`,
                                                gap: 12,
                                            }}
                                        >
                                            {/* Avatar */}
                                            {info.avatar ? (
                                                <img src={info.avatar} alt={info.name}
                                                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                            ) : (
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                                    background: participant.participantType === 'ADMIN' ? accentLight : greenLight,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 15, fontWeight: 600,
                                                    color: participant.participantType === 'ADMIN' ? accentText : greenColor,
                                                }}>
                                                    {info.initials}
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 500, color: textC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {info.name}
                                                    </span>
                                                    {isSelf && (
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 600, padding: '1px 6px',
                                                            background: accentLight, color: accentText,
                                                            borderRadius: 100, flexShrink: 0,
                                                        }}>You</span>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                    <span style={{ fontSize: 11, color: text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {info.email || participant.participantType}
                                                    </span>
                                                    {isAdmin && (
                                                        <span style={{
                                                            fontSize: 10, fontWeight: 600, padding: '1px 6px',
                                                            background: isDark ? 'rgba(139,92,246,0.2)' : '#f3f0ff',
                                                            color: isDark ? '#a78bfa' : '#7c3aed',
                                                            borderRadius: 100, flexShrink: 0,
                                                        }}>Admin</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions (not for self) */}
                                            {!isSelf && (
                                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                                    {/* Promote / Demote */}
                                                    <ActionIconBtn
                                                        title={isAdmin ? 'Remove admin' : 'Make admin'}
                                                        icon={isAdmin
                                                            ? <ShieldOff style={{ width: 14, height: 14 }} />
                                                            : <Shield style={{ width: 14, height: 14 }} />
                                                        }
                                                        onClick={() => handleUpdateRole(participant, isAdmin ? 'member' : 'admin')}
                                                        disabled={busy}
                                                        color={isDark ? '#a78bfa' : '#7c3aed'}
                                                        hoverBg={isDark ? 'rgba(139,92,246,0.15)' : '#f3f0ff'}
                                                    />
                                                    {/* Remove */}
                                                    <ActionIconBtn
                                                        title="Remove from group"
                                                        icon={<UserMinus style={{ width: 14, height: 14 }} />}
                                                        onClick={() => handleRemoveMember(participant)}
                                                        disabled={busy}
                                                        color={dangerColor}
                                                        hoverBg={dangerLight}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex', justifyContent: 'flex-end',
                            padding: '14px 16px',
                            borderTop: `1px solid ${headerBorderColor}`,
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '7px 18px',
                                    border: `1px solid ${inputBorderColor}`,
                                    borderRadius: 8,
                                    background: 'transparent',
                                    color: text2,
                                    fontSize: 13, fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Done
                            </button>
                        </div>
                    </>
                )}

                {/* ── SETTINGS PANEL ── */}
                {mainTab === 'settings' && isGroupAdmin && (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>

                            {/* Avatar picker */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                                <div style={{ position: 'relative', marginBottom: 10 }}>
                                    <div style={{
                                        width: 90, height: 90, borderRadius: '50%',
                                        background: avatarPreview ? 'transparent' : accentLight,
                                        border: `2px solid ${border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', fontSize: 34, fontWeight: 700, color: accentText,
                                    }}>
                                        {avatarPreview
                                            ? <img src={avatarPreview} alt="group" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : (groupName || conversation?.name || 'G').charAt(0).toUpperCase()
                                        }
                                    </div>
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        style={{
                                            position: 'absolute', bottom: 2, right: 2,
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: accentColor, border: `2px solid ${modalBg}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#fff',
                                        }}
                                    >
                                        <Camera style={{ width: 13, height: 13 }} />
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <p style={{ margin: 0, fontSize: 11, color: text3 }}>
                                    Click the camera icon to change group photo
                                </p>
                                {avatarFile && (
                                    <button
                                        onClick={() => { setAvatarFile(null); setAvatarPreview(conversation?.avatar || null); }}
                                        style={{
                                            marginTop: 6, fontSize: 11, color: dangerColor,
                                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                        }}
                                    >
                                        Remove new photo
                                    </button>
                                )}
                            </div>

                            {/* Group name */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{
                                    display: 'block', marginBottom: 6,
                                    fontSize: 11, fontWeight: 600, color: text3,
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    placeholder="Enter group name…"
                                    maxLength={60}
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        padding: '10px 14px',
                                        background: inputBg,
                                        border: `1px solid ${inputBorderColor}`,
                                        borderRadius: 8,
                                        fontSize: 14, color: textC,
                                        outline: 'none',
                                    }}
                                    onFocus={e => e.target.style.borderColor = inputFocusRing}
                                    onBlur={e => e.target.style.borderColor = inputBorderColor}
                                />
                                <p style={{ margin: '4px 0 0', fontSize: 11, color: text3, textAlign: 'right' }}>
                                    {groupName.length}/60
                                </p>
                            </div>

                            {/* Save */}
                            <button
                                onClick={handleUpdateGroup}
                                disabled={savingSettings || (!groupName.trim() && !avatarFile)}
                                style={{
                                    width: '100%', padding: '10px 0',
                                    borderRadius: 8, border: 'none',
                                    background: settingsSaved ? '#22c55e' : accentColor,
                                    color: '#fff', fontSize: 13, fontWeight: 600,
                                    cursor: savingSettings || (!groupName.trim() && !avatarFile) ? 'not-allowed' : 'pointer',
                                    opacity: savingSettings || (!groupName.trim() && !avatarFile) ? 0.55 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'background 0.2s, opacity 0.15s',
                                }}
                            >
                                {savingSettings ? (
                                    <>
                                        <div style={{
                                            width: 14, height: 14, borderRadius: '50%',
                                            border: '2px solid rgba(255,255,255,0.4)',
                                            borderTopColor: '#fff',
                                            animation: 'spin 0.7s linear infinite',
                                        }} />
                                        Saving…
                                    </>
                                ) : settingsSaved ? (
                                    <>
                                        <Check style={{ width: 15, height: 15 }} />
                                        Saved!
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>

                        <div style={{
                            padding: '14px 16px',
                            borderTop: `1px solid ${headerBorderColor}`,
                            display: 'flex', justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '7px 18px',
                                    border: `1px solid ${inputBorderColor}`,
                                    borderRadius: 8, background: 'transparent',
                                    color: text2, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

const MainTabBtn = ({ label, icon, active, onClick, accentColor, textC, text2 }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 14px',
            border: 'none', background: 'transparent',
            cursor: 'pointer',
            fontSize: 13, fontWeight: active ? 600 : 400,
            color: active ? accentColor : text2,
            borderBottom: active ? `2px solid ${accentColor}` : '2px solid transparent',
            marginBottom: -1,
            transition: 'all 0.15s',
        }}
    >
        {icon}
        {label}
    </button>
);

const PersonRow = ({
    name, sub, avatar, initials, avatarBg, avatarColor,
    selected, onClick, accentColor, selectedBg, hoverBg,
    textC, text2, dividerColor,
}) => {
    const [hovered, setHovered] = React.useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px',
                cursor: 'pointer',
                background: selected ? selectedBg : hovered ? hoverBg : 'transparent',
                borderBottom: `1px solid ${dividerColor}`,
                transition: 'background 0.12s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                {avatar ? (
                    <img src={avatar} alt={name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                    <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: avatarBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 600, color: avatarColor,
                    }}>
                        {initials}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: textC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub}
                    </p>
                </div>
            </div>
            <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginLeft: 8,
                border: `2px solid ${selected ? accentColor : 'rgba(150,150,150,0.4)'}`,
                background: selected ? accentColor : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
            }}>
                {selected && <Check style={{ width: 11, height: 11, color: '#fff' }} />}
            </div>
        </div>
    );
};

const ActionIconBtn = ({ icon, title, onClick, disabled, color, hoverBg }) => {
    const [hovered, setHovered] = React.useState(false);
    return (
        <button
            title={title}
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', borderRadius: 7,
                background: hovered && !disabled ? hoverBg : 'transparent',
                color: color,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'background 0.12s',
            }}
        >
            {icon}
        </button>
    );
};

const EmptyState = ({ text, text2, text3 }) => (
    <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <Users style={{ width: 40, height: 40, color: text3, margin: '0 auto 12px', display: 'block' }} />
        <p style={{ margin: 0, fontSize: 13, color: text2 }}>{text}</p>
    </div>
);

export default AddMemberModal;