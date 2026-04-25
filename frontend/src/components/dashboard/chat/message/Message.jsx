import React from 'react';
import { Check, CornerUpLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import TextMessage from './TextMessage';
import CombinedMessage from './CombinedMessage';
import useAdminAuth from '../../../../context/AdminAuthContext';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Individual message wrapper component
 */
const Message = ({
    message,
    isSelected,
    selectionMode,
    onToggleSelection,
    onAction,
    showMenu,
    setShowMenu,
    onMediaView,
    conversation,
    setMessageRef,
    scrollToMessage
}) => {
    const { user: currentUser } = useAdminAuth();
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    const handleClick = () => {
        if (selectionMode) {
            onToggleSelection(message.id);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (!selectionMode) {
            onToggleSelection(message.id, true);
        }
    };

    // Determine message type to render
    const isTextOnly = message.type === 'text';
    const isCombined = message.type === 'combined' || message.images || message.files;

    return (
        <div
            ref={(el) => setMessageRef && setMessageRef(message.id, el)}
            data-message-id={message.id}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            style={{
                display: 'flex',
                justifyContent: message.isSent ? 'flex-end' : 'flex-start',
                padding: '4px 32px',
                width: '100%',
                position: 'relative',
                background: isSelected ? 'rgba(232,98,26,.05)' : 'transparent',
                transition: 'all 0.2s',
                cursor: selectionMode ? 'pointer' : 'default'
            }}
        >
            {/* Selection checkbox */}
            {selectionMode && (
                <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                    <div style={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: 4, 
                        border: `1px solid ${isSelected ? ORG : border}`, 
                        background: isSelected ? ORG : 'transparent',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}>
                        {isSelected && <Check style={{ width: 12, height: 12, color: '#fff' }} />}
                    </div>
                </div>
            )}

            <div style={{ 
                display: 'flex', 
                flexDirection: message.isSent ? 'row-reverse' : 'row', 
                gap: 12, 
                maxWidth: '85%',
                alignItems: 'flex-end'
            }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                    <Avatar
                        avatar={message.isSent ? currentUser?.profileImage : (message.avatar || conversation?.avatar)}
                        initial={message.isSent ? currentUser?.name?.charAt(0) : (message.initial || conversation?.initial)}
                        name={message.isSent ? 'You' : message.sender}
                        size="xs"
                    />
                </div>

                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: message.isSent ? 'flex-end' : 'flex-start', minWidth: 0 }}>
                    {!message.isSent && (
                        <span style={{ ...ba(11, 600, { color: text3, marginBottom: 4, marginLeft: 4 }) }}>{message.sender}</span>
                    )}

                    {/* Reply indicator */}
                    {message.replyTo && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                if (scrollToMessage && message.replyTo.id) {
                                    scrollToMessage(message.replyTo.id);
                                }
                            }}
                            style={{
                                background: bg2,
                                borderLeft: `2px solid ${ORG}`,
                                borderRadius: 4,
                                padding: '6px 12px',
                                marginBottom: 4,
                                cursor: 'pointer',
                                opacity: 0.8,
                                maxWidth: 300
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <CornerUpLeft style={{ width: 10, height: 10, color: ORG }} />
                                <span style={{ ...ba(10, 700, { color: ORG }) }}>{message.replyTo.sender}</span>
                            </div>
                            <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }} className="truncate">
                                {message.replyTo.content || (message.replyTo.images ? '📷 Image' : '📎 Attachment')}
                            </p>
                        </div>
                    )}

                    {/* Render appropriate message type */}
                    {isCombined ? (
                        <CombinedMessage
                            message={message}
                            onMenuAction={onAction}
                            showMenu={showMenu}
                            setShowMenu={setShowMenu}
                            onMediaView={onMediaView}
                            selectionMode={selectionMode}
                            isGroup={conversation?.isGroup || false}
                        />
                    ) : isTextOnly ? (
                        <TextMessage
                            message={message}
                            onMenuAction={onAction}
                            showMenu={showMenu}
                            setShowMenu={setShowMenu}
                            selectionMode={selectionMode}
                            isGroup={conversation?.isGroup || false}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Message;
