import React from 'react';
import { X, Edit, CornerUpLeft } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Edit/Reply bar component shown above message input
 */
const EditReplyBar = ({ editingMessage, replyingTo, onCancel }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    if (!editingMessage && !replyingTo) return null;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ 
                padding: '12px 24px', 
                background: bg2, 
                borderTop: `1px solid ${border}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'between',
                gap: 16
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                {editingMessage ? (
                    <>
                        <Edit style={{ width: 16, height: 16, color: ORG }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ ...ba(13, 600, { color: textC, margin: 0 }) }}>Editing message</p>
                            <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }} className="truncate">
                                {editingMessage.content}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <CornerUpLeft style={{ width: 16, height: 16, color: ORG }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ ...ba(13, 600, { color: textC, margin: 0 }) }}>
                                Replying to <span style={{ color: ORG }}>{replyingTo?.sender}</span>
                            </p>
                            <p style={{ ...ba(11, 400, { color: text2, margin: 0 }) }} className="truncate">
                                {replyingTo?.content || (replyingTo?.images ? '📷 Image' : '📎 Attachment')}
                            </p>
                        </div>
                    </>
                )}
            </div>
            <motion.button
                whileHover={{ scale: 1.1, background: bg3 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCancel}
                style={{
                    padding: 6,
                    borderRadius: 4,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: text3
                }}
            >
                <X style={{ width: 18, height: 18 }} />
            </motion.button>
        </motion.div>
    );
};

export default EditReplyBar;
