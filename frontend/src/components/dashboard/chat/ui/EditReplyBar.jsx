import React from 'react';
import { X, Edit, Forward } from 'lucide-react';

/**
 * Edit/Reply bar component shown above message input
 */
const EditReplyBar = ({ editingMessage, replyingTo, onCancel }) => {
    if (!editingMessage && !replyingTo) return null;

    return (
        <div className="px-6 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                {editingMessage ? (
                    <>
                        <Edit className="w-4 h-4 text-indigo-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-800">Editing message</p>
                            <p className="text-xs text-gray-600 truncate max-w-md">
                                {editingMessage.content}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Forward className="w-4 h-4 text-indigo-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                Replying to {replyingTo?.sender}
                            </p>
                            <p className="text-xs text-gray-600 truncate max-w-md">
                                {replyingTo?.type === 'image' && '📷 Image'}
                                {replyingTo?.type === 'file' && '📎 File'}
                                {(replyingTo?.type === 'text' || replyingTo?.type === 'combined') &&
                                    (replyingTo?.content || 'Media')}
                            </p>
                        </div>
                    </>
                )}
            </div>
            <button
                onClick={onCancel}
                className="p-1 hover:bg-indigo-100 rounded transition-colors"
            >
                <X className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
};

export default EditReplyBar;
