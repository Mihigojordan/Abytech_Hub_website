import React from 'react';
import { X, Copy, Edit, Forward, Trash2 } from 'lucide-react';

/**
 * Selection mode bar component shown when messages are selected
 */
const SelectionModeBar = ({ selectedCount, selectedMessages, allMessages, onCancel, onBulkAction }) => {
    const selectedMsgs = allMessages.filter(m => selectedMessages.includes(m.id));
    const allUserMessages = selectedMsgs.every(m => m.isSent);

    return (
        <div className="px-6 py-3 bg-dashboard-600 flex items-center justify-between animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center space-x-4">
                <button onClick={onCancel} className="text-white hover:text-dashboard-100 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <span className="text-white font-medium">{selectedCount} selected</span>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onBulkAction('copy')}
                    className="p-2 text-white hover:bg-dashboard-500 rounded-lg transition-colors"
                    title="Copy"
                >
                    <Copy className="w-5 h-5" />
                </button>
                {selectedCount === 1 && selectedMsgs[0]?.isSent && (
                    <button
                        onClick={() => onBulkAction('edit')}
                        className="p-2 text-white hover:bg-dashboard-500 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                )}
                {selectedCount === 1 && (
                    <button
                        onClick={() => onBulkAction('reply')}
                        className="p-2 text-white hover:bg-dashboard-500 rounded-lg transition-colors"
                        title="Reply"
                    >
                        <Forward className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={() => onBulkAction('forward')}
                    className="p-2 text-white hover:bg-dashboard-500 rounded-lg transition-colors"
                    title="Forward"
                >
                    <Forward className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onBulkAction('delete')}
                    disabled={!allUserMessages}
                    className={`p-2 text-white rounded-lg transition-colors ${allUserMessages
                            ? 'hover:bg-red-500 cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                    title={allUserMessages ? 'Delete' : 'Can only delete your own messages'}
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SelectionModeBar;
