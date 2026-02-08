import React from 'react';
import { X, CheckCheck, Clock } from 'lucide-react';
import Avatar from './Avatar';

/**
 * Modal to show who has read a message in group conversations
 */
const ReadByModal = ({ isOpen, onClose, message, participantCount = 0 }) => {
    if (!isOpen || !message) return null;

    const readBy = message.readBy || [];
    const totalParticipants = participantCount - 1; // Exclude sender
    const readCount = readBy.length;
    const allRead = totalParticipants > 0 && readCount >= totalParticipants;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <CheckCheck className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-semibold text-gray-900">
                            Read by
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status summary */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {readCount} of {totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}
                        </span>
                        {allRead ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                All read
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                Pending
                            </span>
                        )}
                    </div>
                </div>

                {/* Reader list */}
                <div className="flex-1 overflow-y-auto max-h-64">
                    {readBy.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No one has read this message yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {readBy.map((reader, index) => (
                                <div
                                    key={`${reader.readerType}-${reader.readerId}-${index}`}
                                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <Avatar
                                        avatar={reader.avatar}
                                        initial={reader.initial}
                                        name={reader.name}
                                        size="sm"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {reader.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {reader.readAt
                                                ? new Date(reader.readAt).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })
                                                : 'Read'}
                                        </p>
                                    </div>
                                    <CheckCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReadByModal;
