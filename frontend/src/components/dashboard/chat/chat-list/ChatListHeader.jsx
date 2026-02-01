import React from 'react';
import { Search } from 'lucide-react';

/**
 * Chat list header component - search bar and "Chats" title
 */
const ChatListHeader = ({ searchQuery, onSearchChange }) => {
    return (
        <div className="p-4 bg-white border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">Chats</h1>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search messages or users"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
        </div>
    );
};

export default ChatListHeader;
