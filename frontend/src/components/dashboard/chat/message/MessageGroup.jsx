import Message from './Message';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { bc } from '../../../../utils/homeConstants';

/**
 * Message group component - groups messages by date with date label.
 * Computes WhatsApp-style sequence metadata so consecutive messages from
 * the same sender only show the sender name on the first and avatar on the last.
 */
const MessageGroup = ({
    group,
    selectedMessages,
    selectionMode,
    onToggleSelection,
    onMessageAction,
    showMenu,
    setShowMenu,
    onMediaView,
    conversation,
    setMessageRef,
    scrollToMessage,
    onCallBack,
    onSendMessage,
}) => {
    const { bg2, text3, border } = useDashboardTheme();

    return (
        <div style={{ marginBottom: 32 }}>
            {/* Date label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 32, right: 32, height: 1, background: border, zIndex: 1 }} />
                <span style={{
                    position: 'relative', zIndex: 2, padding: '4px 16px',
                    background: bg2, border: `1px solid ${border}`, borderRadius: 4,
                    ...bc(10, 700, { color: text3, textTransform: 'uppercase', letterSpacing: 1 })
                }}>
                    {group.label}
                </span>
            </div>

            {/* Messages with sequence grouping */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {group.messages.map((message, i) => {
                    const prev = group.messages[i - 1];
                    const next = group.messages[i + 1];

                    // Same sender = same isSent flag + same senderId
                    const sameAsPrev = prev &&
                        prev.isSent === message.isSent &&
                        String(prev.senderId) === String(message.senderId);

                    const sameAsNext = next &&
                        next.isSent === message.isSent &&
                        String(next.senderId) === String(message.senderId);

                    // Only show name on the first message in a consecutive sequence (received only)
                    const showSenderName = !message.isSent && !sameAsPrev;
                    // Only show avatar on the last message in a consecutive sequence
                    const showAvatar = !sameAsNext;
                    // Tighter vertical gap for mid-sequence messages
                    const isSelected = selectedMessages.includes(message.id);

                    return (
                        <Message
                            key={message.id}
                            message={message}
                            isSelected={isSelected}
                            selectionMode={selectionMode}
                            onToggleSelection={onToggleSelection}
                            onAction={onMessageAction}
                            showMenu={showMenu}
                            setShowMenu={setShowMenu}
                            onMediaView={onMediaView}
                            conversation={conversation}
                            setMessageRef={setMessageRef}
                            scrollToMessage={scrollToMessage}
                            showSenderName={showSenderName}
                            showAvatar={showAvatar}
                            isSequenced={!!sameAsPrev}
                            onCallBack={onCallBack}
                            onSendMessage={onSendMessage}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MessageGroup;
