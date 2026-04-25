import React from 'react';
import { Clock, MoreVertical, Check, Forward, CheckCheck } from 'lucide-react';
import { formatTime } from '../../../../utils/chat/dateUtils';
import ImageAttachment from './ImageAttachment';
import FileAttachment from './FileAttachment';
import MessageMenu from './MessageMenu';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

/**
 * Combined message component (text + images + files)
 */
const CombinedMessage = ({ message, onMenuAction, showMenu, setShowMenu, onMediaView, selectionMode, isGroup = false }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    const handleMediaClick = () => {
        const allMedia = [
            ...(message.images || []).map(url => ({ type: 'image', url })),
            ...(message.files || []).map(f => ({ type: 'file', name: f.fileName, size: f.fileSize, fileUrl: f.fileUrl, url: f }))
        ];
        onMediaView(allMedia, 0, message.timestamp);
    };

    const handleFileClick = (fileIndex) => {
        const allMedia = [
            ...(message.images || []).map(url => ({ type: 'image', url: url })),
            ...(message.files || []).map(f => ({ type: 'file', name: f.fileName, size: f.fileSize, fileUrl: f.fileUrl, url: f }))
        ];
        const index = (message.images?.length || 0) + fileIndex;
        onMediaView(allMedia, index, message.timestamp);
    };

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }} className="group">
            {/* Forwarded indicator */}
            {message.isForwarded && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7 }}>
                    <Forward style={{ width: 10, height: 10, color: text3 }} />
                    <span style={{ ...ba(10, 400, { color: text3, fontStyle: 'italic' }) }}>Forwarded</span>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                <div style={{ 
                    background: message.isSent ? bg3 : ORG,
                    border: message.isSent ? `1px solid ${border}` : 'none',
                    borderRadius: message.isSent ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    padding: '12px 16px',
                    color: message.isSent ? textC : '#fff',
                    boxShadow: message.isSent ? 'none' : '0 10px 20px rgba(232,98,26,0.2)'
                }}>
                    <p style={{ ...ba(14, 400, { margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }) }}>
                        {message.content}
                    </p>
                </div>
            )}

            {/* Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, opacity: 0.7 }}>
                <span style={{ ...ba(10, 400, { color: text3 }) }}>
                    {formatTime(message.timestamp)}
                </span>
                {message.edited && <span style={{ ...ba(10, 400, { color: text3, fontStyle: 'italic' }) }}>(edited)</span>}

                {message.isSent && (
                    message.isRead ? <CheckCheck style={{ width: 12, height: 12, color: ORG }} /> : <Check style={{ width: 12, height: 12, color: text3 }} />
                )}
            </div>

            {/* Menu Toggle */}
            {!selectionMode && (
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(message.id);
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        [message.isSent ? 'left' : 'right']: -40,
                        background: 'none',
                        border: 'none',
                        color: text3,
                        cursor: 'pointer',
                        padding: 8
                    }}
                >
                    <MoreVertical style={{ width: 16, height: 16 }} />
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
