import React from 'react';
import Message from './Message';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

/**
 * Message group component - groups messages by date with date label
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
    scrollToMessage
}) => {
    const { bg2, text3, border } = useDashboardTheme();

    return (
        <div style={{ marginBottom: 32 }}>
            {/* Date label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 32, right: 32, height: 1, background: border, zIndex: 1 }} />
                <span style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    px: 16, 
                    padding: '4px 16px',
                    background: bg2, 
                    border: `1px solid ${border}`,
                    borderRadius: 4,
                    ...bc(10, 700, { color: text3, textTransform: 'uppercase', letterSpacing: 1 })
                }}>
                    {group.label}
                </span>
            </div>

            {/* Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.messages.map((message) => {
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
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MessageGroup;
