import React, { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import Avatar from './Avatar';

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
        <div className={`flex flex-col ${className}`}>
            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dashboard-500"
                />
            </div>

            {/* Select All / Deselect All */}
            {filteredConversations.length > 0 && (
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={handleSelectAll}
                        className="text-xs text-dashboard-600 hover:text-dashboard-700 font-medium"
                    >
                        Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={handleDeselectAll}
                        className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                    >
                        Deselect All
                    </button>
                </div>
            )}

            {/* Conversation List */}
            <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        {searchQuery ? 'No conversations found' : 'No other conversations available'}
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isSelected = selectedConversationIds.includes(conv.id);

                        return (
                            <button
                                key={conv.id}
                                onClick={() => handleToggle(conv.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isSelected
                                        ? 'bg-dashboard-50 border-2 border-dashboard-500'
                                        : 'bg-white border-2 border-transparent hover:bg-gray-50'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                            ? 'bg-dashboard-600 border-dashboard-600'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>

                                {/* Avatar */}
                                <Avatar
                                    avatar={conv.avatar}
                                    initial={conv.initial}
                                    name={conv.name}
                                    size="sm"
                                    className="flex-shrink-0"
                                />

                                {/* Conversation Info */}
                                <div className="flex-1 text-left min-w-0">
                                    <p className="font-medium text-sm text-gray-900 truncate">
                                        {conv.name}
                                    </p>
                                    {conv.participants && conv.participants.length > 0 && (
                                        <p className="text-xs text-gray-500 truncate">
                                            {conv.participants.map(p => p.name).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationSelector;
