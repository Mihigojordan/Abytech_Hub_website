import React, { useMemo } from 'react';
import { Search, Phone, Video, UserPlus, MoreVertical } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAdminAuth from '../../../../context/AdminAuthContext';

/**
 * Chat header component - top bar with user info and action buttons
 * Enhanced with:
 * - Online/offline status display
 * - Last seen time for offline users
 * - Participant name extraction for 1-on-1 chats
 */
const ChatHeader = ({ conversation, isTyping }) => {
    const { user: currentUser } = useAdminAuth();

    // Extract participant info for 1-on-1 chats
    const participant = useMemo(() => {
        if (!conversation?.participants || conversation.participants.length === 0) {
            return null;
        }

        // Find the other participant (not current user)
        const otherParticipant = conversation.participants.find(p =>
            !(p.participantId === currentUser?.id && p.participantType === 'ADMIN')
        );

        return otherParticipant || null;
    }, [conversation?.participants, currentUser]);

    // Determine display properties
    const displayAvatar = participant?.avatar || conversation?.avatar;
    const displayInitial = participant?.initial || conversation?.initial;
    const displayName = participant?.name || conversation?.name || 'Unknown';
    const isOnline = participant?.isOnline || false;
    const lastSeen = participant?.lastSeen;

    // Format last seen time
    const getLastSeenText = (lastSeen) => {
        if (!lastSeen) return 'Offline';

        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = (now - lastSeenDate) / 60000;

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
        if (diffMinutes < 1440) return `${ Math.floor(diffMinutes / 60) }h ago`;
        if (diffMinutes < 43200) return `${ Math.floor(diffMinutes / 1440) }d ago`;
        return 'Long time ago';
    };

    // Determine status text
    const statusText = isOnline ? 'Online' : getLastSeenText(lastSeen);
    const statusColor = isOnline ? 'text-green-600' : 'text-gray-500';

    return (
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Avatar
                    avatar={displayAvatar}
                    initial={displayInitial}
                    name={displayName}
                    online={isOnline}
                    size="md"
                />
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{displayName}</h2>
                    {isTyping ? (
                        <p className="text-xs text-indigo-600 font-medium animate-pulse">is typing...</p>
                    ) : (
                        <p className={`text - xs font - medium ${ statusColor } `}>{statusText}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserPlus className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
