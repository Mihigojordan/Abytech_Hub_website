import React from 'react';
import { emojis } from '../../../../utils/chat/constants';

/**
 * Emoji picker popup component
 */
const EmojiPicker = ({ isOpen, onSelect, onClose,isMobile }) => {
    if (!isOpen) return null;

    return (
        <div className={`absolute ${!isMobile ? 'bottom-14 right-0' : 'bottom-14'}  bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 h-64 overflow-y-auto z-20 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
            <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(emoji);
                            onClose();
                        }}
                        className="text-2xl hover:bg-gray-100 rounded p-1 transition-all duration-150 hover:scale-110"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiPicker;
