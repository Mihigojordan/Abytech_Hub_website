import React from 'react';
import { groupMessagesByDate } from '../../../../utils/chat/dateUtils';
import MessageGroup from '../message/MessageGroup';
import LoadMoreTrigger from '../ui/LoadMoreTrigger';

/**
 * Messages container component - scrollable messages area
 */
const MessagesContainer = ({
    messages,
    hasMore,
    isLoadingMore,
    loadMoreTriggerRef,
    messagesEndRef,
    containerRef,
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
    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4">
            {/* Load more trigger */}
            <LoadMoreTrigger
                hasMore={hasMore}
                isLoading={isLoadingMore}
                triggerRef={loadMoreTriggerRef}
            />

            {/* Message groups */}
            {groupedMessages.map((group, groupIndex) => (
                <MessageGroup
                    key={groupIndex}
                    group={group}
                    selectedMessages={selectedMessages}
                    selectionMode={selectionMode}
                    onToggleSelection={onToggleSelection}
                    onMessageAction={onMessageAction}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    onMediaView={onMediaView}
                    conversation={conversation}
                    setMessageRef={setMessageRef}
                />
            ))}

            {/* End of messages marker */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessagesContainer;
