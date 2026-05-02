import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ChatHeader from '../../components/dashboard/chat/chat-area/ChatHeader';
import MessagesContainer from '../../components/dashboard/chat/chat-area/MessagesContainer';
import MessageInput from '../../components/dashboard/chat/chat-area/MessageInput';
import SelectionModeBar from '../../components/dashboard/chat/chat-area/SelectionModeBar';
import EditReplyBar from '../../components/dashboard/chat/ui/EditReplyBar';
import FilePreview from '../../components/dashboard/chat/ui/FilePreview';
import AddMemberModal from '../../components/dashboard/chat/ui/AddMemberModal';
import ReadByModal from '../../components/dashboard/chat/ui/ReadByModal';
import InfoPanel from '../../components/dashboard/chat/ui/InfoPanel';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../utils/homeConstants';
import { motion } from 'framer-motion';

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
    setMessageRef,
    scrollToMessage,
    unreadCount = 0,
    onConversationUpdated,
    isSending = false,
    onBack,
    onRemoveMember,
    currentUserRole,
}) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [readByModal, setReadByModal] = useState({ isOpen: false, message: null });
    const [showInfoPanel, setShowInfoPanel] = useState(false);

    const handleMembersAdded = () => {
        if (onConversationUpdated) onConversationUpdated(selectedConversation?.id);
    };

    const handleMessageAction = (action, messageId) => {
        if (action === 'readby') {
            const message = messages.find(m => String(m.id) === String(messageId));
            if (message) { setReadByModal({ isOpen: true, message }); setShowMenu(null); }
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
                        width: 100, height: 100, background: bg2, border: `1px solid ${border}`,
                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
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
            <ChatHeader
                conversation={selectedConversation}
                isTyping={isTyping}
                onAddMember={selectedConversation?.isGroup ? () => setShowAddMemberModal(true) : null}
                onBack={onBack}
                onInfoClick={() => setShowInfoPanel(true)}
                onRemoveMember={onRemoveMember}
                currentUserRole={currentUserRole}
            />

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
                scrollToMessage={scrollToMessage}
                isTyping={isTyping}
                showScrollButton={showScrollButton}
                scrollToBottom={scrollToBottom}
                unreadCount={unreadCount}
            />

            {/* Floating overlays above input */}
            <div style={{ position: 'absolute', bottom: selectionMode ? 0 : 85, left: 0, right: 0, zIndex: 20 }}>
                <EditReplyBar editingMessage={editingMessage} replyingTo={replyingTo} onCancel={onCancelEditReply} />
                <FilePreview files={uploadedFiles} onRemove={onRemoveFile} onClearAll={onClearFiles} />
            </div>

            {selectionMode ? (
                <SelectionModeBar
                    selectedCount={selectedMessages.length}
                    selectedMessages={selectedMessages}
                    allMessages={messages}
                    onCancel={onCancelSelection}
                    onBulkAction={onBulkAction}
                />
            ) : (
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

            <AddMemberModal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                conversation={selectedConversation}
                onMembersAdded={handleMembersAdded}
                currentUserRole={currentUserRole}
            />

            <ReadByModal
                isOpen={readByModal.isOpen}
                onClose={() => setReadByModal({ isOpen: false, message: null })}
                message={readByModal.message}
                participantCount={selectedConversation?.participants?.length || 0}
            />

            <InfoPanel
                isOpen={showInfoPanel}
                conversation={selectedConversation}
                messages={messages}
                onClose={() => setShowInfoPanel(false)}
            />
        </div>
    );
};

export default ChatArea;
