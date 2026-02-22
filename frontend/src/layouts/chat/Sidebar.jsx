import React, { useState } from 'react';
import { MessageSquare, Users, Settings, Moon, Globe, UserPlus } from 'lucide-react';
import CreateConversationModal from '../../components/dashboard/chat/ui/CreateConversationModal';
import Avatar from '../../components/dashboard/chat/ui/Avatar';
import useAdminAuth from '../../context/AdminAuthContext';

/**
 * Sidebar layout component - left navigation bar with icons
 */
const Sidebar = ({ onConversationCreated, selectedChatId }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user: currentUser } = useAdminAuth();

    const handleConversationCreated = (conversation) => {
        setShowCreateModal(false);
        if (onConversationCreated) {
            onConversationCreated(conversation);
        }
    };

    return (
        <>
            <div className={`w-16 bg-white border-r border-gray-200 flex-col items-center py-6 space-y-8 h-full ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                <div className="w-10 h-10 bg-dashboard-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 flex flex-col items-center space-y-6 pt-4">
                    {/* New Conversation Button */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-10 h-10 flex items-center justify-center text-white bg-dashboard-600 hover:bg-dashboard-700 rounded-lg transition-colors"
                        title="Start new conversation"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>

                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-dashboard-600 transition-colors">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-dashboard-600 bg-dashboard-50 rounded-lg">
                        <MessageSquare className="w-5 h-5" />
                    </button>

                </div>

                <div className="flex flex-col items-center space-y-4">

                    <Avatar
                        avatar={currentUser?.profileImage}
                        initial={currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.adminName?.charAt(0)?.toUpperCase()}
                        name={currentUser?.name || currentUser?.adminName || 'User'}
                        size="md"
                        online={false}
                    />
                </div>
            </div>

            {/* Create Conversation Modal */}
            <CreateConversationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onConversationCreated={handleConversationCreated}
            />
        </>
    );
};

export default Sidebar;
