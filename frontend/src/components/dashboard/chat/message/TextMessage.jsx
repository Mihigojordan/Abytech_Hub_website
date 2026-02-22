import React from 'react';
import { Clock, MoreVertical, Check, Forward } from 'lucide-react';
import { formatTime } from '../../../../utils/chat/dateUtils';
import MessageMenu from './MessageMenu';

/**
 * Text-only message component
 */
const TextMessage = ({ message, onMenuAction, showMenu, setShowMenu, selectionMode, isGroup = false }) => {



    return (
        <div className="relative group">
            <div className={`${message.isSent ? 'bg-gray-100' : 'bg-dashboard-600 text-white'} rounded-lg px-4 py-3`}>
                {/* Forwarded indicator */}
                {message.isForwarded && (
                    <div className={`flex items-center gap-1 text-xs mb-1 ${message.isSent ? 'text-gray-500' : 'text-white/70'}`}>
                        <Forward className="w-3 h-3" />
                        <span className="italic">Forwarded</span>
                    </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
                <div className={`flex items-center justify-between text-xs mt-1 ${message.isSent ? 'text-gray-400' : 'text-white opacity-80'}`}>
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(message.timestamp)}
                        {message.edited && (
                            <span className="ml-2 italic">(edited)</span>
                        )}
                        {/* Read receipts for sent messages */}
                        {message.isSent && (
                            <span className={`ml-2 ${message.isRead ? 'text-blue-200' : 'text-gray-400'}`}>
                                {message.isRead ? (
                                    <div className="flex -space-x-1">
                                        <Check className="w-3 h-3" />
                                        <Check className="w-3 h-3" />
                                    </div>
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {!selectionMode && (
                <button
                    className={`absolute top-2 ${message.isSent ? 'left-2' : 'right-2'} p-1 ${message.isSent ? 'bg-gray-200' : 'bg-dashboard-500'} rounded opacity-0 group-hover:opacity-100 transition-all duration-200`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(message.id);
                    }}
                >
                    <MoreVertical className={`w-4 h-4 ${message.isSent ? 'text-gray-600' : 'text-white'}`} />
                </button>
            )}
            {showMenu === message.id && (
                <MessageMenu
                    messageId={message.id}
                    isSent={message.isSent}
                    isGroup={isGroup}
                    onAction={onMenuAction}
                    position={message.isSent ? 'left' : 'right'}
                />
            )}
        </div>
    );
};

export default TextMessage;
