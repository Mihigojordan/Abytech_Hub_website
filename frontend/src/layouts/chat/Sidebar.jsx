import React, { useState } from 'react';
import { MessageSquare, Users, Settings, Moon, Globe, UserPlus } from 'lucide-react';
import AdminList from '../../components/dashboard/chat/ui/AdminList';
import Avatar from '../../components/dashboard/chat/ui/Avatar';
import useAdminAuth from '../../context/AdminAuthContext';

/**
 * Sidebar layout component - left navigation bar with icons
 */
const Sidebar = ({ onConversationCreated }) => {
    const [showAdminList, setShowAdminList] = useState(false);
    const { user: currentUser } = useAdminAuth();

    const handleConversationCreated = (conversation) => {
        setShowAdminList(false);
        if (onConversationCreated) {
            onConversationCreated(conversation);
        }
    };



    return (
        <>
            <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 flex flex-col items-center space-y-6 pt-4">
                    {/* New Conversation Button */}
                    <button
                        onClick={() => setShowAdminList(true)}
                        className="w-10 h-10 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                        title="Start new conversation"
                    >
                        <UserPlus className="w-5 h-5" />
                    </button>

                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-lg">
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                        <Globe className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
                        <Moon className="w-5 h-5" />
                    </button>
                    <Avatar
                        avatar={currentUser?.profileImage}
                        initial={currentUser?.name?.charAt(0)?.toUpperCase()}
                        name={currentUser?.name || 'User'}
                        size="md"
                        online={false}
                    />
                </div>
            </div>

            {/* Admin List Modal */}
            <AdminList
                isOpen={showAdminList}
                onClose={() => setShowAdminList(false)}
                onConversationCreated={handleConversationCreated}
            />
        </>
    );
};

export default Sidebar;

