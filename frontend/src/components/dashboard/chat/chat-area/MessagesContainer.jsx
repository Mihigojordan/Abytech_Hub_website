import React from 'react';
import { groupMessagesByDate } from '../../../../utils/chat/dateUtils';
import MessageGroup from '../message/MessageGroup';
import LoadMoreTrigger from '../ui/LoadMoreTrigger';
import { ArrowDown, MessageSquare, Sparkles } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Skeleton loader for a single message
 */
const MessageSkeleton = ({ isSent }) => {
    const { bg2, bg3, border } = useDashboardTheme();
    return (
        <div style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start', marginBottom: 24, padding: '0 20px' }}>
            {!isSent && (
                <div style={{ width: 32, height: 32, borderRadius: 4, background: bg3, border: `1px solid ${border}`, marginRight: 12, flexShrink: 0 }} className="animate-pulse" />
            )}
            <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isSent ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: 4, 
                    background: isSent ? 'rgba(232,98,26,.1)' : bg2,
                    border: `1px solid ${isSent ? 'rgba(232,98,26,.2)' : border}`,
                    width: 'fit-content'
                }} className="animate-pulse">
                    <div style={{ height: 10, background: bg3, borderRadius: 2, width: 80, marginBottom: 8 }} />
                    <div style={{ height: 10, background: bg3, borderRadius: 2, width: 140 }} />
                </div>
                <div style={{ height: 8, background: bg3, borderRadius: 2, width: 40, marginTop: 8 }} className="animate-pulse" />
            </div>
        </div>
    );
};

/**
 * Loading skeleton for initial message load
 */
const MessagesLoadingSkeleton = () => (
    <div style={{ padding: '24px 0' }}>
        <MessageSkeleton isSent={false} />
        <MessageSkeleton isSent={true} />
        <MessageSkeleton isSent={false} />
        <MessageSkeleton isSent={true} />
    </div>
);

/**
 * Empty state when no messages
 */
const EmptyMessagesState = () => {
    const { text2, text3, bg2, border } = useDashboardTheme();
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', itemsCenter: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 32px' }}>
            <div style={{ 
                width: 64, 
                height: 64, 
                background: bg2, 
                border: `1px solid ${border}`, 
                borderRadius: 12, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 24px' 
            }}>
                <MessageSquare style={{ width: 28, height: 28, color: ORG }} />
            </div>
            <h3 style={{ ...bc(18, 700, { color: ORG, margin: '0 0 12px' }) }}>No Messages Yet</h3>
            <p style={{ ...ba(14, 400, { color: text2, margin: 0, maxWidth: 280, lineHeight: 1.5 }) }}>
                Break the ice! Start the conversation by sending a message below.
            </p>
        </div>
    );
};

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
    unreadCount,
    onCallBack,
    onSendMessage,
}) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
    const groupedMessages = groupMessagesByDate(messages);
    const hasMessages = messages && messages.length > 0;

    return (
        <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
            <div 
                ref={containerRef} 
                style={{ height: '100%', overflowY: 'auto', padding: '24px 0' }} 
                className="custom-scrollbar"
            >
                {isLoadingInitial && !hasMessages && (
                    <MessagesLoadingSkeleton />
                )}

                {!isLoadingInitial && !hasMessages && !isTyping && (
                    <EmptyMessagesState />
                )}

                {hasMessages && (
                    <LoadMoreTrigger
                        hasMore={hasMore}
                        isLoading={isLoadingMore}
                        triggerRef={loadMoreTriggerRef}
                    />
                )}

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
                        onCallBack={onCallBack}
                        onSendMessage={onSendMessage}
                    />
                ))}

                {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '0 32px' }}>
                        <div style={{ 
                            display: 'flex', 
                            gap: 4, 
                            background: bg2, 
                            border: `1px solid ${border}`, 
                            padding: '8px 12px', 
                            borderRadius: '4px 4px 4px 0' 
                        }}>
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} style={{ width: 6, height: 6, background: ORG, borderRadius: '50%' }} />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} style={{ width: 6, height: 6, background: ORG, borderRadius: '50%' }} />
                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} style={{ width: 6, height: 6, background: ORG, borderRadius: '50%' }} />
                        </div>
                        <span style={{ ...ba(11, 400, { color: text3 }) }}>Thinking...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToBottom}
                        style={{
                            position: 'absolute',
                            bottom: 24,
                            right: 32,
                            width: 44,
                            height: 44,
                            background: ORG,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 20px rgba(232,98,26,0.3)',
                            cursor: 'pointer',
                            zIndex: 30
                        }}
                    >
                        <ArrowDown style={{ width: 20, height: 20 }} />
                        {unreadCount > 0 && (
                            <motion.span 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                style={{ 
                                    position: 'absolute', 
                                    top: -8, 
                                    right: -8, 
                                    background: '#ef4444', 
                                    color: '#fff', 
                                    fontSize: 10, 
                                    fontWeight: 'bold', 
                                    width: 20, 
                                    height: 20, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    borderRadius: '50%',
                                    border: `2px solid ${bg}`
                                }}
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MessagesContainer;
