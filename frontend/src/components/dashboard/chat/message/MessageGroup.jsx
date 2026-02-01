import React from 'react';
import Message from './Message';

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
    setMessageRef
}) => {
    return (
        <div>
            {/* Date label */}
            <div className="flex justify-center mb-6">
                <span className="px-4 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {group.label}
                </span>
            </div>

            {/* Messages */}
            <div className="space-y-6">
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
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default MessageGroup;
