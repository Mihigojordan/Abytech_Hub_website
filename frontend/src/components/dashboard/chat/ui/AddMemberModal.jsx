import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Check, UserPlus, Users } from 'lucide-react';
import adminAuthService from '../../../../services/adminAuthService';
import chatService from '../../../../services/chatService';
import useAdminAuth from '../../../../context/AdminAuthContext';
import api from '../../../../api/api';

/**
 * Add Member Modal - Allows adding new members to an existing group
 * - Fetches both admins and users
 * - Filters out existing members
 * - Multi-select for adding multiple members at once
 */
const AddMemberModal = ({ isOpen, onClose, conversation, onMembersAdded }) => {
    const [admins, setAdmins] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [adding, setAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('admins');
    const { user: currentAdmin } = useAdminAuth();

    // Get existing member IDs
    const existingMemberIds = useMemo(() => {
        if (!conversation?.participants) return new Set();
        return new Set(
            conversation.participants.map(p => `${p.participantType}-${p.participantId}`)
        );
    }, [conversation?.participants]);

    // Fetch admins and users
    useEffect(() => {
        if (isOpen) {
            fetchParticipants();
            setSelectedParticipants([]);
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

            setAdmins(adminsResponse || []);
            setUsers(usersResponse || []);
        } catch (error) {
            console.error('Failed to fetch participants:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter out existing members and search
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

    // Toggle participant selection
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

    // Add members to group
    const handleAddMembers = async () => {
        if (selectedParticipants.length === 0 || !conversation?.id) return;

        try {
            setAdding(true);

            // Call API to add members
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-dashboard-600" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Add Members to {conversation?.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Selected Participants */}
                {selectedParticipants.length > 0 && (
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500 mb-2">
                            Adding: {selectedParticipants.length} member{selectedParticipants.length > 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedParticipants.map((participant) => (
                                <div
                                    key={participant.key}
                                    className="flex items-center gap-1 px-2 py-1 bg-dashboard-100 text-dashboard-700 rounded-full text-sm"
                                >
                                    <span>{participant.name}</span>
                                    <button
                                        onClick={() => toggleParticipant(
                                            { id: participant.id },
                                            participant.type
                                        )}
                                        className="w-4 h-4 flex items-center justify-center hover:bg-dashboard-200 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search participants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashboard-500"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'admins'
                                ? 'text-dashboard-600 border-b-2 border-dashboard-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Admins ({filteredAdmins.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'users'
                                ? 'text-dashboard-600 border-b-2 border-dashboard-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Users ({filteredUsers.length})
                    </button>
                </div>

                {/* Participant List */}
                <div className="flex-1 overflow-y-auto max-h-64">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-600"></div>
                        </div>
                    ) : activeTab === 'admins' ? (
                        filteredAdmins.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No admins available to add</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredAdmins.map((admin) => {
                                    const selected = isParticipantSelected(admin.id, 'ADMIN');
                                    return (
                                        <div
                                            key={admin.id}
                                            onClick={() => toggleParticipant(admin, 'ADMIN')}
                                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${selected ? 'bg-dashboard-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {admin.profileImage ? (
                                                    <img
                                                        src={admin.profileImage}
                                                        alt={admin.adminName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-dashboard-100 flex items-center justify-center">
                                                        <span className="text-dashboard-600 font-semibold">
                                                            {admin.adminName?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {admin.adminName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {admin.adminEmail}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected
                                                    ? 'bg-dashboard-600 border-dashboard-600'
                                                    : 'border-gray-300'
                                                }`}>
                                                {selected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No users available to add</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => {
                                    const selected = isParticipantSelected(user.id, 'USER');
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleParticipant(user, 'USER')}
                                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${selected ? 'bg-dashboard-50' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <span className="text-green-600 font-semibold">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected
                                                    ? 'bg-dashboard-600 border-dashboard-600'
                                                    : 'border-gray-300'
                                                }`}>
                                                {selected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={adding}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddMembers}
                        disabled={adding || selectedParticipants.length === 0}
                        className="px-6 py-2 bg-dashboard-600 hover:bg-dashboard-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {adding ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                <span>Add {selectedParticipants.length > 0 ? `(${selectedParticipants.length})` : ''}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;
