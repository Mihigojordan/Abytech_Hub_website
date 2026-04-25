import React, { useRef, useState } from 'react';
import { MessageSquare, ArrowDown, Sparkles } from 'lucide-react';
import ChatHeader from '../../components/dashboard/chat/chat-area/ChatHeader';
import MessagesContainer from '../../components/dashboard/chat/chat-area/MessagesContainer';
import MessageInput from '../../components/dashboard/chat/chat-area/MessageInput';
import SelectionModeBar from '../../components/dashboard/chat/chat-area/SelectionModeBar';
import EditReplyBar from '../../components/dashboard/chat/ui/EditReplyBar';
import FilePreview from '../../components/dashboard/chat/ui/FilePreview';
import AddMemberModal from '../../components/dashboard/chat/ui/AddMemberModal';
import ReadByModal from '../../components/dashboard/chat/ui/ReadByModal';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * ChatArea layout component - right panel (main chat interface)
 */
const ChatArea = ({
    selectedConversation,
    messages,
    hasMore,
    isLoadingMore,
    isLoadingInitial = false,
    showScrollButton,
    scrollToBottom,
    loadMoreTriggerRef,
    messagesEndRef,
    messagesContainerRef,
    messageInput,
    onMessageInputChange,
    onSendMessage,
    textareaRef,
    fileInputRef,
    imageInputRef,
    onFileUpload,
    uploadedFiles,
    onRemoveFile,
    onClearFiles,
    editingMessage,
    replyingTo,
    onCancelEditReply,
    selectionMode,
    selectedMessages,
    onCancelSelection,
    onBulkAction,
    isTyping,
    showMenu,
    setShowMenu,
    onToggleSelection,
    onMessageAction,
    onMediaView,
    allMessages,
    setMessageRef,
    unreadCount = 0,
    onConversationUpdated,
    isSending = false,
    onBack
}) => {
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [readByModal, setReadByModal] = useState({ isOpen: false, message: null });

    const handleMembersAdded = (newMembers) => {
        if (onConversationUpdated) {
            onConversationUpdated(selectedConversation?.id);
        }
    };

    const handleMessageAction = (action, messageId) => {
        if (action === 'readby') {
            const message = messages.find(m => String(m.id) === String(messageId));
            if (message) {
                setReadByModal({ isOpen: true, message });
                setShowMenu(null);
            }
            return;
        }
        onMessageAction(action, messageId);
    };

    if (!selectedConversation) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, height: '100%' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}
                >
                    <div style={{ 
                        width: 100, 
                        height: 100, 
                        background: bg2, 
                        border: `1px solid ${border}`, 
                        borderRadius: 12, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <Sparkles style={{ width: 40, height: 40, color: ORG }} />
                    </div>
                    <h2 style={{ ...bb(32, { color: textC, margin: '0 0 16px' }) }}>
                        Abytech Hub <span style={{ color: ORG }}>Secure</span> Chat
                    </h2>
                    <p style={{ ...ba(16, 400, { color: text2, lineHeight: 1.6, margin: '0 0 24px' }) }}>
                        Connect instantly with your team. Select a conversation from the list to start messaging.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <div style={{ padding: '8px 16px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, ...bc(11, 700, { color: text3, textTransform: 'uppercase' }) }}>
                            Encrypted
                        </div>
                        <div style={{ padding: '8px 16px', background: bg3, border: `1px solid ${border}`, borderRadius: 4, ...bc(11, 700, { color: text3, textTransform: 'uppercase' }) }}>
                            Real-time
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bg, position: 'relative', height: '100%', overflow: 'hidden' }}>
            {/* Chat Header */}
            <ChatHeader
                conversation={selectedConversation}
                isTyping={isTyping}
                onAddMember={selectedConversation?.isGroup ? () => setShowAddMemberModal(true) : null}
                onBack={onBack}
            />

            {/* Messages Container */}
            <MessagesContainer
                messages={messages}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                isLoadingInitial={isLoadingInitial}
                loadMoreTriggerRef={loadMoreTriggerRef}
                messagesEndRef={messagesEndRef}
                containerRef={messagesContainerRef}
                selectedMessages={selectedMessages}
                selectionMode={selectionMode}
                onToggleSelection={onToggleSelection}
                onMessageAction={handleMessageAction}
                showMenu={showMenu}
                setShowMenu={setShowMenu}
                onMediaView={onMediaView}
                conversation={selectedConversation}
                setMessageRef={setMessageRef}
                isTyping={isTyping}
                showScrollButton={showScrollButton}
                scrollToBottom={scrollToBottom}
                unreadCount={unreadCount}
            />

            {/* Overlay components (Floating) */}
            <div style={{ position: 'absolute', bottom: selectionMode ? 0 : 85, left: 0, right: 0, zIndex: 20 }}>
                <EditReplyBar
                    editingMessage={editingMessage}
                    replyingTo={replyingTo}
                    onCancel={onCancelEditReply}
                />
                <FilePreview
                    files={uploadedFiles}
                    onRemove={onRemoveFile}
                    onClearAll={onClearFiles}
                />
            </div>

            {/* Selection Mode Bar */}
            {selectionMode ? (
                <SelectionModeBar
                    selectedCount={selectedMessages.length}
                    selectedMessages={selectedMessages}
                    allMessages={messages}
                    onCancel={onCancelSelection}
                    onBulkAction={onBulkAction}
                />
            ) : (
                /* Message Input */
                <MessageInput
                    value={messageInput}
                    onChange={onMessageInputChange}
                    onSend={onSendMessage}
                    textareaRef={textareaRef}
                    fileInputRef={fileInputRef}
                    imageInputRef={imageInputRef}
                    onFileUpload={onFileUpload}
                    isSending={isSending}
                />
            )}

            {/* Add Member Modal for Groups */}
            <AddMemberModal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                conversation={selectedConversation}
                onMembersAdded={handleMembersAdded}
            />

            {/* Read By Modal for Groups */}
            <ReadByModal
                isOpen={readByModal.isOpen}
                onClose={() => setReadByModal({ isOpen: false, message: null })}
                message={readByModal.message}
                participantCount={selectedConversation?.participants?.length || 0}
            />
        </div>
    );
};

export default ChatArea;
