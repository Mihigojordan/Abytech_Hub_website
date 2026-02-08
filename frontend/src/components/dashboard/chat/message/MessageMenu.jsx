import React from 'react';
import { Copy, Edit, Trash2, Forward, CheckCheck } from 'lucide-react';

/**
 * Context menu for message actions
 * @param {string} messageId - The message ID
 * @param {boolean} isSent - Whether the message was sent by current user
 * @param {boolean} isGroup - Whether this is a group conversation
 * @param {function} onAction - Callback for menu actions
 * @param {string} position - Menu position (left/right)
 */
const MessageMenu = ({ messageId, isSent, isGroup = false, onAction, position = 'right' }) => {
    return (
        <div className={`absolute top-8 ${position}-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 min-w-[150px] animate-in fade-in slide-in-from-top-2 duration-200`}>
            <button
                onClick={() => onAction('copy', messageId)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
            </button>
            <button
                onClick={() => onAction('reply', messageId)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
                <Forward className="w-4 h-4" />
                <span>Reply</span>
            </button>
            {isSent && (
                <button
                    onClick={() => onAction('edit', messageId)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 transition-colors"
                >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                </button>
            )}
            <button
                onClick={() => onAction('forward', messageId)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 transition-colors"
            >
                <Forward className="w-4 h-4" />
                <span>Forward</span>
            </button>
            {/* Read by option - only for sent messages in group conversations */}
            {isSent && isGroup && (
                <button
                    onClick={() => onAction('readby', messageId)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center space-x-2 text-blue-600 transition-colors"
                >
                    <CheckCheck className="w-4 h-4" />
                    <span>Read by</span>
                </button>
            )}
            {isSent && (
                <button
                    onClick={() => onAction('delete', messageId)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center space-x-2 text-red-600 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                </button>
            )}
        </div>
    );
};

export default MessageMenu;
