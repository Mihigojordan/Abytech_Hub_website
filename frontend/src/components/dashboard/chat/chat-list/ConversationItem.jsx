import React, { useMemo } from 'react';
import Avatar from '../ui/Avatar';
import { Check, CheckCheck, Users, ShieldCheck } from 'lucide-react';
import useAdminAuth from '../../../../context/AdminAuthContext';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Individual conversation item in the chat list
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
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();

    // Check if this is a group conversation
    const isGroup = chat?.isGroup || false;

    // Extract participant info for 1-on-1 chats
    const participant = useMemo(() => {
        if (isGroup || !chat.participants || chat.participants.length === 0) return null;
        return chat.participants.find(p => !(p.participantId == currentUser?.id && p.participantType === 'ADMIN')) || null;
    }, [chat.participants, currentUser, isGroup]);

    const displayName = isGroup ? (chat.name || 'Group') : (participant?.name || chat.name || 'Unknown');
    const isOnline = !isGroup && (participant?.isOnline || false);

    const showReadReceipts = !isGroup && lastMessage?.senderId === currentUser?.id && lastMessage?.senderType === 'ADMIN';
    const isMessageRead = lastMessage?.isRead || false;

    // Format last message text
    const lastMessageText = useMemo(() => {
        if (!lastMessage) return 'Start a new conversation';
        if (isTyping) return null;
        if (lastMessage.images?.length > 0) return '📷 Photo';
        if (lastMessage.files?.length > 0) return '📎 File';
        return lastMessage.content || '';
    }, [lastMessage, isTyping]);

    return (
        <motion.div
            whileHover={{ background: bg3 }}
            onClick={() => onSelect(chat.id)}
            style={{
                padding: '16px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isSelected ? 'rgba(232,98,26,.05)' : 'transparent',
                borderLeft: `3px solid ${isSelected ? ORG : 'transparent'}`,
                borderBottom: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12
            }}
        >
            <div style={{ position: 'relative', flexShrink: 0 }}>
                {isGroup ? (
                    <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 4, 
                        background: bg2, 
                        border: `1px solid ${border}`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <Users style={{ width: 20, height: 20, color: ORG }} />
                    </div>
                ) : (
                    <Avatar
                        avatar={isGroup ? chat.avatar : (participant?.avatar || chat.avatar)}
                        initial={isGroup ? (chat.name?.charAt(0)?.toUpperCase() || 'G') : (participant?.initial || chat.initial)}
                        name={displayName}
                        online={isOnline}
                        size="lg"
                    />
                )}
                {isOnline && (
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 2, 
                        right: 2, 
                        width: 10, 
                        height: 10, 
                        background: '#10b981', 
                        borderRadius: '50%', 
                        border: `2px solid ${isSelected ? 'rgba(232,98,26,.05)' : bg}` 
                    }} />
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <h3 style={{ ...bc(14, 700, { color: textC, margin: 0, letterSpacing: 0.5 }) }} className="truncate">
                            {displayName}
                        </h3>
                        {isOnline && <ShieldCheck style={{ width: 12, height: 12, color: '#10b981' }} />}
                    </div>
                    <span style={{ ...ba(10, 400, { color: text3, whiteSpace: 'nowrap' }) }}>
                        {lastMessage?.time || ''}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        {showReadReceipts && (
                            isMessageRead ? <CheckCheck style={{ width: 14, height: 14, color: ORG }} /> : <Check style={{ width: 14, height: 14, color: text3 }} />
                        )}
                        <p style={{ 
                            ...ba(13, isTyping ? 500 : 400, { 
                                color: isTyping ? ORG : unreadCount > 0 ? textC : text3, 
                                margin: 0 
                            }) 
                        }} className="truncate">
                            {isTyping ? 'thinking •••' : lastMessageText}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <div style={{ 
                            background: ORG, 
                            color: '#fff', 
                            ...bc(10, 700), 
                            padding: '2px 6px', 
                            borderRadius: 4, 
                            minWidth: 18, 
                            textAlign: 'center',
                            boxShadow: '0 4px 8px rgba(232,98,26,0.3)'
                        }}>
                            {unreadCount}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ConversationItem;
