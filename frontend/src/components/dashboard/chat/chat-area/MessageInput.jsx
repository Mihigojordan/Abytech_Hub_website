import React, { useState } from 'react';
import { Smile, Paperclip, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import EmojiPicker from '../ui/EmojiPicker';

/**
 * Message input component - bottom input area with attachments
 */
const MessageInput = ({
    value,
    onChange,
    onSend,
    textareaRef,
    fileInputRef,
    imageInputRef,
    onFileUpload,
    isSending = false
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji) => {
        onChange(value + emoji);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSending) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        placeholder="Enter Message..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dashboard-500 resize-none min-h-[48px] max-h-[150px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        rows="1"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEmojiPicker(!showEmojiPicker);
                            }}
                            disabled={isSending}
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Smile className="w-5 h-5 text-gray-500" />
                        </button>
                        <EmojiPicker
                            isOpen={showEmojiPicker}
                            onSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    </div>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={onFileUpload}
                        className="hidden"
                        disabled={isSending}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={imageInputRef}
                        onChange={onFileUpload}
                        className="hidden"
                        disabled={isSending}
                    />
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isSending}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                        onClick={onSend}
                        disabled={isSending}
                        className="p-3 bg-dashboard-600 hover:bg-dashboard-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSending ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
