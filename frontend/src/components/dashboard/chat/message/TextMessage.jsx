import { MoreVertical, Check, Forward, CheckCheck } from 'lucide-react';
import { formatTime } from '../../../../utils/chat/dateUtils';
import MessageMenu from './MessageMenu';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, ba } from '../../../../utils/homeConstants';
import { parseLinks } from '../../../../utils/chat/parseLinks';

/**
 * Text-only message component
 */
const TextMessage = ({ message, onMenuAction, showMenu, setShowMenu, selectionMode, isGroup = false }) => {
    const { bg3, textC, text3, border } = useDashboardTheme();

    return (
        <div style={{ position: 'relative' }} className="group">
            <div style={{ 
                background: message.isSent ? bg3 : ORG,
                border: message.isSent ? `1px solid ${border}` : 'none',
                borderRadius: message.isSent ? '12px 12px 0 12px' : '12px 12px 12px 0',
                padding: '12px 16px',
                color: message.isSent ? textC : '#fff',
                minWidth: 80,
                maxWidth: '100%',
                boxShadow: message.isSent ? 'none' : '0 10px 20px rgba(232,98,26,0.2)'
            }}>
                {/* Forwarded indicator */}
                {message.isForwarded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, opacity: 0.7 }}>
                        <Forward style={{ width: 10, height: 10 }} />
                        <span style={{ ...ba(10, 400, { fontStyle: 'italic' }) }}>Forwarded</span>
                    </div>
                )}
                
                <p style={{ ...ba(14, 400, { margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }) }}>
                    {parseLinks(message.content).map((seg, i) =>
                        seg.type === 'url' ? (
                            <a
                                key={i}
                                href={seg.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    color: message.isSent ? ORG : 'rgba(255,255,255,0.92)',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: 3,
                                    wordBreak: 'break-all',
                                    cursor: 'pointer',
                                }}
                            >
                                {seg.value}
                            </a>
                        ) : (
                            <span key={i}>{seg.value}</span>
                        )
                    )}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4, opacity: 0.7 }}>
                    <span style={{ ...ba(10, 400) }}>
                        {formatTime(message.timestamp)}
                    </span>
                    {message.edited && <span style={{ ...ba(10, 400, { fontStyle: 'italic' }) }}>(edited)</span>}
                    
                    {message.isSent && (
                        message.isRead ? <CheckCheck style={{ width: 12, height: 12, color: ORG }} /> : <Check style={{ width: 12, height: 12 }} />
                    )}
                </div>
            </div>

            {/* Menu Toggle */}
            {!selectionMode && (
                <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(message.id);
                    }}
                    onContextMenu={(e) => e.stopPropagation()}
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
                    position={message.isSent ? 'left' : 'right'}
                />
            )}
        </div>
    );
};

export default TextMessage;
