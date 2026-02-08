import React from 'react';
import { Clock, MoreVertical, Check, Forward } from 'lucide-react';
import { formatTime } from '../../../../utils/chat/dateUtils';
import ImageAttachment from './ImageAttachment';
import FileAttachment from './FileAttachment';
import MessageMenu from './MessageMenu';

/**
 * Combined message component (text + images + files)
 */
const CombinedMessage = ({ message, onMenuAction, showMenu, setShowMenu, onMediaView, selectionMode, isGroup = false }) => {
    const handleMediaClick = () => {
        const allMedia = [
            ...(message.images || []).map(url => ({ type: 'image', url })),
            ...(message.files || []).map(f => ({ type: 'file', name: f.fileName, size: f.fileSize }))
        ];
        onMediaView(allMedia, 0, message.timestamp);
    };

    const handleFileClick = (fileIndex) => {
        const allMedia = [
            ...(message.images || []).map(url => ({ type: 'image', url: url })),
            ...(message.files || []).map(f => ({ type: 'file', name: f.fileName, size: f.fileSize }))
        ];
        const index = (message.images?.length || 0) + fileIndex;
        onMediaView(allMedia, index, message.timestamp);
    };

    return (
        <div className="relative group space-y-2 max-w-md">
            {/* Forwarded indicator */}
            {message.isForwarded && (
                <div className={`flex items-center gap-1 text-xs ${message.isSent ? 'text-gray-500' : 'text-gray-500'}`}>
                    <Forward className="w-3 h-3" />
                    <span className="italic">Forwarded</span>
                </div>
            )}

            {/* Images */}
            {message.images && message.images.length > 0 && (
                <ImageAttachment
                    images={message.images}
                    isSent={message.isSent}
                    onClick={handleMediaClick}
                />
            )}

            {/* Files */}
            {message.files && message.files.length > 0 && (
                <div className="space-y-1">
                    {message.files.map((file, idx) => (
                        <FileAttachment
                            key={idx}
                            file={file}
                            isSent={message.isSent}
                            onClick={() => handleFileClick(idx)}
                        />
                    ))}
                </div>
            )}

            {/* Text content */}
            {message.content && (
                <div className={`${message.isSent ? 'bg-gray-100' : 'bg-dashboard-600 text-white'} rounded-lg px-4 py-3`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
            )}

            {/* Timestamp */}
            <div className={`flex items-center text-xs ${message.isSent ? 'text-gray-400' : 'text-gray-500'}`}>
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(message.timestamp)}
                 {message.edited && (
                            <span className="ml-2 italic">(edited)</span>
                        )}

                {/* Read receipts for sent messages */}
                {message.isSent && (
                    <span className={`ml-2 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`}>
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

            {/* Menu button */}
            {!selectionMode && (
                <button
                    className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded opacity-0 group-hover:opacity-100 transition-all duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(message.id);
                    }}
                >
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
            )}
            {showMenu === message.id && (
                <MessageMenu
                    messageId={message.id}
                    isSent={message.isSent}
                    isGroup={isGroup}
                    onAction={onMenuAction}
                    position="right"
                />
            )}
        </div>
    );
};

export default CombinedMessage;
