import React, { useMemo } from 'react';
import Avatar from '../ui/Avatar';
import { Check, CheckCheck, Users } from 'lucide-react';
import useAdminAuth from '../../../../context/AdminAuthContext';

/**
 * Individual conversation item in the chat list
 * Enhanced with:
 * - Participant avatar display (for 1-on-1 chats)
 * - Group name display for group chats
 * - Online status indicator (only for 1-on-1)
 * - Read receipt ticks (only for 1-on-1)
 * - Enhanced styling for active state
 */
const ConversationItem = ({
    chat,
    isSelected,
    isTyping,
    lastMessage,
    unreadCount = 0,
    onSelect
}) => {
    const { user: currentUser } = useAdminAuth();

    // Check if this is a group conversation
    const isGroup = chat?.isGroup || false;

    // Extract participant info for 1-on-1 chats (not group chats)
    const participant = useMemo(() => {
        if (isGroup || !chat.participants || chat.participants.length === 0) {
            return null;
        }

        // For 1-on-1 chats, find the other participant (not current user)
        const otherParticipant = chat.participants.find(p =>
            !(p.participantId == currentUser?.id && p.participantType === 'ADMIN')
        );

        return otherParticipant || null;
    }, [chat.participants, currentUser, isGroup]);

    // Determine avatar and name to display
    // For groups: use conversation name directly
    // For 1-on-1: use other participant's info
    const displayAvatar = isGroup ? chat.avatar : (participant?.avatar || chat.avatar);
    const displayInitial = isGroup
        ? (chat.name?.charAt(0)?.toUpperCase() || 'G')
        : (participant?.initial || chat.initial);
    const displayName = isGroup ? (chat.name || 'Group') : (participant?.name || chat.name || 'Unknown');

    // Online status only for 1-on-1 chats
    const isOnline = !isGroup && (participant?.isOnline || false);

    // Determine if we should show read receipt ticks (only for 1-on-1 chats)
    // For groups, don't show read receipts
    const showReadReceipts = !isGroup &&
        lastMessage?.senderId === currentUser?.id &&
        lastMessage?.senderType === 'ADMIN';

    // Check if last message is read (double tick vs single tick)
    const isMessageRead = lastMessage?.isRead || false;

    // Format last message text
    const lastMessageText = useMemo(() => {
        if (!lastMessage) return '';

        // Show typing indicator
        if (isTyping) return null;

        // Show attachments with icons
        if (lastMessage.images && lastMessage.images.length > 0) {
            return '📷 Photo';
        }
        if (lastMessage.files && lastMessage.files.length > 0) {
            return '📎 File';
        }

        // Show message content, truncated
        return lastMessage.content?.substring(0, 40) || '';
    }, [lastMessage, isTyping]);

    return (
        <div
            className={`px-4 py-3 hover:bg-gray-200 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-dashboard-200 border-l-4 border-dashboard-600' : ''
                }`}
            onClick={() => onSelect(chat.id)}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    {isGroup ? (
                        // Group avatar with Users icon
                        <div className="w-12 h-12 rounded-full bg-dashboard-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-dashboard-600" />
                        </div>
                    ) : (
                        <Avatar
                            avatar={displayAvatar}
                            initial={displayInitial}
                            name={displayName}
                            online={isOnline}
                            size="lg"
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">{displayName}</h3>
                        <span className="text-xs text-gray-400">{lastMessage?.time || ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 flex-1 min-w-0">
                            {/* Read receipt ticks (only for sent messages) */}
                            {showReadReceipts && (
                                <div className="flex-shrink-0">
                                    {isMessageRead ? (
                                        <CheckCheck className="w-4 h-4 text-blue-500" />
                                    ) : (
                                        <Check className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            )}

                            {/* Message text */}
                            <p className={`text-sm truncate ${isTyping ? 'text-dashboard-600' : 'text-gray-500'}`}>
                                {isTyping ? 'typing •••' : lastMessageText}
                            </p>
                        </div>

                        {/* Unread count badge */}
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-dashboard-600 text-white text-xs rounded-full flex-shrink-0">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationItem;
