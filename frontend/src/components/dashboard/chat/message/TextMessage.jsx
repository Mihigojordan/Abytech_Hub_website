import React from 'react';
import { Clock, MoreVertical } from 'lucide-react';
import { formatTime } from '../../../../utils/chat/dateUtils';
import MessageMenu from './MessageMenu';

/**
 * Text-only message component
 */
const TextMessage = ({ message, onMenuAction, showMenu, setShowMenu, selectionMode }) => {
    return (
        <div className="relative group">
            <div className={`${message.isSent ? 'bg-gray-100' : 'bg-indigo-600 text-white'} rounded-lg px-4 py-3`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className={`flex items-center justify-between text-xs mt-1 ${message.isSent ? 'text-gray-400' : 'text-white opacity-80'}`}>
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(message.timestamp)}
                        {message.edited && (
                            <span className="ml-2 italic">(edited)</span>
                        )}
                    </div>
                </div>
            </div>
            {!selectionMode && (
                <button
                    className={`absolute top-2 ${message.isSent ? 'left-2' : 'right-2'} p-1 ${message.isSent ? 'bg-gray-200' : 'bg-indigo-500'} rounded opacity-0 group-hover:opacity-100 transition-all duration-200`}
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
                    onAction={onMenuAction}
                    position={message.isSent ? 'left' : 'right'}
                />
            )}
        </div>
    );
};

export default TextMessage;
