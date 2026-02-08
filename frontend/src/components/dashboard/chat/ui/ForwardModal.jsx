import React from 'react';
import { X, Forward, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import ConversationSelector from './ConversationSelector';

/**
 * Forward Modal Component
 * Modal for forwarding messages to one or more conversations
 */
const ForwardModal = ({
    isOpen,
    messages = [],
    conversations = [],
    currentConversationId,
    loading = false,
    onForward,
    onClose
}) => {
    const [selectedConversationIds, setSelectedConversationIds] = React.useState([]);

    if (!isOpen) return null;

    const handleForward = () => {
        if (selectedConversationIds.length > 0) {
            onForward(selectedConversationIds);
        }
    };

    const getMessagePreview = (message) => {
        if (message.type === 'image' || message.images?.length > 0) {
            return (
                <div className="flex items-center gap-2 text-gray-600">
                    <ImageIcon className="w-4 h-4" />
                    <span>Image</span>
                </div>
            );
        }
        if (message.type === 'file' || message.files?.length > 0) {
            return (
                <div className="flex items-center gap-2 text-gray-600">
                    <FileIcon className="w-4 h-4" />
                    <span>File</span>
                </div>
            );
        }
        return (
            <p className="text-gray-700 truncate">{message.content || 'Message'}</p>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Forward className="w-5 h-5 text-dashboard-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Forward Messages</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Selected Messages Preview */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Selected: {messages.length} message{messages.length !== 1 ? 's' : ''}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-32 overflow-y-auto">
                            {messages.slice(0, 3).map((message, index) => (
                                <div key={message.id || index} className="text-sm">
                                    {getMessagePreview(message)}
                                </div>
                            ))}
                            {messages.length > 3 && (
                                <p className="text-xs text-gray-500 italic">
                                    +{messages.length - 3} more message{messages.length - 3 !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Conversation Selector */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                            Select Conversations:
                        </p>
                        <ConversationSelector
                            conversations={conversations}
                            selectedConversationIds={selectedConversationIds}
                            currentConversationId={currentConversationId}
                            onSelectionChange={setSelectedConversationIds}
                        />
                    </div>

                    {/* Selection Count */}
                    {selectedConversationIds.length > 0 && (
                        <div className="bg-dashboard-50 border border-dashboard-200 rounded-lg p-3">
                            <p className="text-sm text-dashboard-700 font-medium">
                                {selectedConversationIds.length} conversation{selectedConversationIds.length !== 1 ? 's' : ''} selected
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleForward}
                        disabled={loading || selectedConversationIds.length === 0}
                        className="px-6 py-2 bg-dashboard-600 hover:bg-dashboard-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Forwarding...</span>
                            </>
                        ) : (
                            <>
                                <Forward className="w-4 h-4" />
                                <span>
                                    Forward to {selectedConversationIds.length || '...'}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForwardModal;
