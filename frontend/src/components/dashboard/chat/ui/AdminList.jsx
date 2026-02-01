import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Search, UserPlus } from 'lucide-react';
import adminAuthService from '../../../../services/adminAuthService';
import chatService from '../../../../services/chatService';
import useAdminAuth from '../../../../context/AdminAuthContext';

/**
 * Admin List Component - Shows all admins for creating conversations
 */
const AdminList = ({ isOpen, onClose, onConversationCreated }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [creating, setCreating] = useState(null);
    const { user: currentAdmin } = useAdminAuth();

    // Fetch all admins
    useEffect(() => {
        if (isOpen) {
            fetchAdmins();
        }
    }, [isOpen]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await adminAuthService.getAllAdmins();
            // Filter out current admin
            const filteredAdmins = response?.filter(
                admin => admin.id !== currentAdmin?.id
            ) || [];

            console.log(response);
            console.log(filteredAdmins);

            setAdmins(filteredAdmins);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create conversation with admin
    const handleCreateConversation = async (admin) => {
        if (creating === admin.id) return;

        try {
            setCreating(admin.id);

            // Create conversation
            const conversation = await chatService.createConversation({
                participantIds: [currentAdmin.id, admin.id],
                participantTypes: ['ADMIN', 'ADMIN'],
                isGroup: false,
                name: admin.adminName
            });

            // Notify parent component
            onConversationCreated(conversation);
            onClose();
        } catch (error) {
            console.error('Failed to create conversation:', error);
            alert('Failed to start conversation. Please try again.');
        } finally {
            setCreating(null);
        }
    };

    // Filter admins by search query
    const filteredAdmins = admins.filter(admin =>
        admin.adminName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Start New Conversation
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search admins..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Admin List */}
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredAdmins.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No admins found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredAdmins.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {/* Avatar */}
                                        {admin.profileImage ? (
                                            <img
                                                src={admin.profileImage}
                                                alt={admin.adminName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-semibold">
                                                    {admin.adminName?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {admin.adminName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {admin.adminEmail}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleCreateConversation(admin)}
                                        disabled={creating === admin.id}
                                        className="ml-3 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Start conversation"
                                    >
                                        {creating === admin.id ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                        ) : (
                                            <MessageSquare className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminList;
