import React, { useMemo, useState } from 'react';
import { Search, Phone, Video, UserPlus, MoreVertical, Users, ArrowLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAdminAuth from '../../../../context/AdminAuthContext';

/**
 * Chat header component - top bar with user info and action buttons
 * Enhanced with:
 * - Online/offline status display
 * - Last seen time for offline users
 * - Participant name extraction for 1-on-1 chats
 * - Group member display for group chats
 */
const ChatHeader = ({ conversation, isTyping, onAddMember, onBack }) => {
    const { user: currentUser } = useAdminAuth();
    const [showMembers, setShowMembers] = useState(false);

    // Check if this is a group conversation
    const isGroup = conversation?.isGroup || false;

    // Extract participant info for 1-on-1 chats
    const participant = useMemo(() => {
        if (!conversation?.participants || conversation.participants.length === 0) {
            return null;
        }

        // For group chats, don't extract a single participant
        if (isGroup) return null;

        // Find the other participant (not current user)
        const otherParticipant = conversation.participants.find(p =>
            !(p.participantId === currentUser?.id && p.participantType === 'ADMIN')
        );

        return otherParticipant || null;
    }, [conversation?.participants, currentUser, isGroup]);

    // Get all other participants for group display
    const groupMembers = useMemo(() => {
        if (!isGroup || !conversation?.participants) return [];

        return conversation.participants.filter(p =>
            !(p.participantId === currentUser?.id && p.participantType === 'ADMIN')
        );
    }, [conversation?.participants, currentUser, isGroup]);

    // Get member names string for display
    const memberNamesString = useMemo(() => {
        if (!isGroup || groupMembers.length === 0) return '';

        const names = groupMembers.slice(0, 3).map(m => m.name || 'Unknown');
        if (groupMembers.length > 3) {
            return `${names.join(', ')} +${groupMembers.length - 3} more`;
        }
        return names.join(', ');
    }, [groupMembers, isGroup]);

    // Determine display properties
    const displayAvatar = isGroup ? conversation?.avatar : (participant?.avatar || conversation?.avatar);
    const displayInitial = isGroup ? (conversation?.initial || conversation?.name?.charAt(0)) : (participant?.initial || conversation?.initial);
    const displayName = isGroup ? conversation?.name : (participant?.name || conversation?.name || 'Unknown');
    const isOnline = !isGroup && (participant?.isOnline || false);
    const lastSeen = participant?.lastSeen;

    // Count online members in group
    const onlineCount = useMemo(() => {
        if (!isGroup) return 0;
        return groupMembers.filter(m => m.isOnline).length;
    }, [groupMembers, isGroup]);

    // Format last seen time
    const getLastSeenText = (lastSeen) => {
        if (!lastSeen) return 'Offline';

        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = (now - lastSeenDate) / 60000;

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        if (diffMinutes < 43200) return `${Math.floor(diffMinutes / 1440)}d ago`;
        return 'Long time ago';
    };

    // Determine status text
    const getStatusText = () => {
        if (isTyping) return null;
        if (isGroup) {
            return `${groupMembers.length + 1} members${onlineCount > 0 ? `, ${onlineCount} online` : ''}`;
        }
        return isOnline ? 'Online' : getLastSeenText(lastSeen);
    };

    const statusText = getStatusText();
    const statusColor = isOnline ? 'text-green-600' : 'text-gray-500';

    return (
        <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {/* Back Button for mobile */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mr-2 md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                    )}
                    <div className="relative">
                        {isGroup ? (
                            <div className="w-10 h-10 rounded-full bg-dashboard-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-dashboard-600" />
                            </div>
                        ) : (
                            <Avatar
                                avatar={displayAvatar}
                                initial={displayInitial}
                                name={displayName}
                                online={isOnline}
                                size="md"
                            />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-800 truncate">{displayName}</h2>
                        {isTyping ? (
                            <p className="text-xs text-dashboard-600 font-medium animate-pulse">
                                {isGroup ? 'Someone is typing...' : 'is typing...'}
                            </p>
                        ) : isGroup ? (
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className="text-xs text-gray-500 hover:text-dashboard-600 transition-colors truncate max-w-xs text-left"
                            >
                                {memberNamesString || statusText}
                            </button>
                        ) : (
                            <p className={`text-xs font-medium ${statusColor}`}>{statusText}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2">

                    {isGroup && onAddMember && (
                        <button
                            onClick={onAddMember}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Add member"
                        >
                            <UserPlus className="w-5 h-5 text-dashboard-600" />
                        </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Group Members Dropdown */}
            {isGroup && showMembers && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Group Members</p>
                    <div className="flex flex-wrap gap-2">
                        {/* Current user */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-dashboard-50 text-dashboard-700 rounded-full text-xs">
                            <div className="w-4 h-4 rounded-full bg-dashboard-200 flex items-center justify-center text-xs font-medium">
                                {currentUser?.adminName?.charAt(0).toUpperCase()}
                            </div>
                            <span>You</span>
                        </div>
                        {/* Other members */}
                        {groupMembers.map((member) => (
                            <div
                                key={`${member.participantType}-${member.participantId}`}
                                className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                            >
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-4 h-4 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                                        {member.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span>{member.name || 'Unknown'}</span>
                                {member.isOnline && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatHeader;
