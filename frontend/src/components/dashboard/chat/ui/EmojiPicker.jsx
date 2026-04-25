import React from 'react';
import { emojis } from '../../../../utils/chat/constants';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Emoji picker popup component
 */
const EmojiPicker = ({ isOpen, onSelect, onClose, isMobile }) => {
    const { bg, bg2, bg3, textC, border } = useDashboardTheme();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                        position: 'absolute',
                        bottom: 64,
                        right: isMobile ? 'auto' : 0,
                        left: isMobile ? 0 : 'auto',
                        width: 320,
                        height: 280,
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 12,
                        padding: 16,
                        overflowY: 'auto',
                        zIndex: 50,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                        {emojis.map((emoji, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.2, background: bg2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(emoji);
                                    onClose();
                                }}
                                style={{
                                    fontSize: 24,
                                    background: 'none',
                                    border: 'none',
                                    borderRadius: 4,
                                    padding: 4,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmojiPicker;
