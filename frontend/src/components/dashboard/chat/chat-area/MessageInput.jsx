import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Image as ImageIcon, Send, Loader2, Plus, X, Mic } from 'lucide-react';
import EmojiPicker from '../ui/EmojiPicker';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();
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

    const ActionButton = ({ icon: Icon, onClick, active = false, label, primary = false }) => (
        <motion.button
            whileHover={{ scale: 1.05, background: active || primary ? 'rgba(232,98,26,0.1)' : bg2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={isSending}
            style={{
                padding: '10px',
                background: active ? 'rgba(232,98,26,.08)' : 'none',
                border: 'none',
                borderRadius: 10,
                color: active || primary ? ORG : text3,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: label ? '100%' : 40,
                height: 40,
                opacity: isSending ? 0.5 : 1,
                transition: 'all 0.2s'
            }}
        >
            <Icon style={{ width: 18, height: 18 }} />
            {label && <span style={{ ...ba(13, 600, { color: text2 }) }}>{label}</span>}
        </motion.button>
    );

    return (
        <div style={{ padding: '16px 24px', background: bg, borderTop: `1px solid ${border}`, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                {/* Hidden File Inputs */}
                <input type="file" multiple ref={fileInputRef} onChange={onFileUpload} style={{ display: 'none' }} disabled={isSending} />
                <input type="file" accept="image/*" multiple ref={imageInputRef} onChange={onFileUpload} style={{ display: 'none' }} disabled={isSending} />

                {/* Mobile Menu Toggle */}
                <div style={{ position: 'relative' }} ref={menuRef} className="md:hidden">
                    <ActionButton 
                        icon={showMobileMenu ? X : Plus} 
                        active={showMobileMenu}
                        onClick={() => setShowMobileMenu(!showMobileMenu)} 
                        primary={true}
                    />

                    <AnimatePresence>
                        {showMobileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    marginBottom: 12,
                                    background: bg,
                                    border: `1px solid ${border}`,
                                    borderRadius: 12,
                                    padding: 8,
                                    width: 160,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    zIndex: 50,
                                    backdropFilter: 'blur(12px)'
                                }}
                            >
                                <ActionButton icon={Smile} label="Emoji" onClick={() => setShowEmojiPicker(true)} />
                                <ActionButton icon={Paperclip} label="File" onClick={() => fileInputRef.current?.click()} />
                                <ActionButton icon={ImageIcon} label="Image" onClick={() => imageInputRef.current?.click()} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                        ref={textareaRef}
                        placeholder="Write a message..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                        style={{
                            width: '100%',
                            padding: '12px 18px',
                            background: bg2,
                            border: `1px solid ${border}`,
                            borderRadius: 12,
                            color: textC,
                            ...ba(14, 400),
                            outline: 'none',
                            resize: 'none',
                            minHeight: 44,
                            maxHeight: 120,
                            transition: 'all 0.2s',
                            opacity: isSending ? 0.5 : 1,
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                        }}
                        rows={1}
                        onFocus={(e) => e.target.style.borderColor = ORG}
                        onBlur={(e) => e.target.style.borderColor = border}
                    />
                    
                    {/* Emoji Picker Popover */}
                    <EmojiPicker
                        isOpen={showEmojiPicker}
                        onSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                    />
                </div>

                {/* Desktop Attachment Buttons - Moved to the right */}
                <div className="hidden md:flex gap-1">
                    <ActionButton icon={Smile} active={showEmojiPicker} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                    <ActionButton icon={Paperclip} onClick={() => fileInputRef.current?.click()} />
                    <ActionButton icon={ImageIcon} onClick={() => imageInputRef.current?.click()} />
                </div>

                <motion.button
                    whileHover={isSending || !value.trim() ? {} : { scale: 1.05, background: ORG }}
                    whileTap={isSending || !value.trim() ? {} : { scale: 0.95 }}
                    onClick={onSend}
                    disabled={isSending || !value.trim()}
                    style={{
                        width: 44,
                        height: 44,
                        background: (isSending || !value.trim()) ? bg2 : ORG,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: (isSending || !value.trim()) ? 'not-allowed' : 'pointer',
                        boxShadow: (isSending || !value.trim()) ? 'none' : '0 4px 12px rgba(232,98,26,0.2)',
                        transition: 'all 0.3s'
                    }}
                >
                    {isSending ? (
                        <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                    ) : (
                        <Send style={{ width: 18, height: 18, transform: 'translateX(1px)' }} />
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default MessageInput;
