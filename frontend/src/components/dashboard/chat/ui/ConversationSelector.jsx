import React, { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import Avatar from './Avatar';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Conversation Selector Component
 * Allows multi-select of conversations for forwarding messages
 */
const ConversationSelector = ({
    conversations = [],
    selectedConversationIds = [],
    currentConversationId,
    onSelectionChange,
    className = ''
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    // Filter out current conversation and apply search
    const filteredConversations = useMemo(() => {
        return conversations.filter(conv => {
            // Exclude current conversation
            if (conv.id === currentConversationId) return false;

            // Apply search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const name = conv.name?.toLowerCase() || '';
                const participantNames = conv.participants
                    ?.map(p => p.name?.toLowerCase() || '')
                    .join(' ') || '';

                return name.includes(query) || participantNames.includes(query);
            }

            return true;
        });
    }, [conversations, currentConversationId, searchQuery]);

    const handleToggle = (conversationId) => {
        const newSelection = selectedConversationIds.includes(conversationId)
            ? selectedConversationIds.filter(id => id !== conversationId)
            : [...selectedConversationIds, conversationId];

        onSelectionChange(newSelection);
    };

    const handleSelectAll = () => {
        const allIds = filteredConversations.map(c => c.id);
        onSelectionChange(allIds);
    };

    const handleDeselectAll = () => {
        onSelectionChange([]);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search style={{ 
                    position: 'absolute', 
                    left: 12, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    width: 16, 
                    height: 16, 
                    color: text3 
                }} />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 16px 10px 40px',
                        background: bg2,
                        border: `1px solid ${border}`,
                        borderRadius: 8,
                        ...ba(14, 400, { color: textC, outline: 'none' })
                    }}
                />
            </div>

            {/* Select All / Deselect All */}
            {filteredConversations.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={handleSelectAll}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', ...ba(11, 700, { color: ORG, textTransform: 'uppercase' }) }}
                    >
                        Select All
                    </button>
                    <div style={{ width: 1, height: 12, background: border }} />
                    <button
                        onClick={handleDeselectAll}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', ...ba(11, 700, { color: text3, textTransform: 'uppercase' }) }}
                    >
                        Deselect All
                    </button>
                </div>
            )}

            {/* Conversation List */}
            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredConversations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <p style={{ ...ba(13, 400, { color: text3, margin: 0 }) }}>
                            {searchQuery ? 'No conversations found' : 'No other conversations available'}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isSelected = selectedConversationIds.includes(conv.id);

                        return (
                            <motion.button
                                key={conv.id}
                                whileHover={{ scale: 1.01, background: bg2 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleToggle(conv.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 12,
                                    background: isSelected ? 'rgba(232,98,26,0.05)' : bg2,
                                    border: `1px solid ${isSelected ? ORG : border}`,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                {/* Checkbox */}
                                <div
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 4,
                                        border: `2px solid ${isSelected ? ORG : text3}`,
                                        background: isSelected ? ORG : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    {isSelected && <Check style={{ width: 14, height: 14, color: '#fff' }} />}
                                </div>

                                {/* Avatar */}
                                <Avatar
                                    avatar={conv.avatar}
                                    initial={conv.initial}
                                    name={conv.name}
                                    size="sm"
                                />

                                {/* Conversation Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ ...ba(14, 600, { color: textC, margin: 0 }) }} className="truncate">
                                        {conv.name}
                                    </p>
                                    {conv.participants && conv.participants.length > 0 && (
                                        <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }} className="truncate">
                                            {conv.participants.map(p => p.name).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationSelector;
