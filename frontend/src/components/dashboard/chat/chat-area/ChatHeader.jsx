import React from 'react';
import { Search, Phone, Video, UserPlus, MoreVertical } from 'lucide-react';
import Avatar from '../ui/Avatar';

/**
 * Chat header component - top bar with user info and action buttons
 */
const ChatHeader = ({ conversation, isTyping }) => {
    return (
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Avatar
                    avatar={conversation.avatar}
                    initial={conversation.initial}
                    name={conversation.name}
                    online={conversation.online}
                    size="md"
                />
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">{conversation.name}</h2>
                    {isTyping && (
                        <p className="text-xs text-indigo-600">typing...</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Search className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserPlus className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
