import React, { useRef, useState } from 'react';
import { MessageSquare, ArrowDown } from 'lucide-react';
import ChatHeader from '../../components/dashboard/chat/chat-area/ChatHeader';
import MessagesContainer from '../../components/dashboard/chat/chat-area/MessagesContainer';
import MessageInput from '../../components/dashboard/chat/chat-area/MessageInput';
import SelectionModeBar from '../../components/dashboard/chat/chat-area/SelectionModeBar';
import EditReplyBar from '../../components/dashboard/chat/ui/EditReplyBar';
import FilePreview from '../../components/dashboard/chat/ui/FilePreview';
import AddMemberModal from '../../components/dashboard/chat/ui/AddMemberModal';
import ReadByModal from '../../components/dashboard/chat/ui/ReadByModal';

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
    isSending = false
}) => {
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [readByModal, setReadByModal] = useState({ isOpen: false, message: null });

    const handleMembersAdded = (newMembers) => {
        // Notify parent to refresh conversation data
        if (onConversationUpdated) {
            onConversationUpdated(selectedConversation?.id);
        }
    };

    // Wrapper for message actions to handle 'readby' locally
    const handleMessageAction = (action, messageId) => {
        if (action === 'readby') {
            // Find the message and show ReadByModal
            const message = messages.find(m => String(m.id) === String(messageId));
            if (message) {
                setReadByModal({ isOpen: true, message });
                setShowMenu(null);
            }
            return;
        }
        // Pass other actions to parent
        onMessageAction(action, messageId);
    };

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center px-8">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        AbytechHub Chat
                    </h2>
                    <p className="text-gray-600 text-lg mb-2">
                        Select a conversation to start chatting
                    </p>
                    <p className="text-gray-500 text-sm">
                        Choose from your conversations on the left
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white relative">
            {/* Chat Header */}
            <ChatHeader
                conversation={selectedConversation}
                isTyping={isTyping}
                onAddMember={selectedConversation?.isGroup ? () => setShowAddMemberModal(true) : null}
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
                // Pass scroll props to container
                showScrollButton={showScrollButton}
                scrollToBottom={scrollToBottom}
                unreadCount={unreadCount}
            />

            {/* Edit/Reply Preview Bar */}
            <EditReplyBar
                editingMessage={editingMessage}
                replyingTo={replyingTo}
                onCancel={onCancelEditReply}
            />

            {/* File Previews */}
            <FilePreview
                files={uploadedFiles}
                onRemove={onRemoveFile}
                onClearAll={onClearFiles}
            />

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
