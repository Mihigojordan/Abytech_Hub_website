import React from 'react';
import { groupMessagesByDate } from '../../../../utils/chat/dateUtils';
import MessageGroup from '../message/MessageGroup';
import LoadMoreTrigger from '../ui/LoadMoreTrigger';

/**
 * Messages container component - scrollable messages area
 */
import { ArrowDown } from 'lucide-react';

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
    setMessageRef,
    scrollToMessage,
    isTyping,
    showScrollButton,
    scrollToBottom,
    unreadCount
}) => {
    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="flex-1 relative min-h-0">
            <div ref={containerRef} className="h-full overflow-y-auto px-6 py-4">
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
                        scrollToMessage={scrollToMessage}
                    />
                ))}

                {/* Typing Indicator Bubble */}
                {isTyping && (
                    <div className="flex items-center space-x-2 mb-4 ml-4">
                        <div className="flex space-x-1 bg-gray-200 p-2 rounded-2xl rounded-tl-none items-center h-8">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-xs text-gray-400">User is typing...</span>
                    </div>
                )}

                {/* End of messages marker */}
                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to Bottom Button - Fixed at bottom right of container */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-6 right-6 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                >
                    <ArrowDown className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};

export default MessagesContainer;
