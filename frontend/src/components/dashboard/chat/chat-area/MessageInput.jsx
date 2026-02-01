import React, { useState } from 'react';
import { Smile, Paperclip, Image as ImageIcon, Send } from 'lucide-react';
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
    onFileUpload
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleEmojiSelect = (emoji) => {
        onChange(value + emoji);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
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
                        className="w-full px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[48px] max-h-[150px] transition-all duration-200"
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
                            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
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
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
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
                    />
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ImageIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                        onClick={onSend}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
