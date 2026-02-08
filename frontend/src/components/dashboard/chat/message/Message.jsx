import React from 'react';
import { Check } from 'lucide-react';
import Avatar from '../ui/Avatar';
import TextMessage from './TextMessage';
import CombinedMessage from './CombinedMessage';
import useAdminAuth from '../../../../context/AdminAuthContext';

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

    const handleClick = () => {
        if (selectionMode) {
            onToggleSelection(message.id);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        if (!selectionMode) {
            onToggleSelection(message.id, true); // Start selection mode
        }
    };

    // Determine message type to render
    const isTextOnly = message.type === 'text';
    const isCombined = message.type === 'combined' || message.images || message.files;


    return (
        <div
            ref={(el) => setMessageRef && setMessageRef(message.id, el)}
            data-message-id={message.id}
            className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} ${selectionMode ? 'cursor-pointer' : ''
                } ${isSelected ? 'bg-dashboard-50 -mx-2 px-2 py-2 rounded-lg' : ''} transition-all duration-200`}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            {/* Selection checkbox */}
            {selectionMode && (
                <div className="flex items-center mr-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-dashboard-600 border-dashboard-600 scale-110' : 'border-gray-300'
                        }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                </div>
            )}

            {/* Sender avatar (for received messages) */}
            {!message.isSent && (
                <Avatar
                    avatar={message.avatar || conversation?.avatar}
                    initial={message.initial || conversation?.initial}
                    name={message.sender}
                    size="sm"
                    className="mr-3 flex-shrink-0"
                />
            )}

            {/* Message content */}
            <div className={`max-w-md ${message.isSent ? 'items-end' : 'items-start'} flex flex-col`}>
                {!message.isSent && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">{message.sender}</span>
                )}

                {/* Reply indicator */}
                {message.replyTo && (
                    <div
                        className={`${message.isSent ? 'bg-gray-200' : 'bg-dashboard-500/30'} rounded-lg px-3 py-2 mb-2 border-l-2 ${message.isSent ? 'border-dashboard-600' : 'border-white'} cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (scrollToMessage && message.replyTo.id) {
                                scrollToMessage(message.replyTo.id);
                            }
                        }}
                    >
                        <p className={`text-xs ${message.isSent ? 'text-gray-600' : 'text-white/80'} font-medium mb-1`}>
                            Reply to {message.replyTo.sender}
                        </p>
                        <p className={`text-xs ${message.isSent ? 'text-gray-700' : 'text-white/90'} truncate`}>
                            {message.replyTo.type === 'image' && '📷 Image'}
                            {message.replyTo.type === 'file' && '📎 File'}
                            {(message.replyTo.type === 'text' || message.replyTo.type === 'combined') &&
                                (message.replyTo.content || 'Media')}
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

            {/* Current user avatar (for sent messages) */}
            {message.isSent && (
                <Avatar
                    avatar={currentUser?.profileImage}
                    initial={currentUser?.name?.charAt(0)?.toUpperCase()}
                    name={currentUser?.name || 'You'}
                    size="sm"
                    className="ml-3 flex-shrink-0"
                />
            )}
        </div>
    );
};

export default Message;
