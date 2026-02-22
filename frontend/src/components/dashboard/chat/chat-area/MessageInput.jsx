import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Image as ImageIcon, Send, Loader2, Plus, X } from 'lucide-react';
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
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const menuRef = useRef(null);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEmojiSelect = (emoji) => {
        onChange(value + emoji);
        setShowEmojiPicker(false);
        setShowMobileMenu(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSending) {
            e.preventDefault();
            onSend();
        }
    };

    const ActionButtons = ({ isMobile = false }) => (
        <>
            <div className="relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker(!showEmojiPicker);
                    }}
                    disabled={isSending}
                    className={`p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
                >
                    <Smile className="w-5 h-5 text-gray-500" />
                    {isMobile && <span className="text-sm text-gray-700">Emoji</span>}
                </button>
                
                    <EmojiPicker
                        isOpen={showEmojiPicker}
                        onSelect={handleEmojiSelect}
                        isMobile={isMobile}
                        onClose={() => setShowEmojiPicker(false)}
                    />
               
            </div>

            <button
                onClick={() => {
                    fileInputRef.current?.click();
                    setShowMobileMenu(false);
                }}
                disabled={isSending}
                className={`p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
            >
                <Paperclip className="w-5 h-5 text-gray-500" />
                {isMobile && <span className="text-sm text-gray-700">File</span>}
            </button>

            <button
                onClick={() => {
                    imageInputRef.current?.click();
                    setShowMobileMenu(false);
                }}
                disabled={isSending}
                className={`p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
            >
                <ImageIcon className="w-5 h-5 text-gray-500" />
                {isMobile && <span className="text-sm text-gray-700">Image</span>}
            </button>
        </>
    );

    return (
        <div className="px-4 md:px-6 py-4 bg-white border-t border-gray-200">
            {/* Mobile Emoji Picker Overlay */}
           

            <div className="flex items-end space-x-2 md:space-x-3">
                {/* Hidden File Inputs */}
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={onFileUpload}
                    className="hidden"
                    disabled={isSending}
                />
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={imageInputRef}
                    onChange={onFileUpload}
                    className="hidden"
                    disabled={isSending}
                />

                {/* Mobile Menu Toggle */}
                <div className="md:hidden relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        disabled={isSending}
                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className={`w-5 h-5 text-gray-500 transition-transform ${showMobileMenu ? 'rotate-45 text-dashboard-600' : ''}`} />
                    </button>

                    {showMobileMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                            <ActionButtons isMobile={true} />
                        </div>
                    )}
                </div>

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
                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-2">
                        <ActionButtons isMobile={false} />
                    </div>

                    <button
                        onClick={onSend}
                        disabled={isSending}
                        className="p-3 bg-dashboard-600 hover:bg-dashboard-700 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
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
