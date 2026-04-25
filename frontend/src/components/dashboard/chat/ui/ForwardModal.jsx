import React from 'react';
import { X, Forward, Image as ImageIcon, FileText } from 'lucide-react';
import ConversationSelector from './ConversationSelector';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    if (!isOpen) return null;

    const handleForward = () => {
        if (selectedConversationIds.length > 0) {
            onForward(selectedConversationIds);
        }
    };

    const getMessagePreview = (message) => {
        if (message.type === 'image' || message.images?.length > 0) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: text2 }}>
                    <ImageIcon style={{ width: 14, height: 14 }} />
                    <span style={{ ...ba(12, 500) }}>Image Attachment</span>
                </div>
            );
        }
        if (message.type === 'file' || message.files?.length > 0) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: text2 }}>
                    <FileText style={{ width: 14, height: 14 }} />
                    <span style={{ ...ba(12, 500) }}>File Attachment</span>
                </div>
            );
        }
        return (
            <p style={{ ...ba(12, 400, { color: textC, margin: 0 }) }} className="truncate">
                {message.content || 'Message'}
            </p>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 999, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 16 
                }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(7,20,24,0.8)', backdropFilter: 'blur(4px)' }}
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{ 
                            position: 'relative', 
                            background: bg, 
                            border: `1px solid ${border}`, 
                            borderRadius: 12, 
                            width: '100%', 
                            maxWidth: 480, 
                            maxHeight: '90vh', 
                            display: 'flex', 
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            padding: '24px 32px', 
                            borderBottom: `1px solid ${border}` 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ padding: 8, background: 'rgba(232,98,26,0.1)', borderRadius: 8 }}>
                                    <Forward style={{ width: 20, height: 20, color: ORG }} />
                                </div>
                                <h2 style={{ ...bb(24, { color: textC, margin: 0 }) }}>Forward Messages</h2>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, background: bg2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                disabled={loading}
                                style={{ 
                                    padding: 8, 
                                    background: 'none', 
                                    border: 'none', 
                                    borderRadius: 8, 
                                    cursor: 'pointer', 
                                    color: text3,
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                <X style={{ width: 20, height: 20 }} />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            {/* Selected Messages Preview */}
                            <div style={{ marginBottom: 32 }}>
                                <p style={{ ...ba(12, 700, { color: text3, textTransform: 'uppercase', marginBottom: 12 }) }}>
                                    Selected: {messages.length} message{messages.length !== 1 ? 's' : ''}
                                </p>
                                <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {messages.slice(0, 3).map((message, index) => (
                                        <div key={message.id || index}>
                                            {getMessagePreview(message)}
                                        </div>
                                    ))}
                                    {messages.length > 3 && (
                                        <p style={{ ...ba(11, 400, { color: text3, fontStyle: 'italic', margin: '4px 0 0 0' }) }}>
                                            +{messages.length - 3} more message{messages.length - 3 !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Conversation Selector */}
                            <div>
                                <p style={{ ...ba(12, 700, { color: text3, textTransform: 'uppercase', marginBottom: 12 }) }}>
                                    Select Conversations
                                </p>
                                <ConversationSelector
                                    conversations={conversations}
                                    selectedConversationIds={selectedConversationIds}
                                    currentConversationId={currentConversationId}
                                    onSelectionChange={setSelectedConversationIds}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ 
                            padding: '24px 32px', 
                            borderTop: `1px solid ${border}`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end', 
                            gap: 12 
                        }}>
                            <motion.button
                                whileHover={{ background: bg2 }}
                                onClick={onClose}
                                disabled={loading}
                                style={{ 
                                    padding: '10px 20px', 
                                    background: 'none', 
                                    border: 'none', 
                                    borderRadius: 6, 
                                    cursor: 'pointer', 
                                    ...ba(14, 600, { color: text2 }) 
                                }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={loading || selectedConversationIds.length === 0 ? {} : { scale: 1.02 }}
                                whileTap={loading || selectedConversationIds.length === 0 ? {} : { scale: 0.98 }}
                                onClick={handleForward}
                                disabled={loading || selectedConversationIds.length === 0}
                                style={{ 
                                    padding: '10px 24px', 
                                    background: loading || selectedConversationIds.length === 0 ? bg2 : ORG, 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 6, 
                                    cursor: loading || selectedConversationIds.length === 0 ? 'not-allowed' : 'pointer', 
                                    ...ba(14, 700, { textTransform: 'uppercase' }),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                                        <span>Forwarding...</span>
                                    </>
                                ) : (
                                    <>
                                        <Forward style={{ width: 16, height: 16 }} />
                                        <span>
                                            Forward to {selectedConversationIds.length || '...'}
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ForwardModal;
