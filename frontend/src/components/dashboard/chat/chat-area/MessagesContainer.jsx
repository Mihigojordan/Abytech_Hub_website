import React from 'react';
import { groupMessagesByDate } from '../../../../utils/chat/dateUtils';
import MessageGroup from '../message/MessageGroup';
import LoadMoreTrigger from '../ui/LoadMoreTrigger';
import { ArrowDown, MessageSquare } from 'lucide-react';

/**
 * Skeleton loader for a single message
 */
const MessageSkeleton = ({ isSent }) => (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isSent && (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-2 flex-shrink-0" />
        )}
        <div className={`max-w-[70%] ${isSent ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-2xl p-3 ${isSent ? 'bg-dashboard-100' : 'bg-gray-100'}`}>
                <div className="h-4 bg-gray-300 rounded animate-pulse w-32 mb-2" />
                <div className="h-4 bg-gray-300 rounded animate-pulse w-48" />
            </div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mt-1" />
        </div>
    </div>
);

/**
 * Loading skeleton for initial message load
 */
const MessagesLoadingSkeleton = () => (
    <div className="space-y-4 p-4">
        <MessageSkeleton isSent={false} />
        <MessageSkeleton isSent={true} />
        <MessageSkeleton isSent={false} />
        <MessageSkeleton isSent={true} />
        <MessageSkeleton isSent={false} />
    </div>
);

/**
 * Empty state when no messages
 */
const EmptyMessagesState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16 h-full">
        <div className="w-16 h-16 bg-dashboard-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-dashboard-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No messages yet</h3>
        <p className="text-gray-500 text-sm max-w-xs">
            Start the conversation by sending a message below.
        </p>
    </div>
);

/**
 * Messages container component - scrollable messages area
 */
const MessagesContainer = ({
    messages,
    hasMore,
    isLoadingMore,
    isLoadingInitial = false,
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
    const hasMessages = messages && messages.length > 0;

    return (
        <div className="flex-1 relative min-h-0">
            <div ref={containerRef} className="h-full overflow-y-auto px-6 py-4">
                {/* Loading skeleton for initial load */}
                {isLoadingInitial && !hasMessages && (
                    <MessagesLoadingSkeleton />
                )}

                {/* Empty state when no messages and not loading */}
                {!isLoadingInitial && !hasMessages && !isTyping && (
                    <EmptyMessagesState />
                )}

                {/* Load more trigger - only show when there are messages */}
                {hasMessages && (
                    <LoadMoreTrigger
                        hasMore={hasMore}
                        isLoading={isLoadingMore}
                        triggerRef={loadMoreTriggerRef}
                    />
                )}

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
                    className="absolute bottom-6 right-6 p-3 bg-dashboard-600 hover:bg-dashboard-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
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
