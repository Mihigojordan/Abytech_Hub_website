import React from 'react';
import { X, CheckCheck, Clock } from 'lucide-react';
import Avatar from './Avatar';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal to show who has read a message in group conversations
 */
const ReadByModal = ({ isOpen, onClose, message, participantCount = 0 }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    if (!isOpen || !message) return null;

    const readBy = message.readBy || [];
    const totalParticipants = Math.max(0, participantCount - 1); // Exclude sender
    const readCount = readBy.length;
    const allRead = totalParticipants > 0 && readCount >= totalParticipants;

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 999, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 16 
                }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(7,20,24,0.8)', backdropFilter: 'blur(4px)' }}
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{ 
                            position: 'relative', 
                            background: bg, 
                            border: `1px solid ${border}`, 
                            borderRadius: 12, 
                            width: '100%', 
                            maxWidth: 400, 
                            maxHeight: '80vh', 
                            display: 'flex', 
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            padding: '20px 24px', 
                            borderBottom: `1px solid ${border}` 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <CheckCheck style={{ width: 18, height: 18, color: ORG }} />
                                <h2 style={{ ...bb(20, { color: textC, margin: 0 }) }}>Message Read By</h2>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, background: bg2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                style={{ padding: 8, background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', color: text3 }}
                            >
                                <X style={{ width: 18, height: 18 }} />
                            </motion.button>
                        </div>

                        {/* Status summary */}
                        <div style={{ padding: '12px 24px', background: bg2, borderBottom: `1px solid ${border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ ...ba(12, 600, { color: text2 }) }}>
                                    {readCount} of {totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}
                                </span>
                                {allRead ? (
                                    <span style={{ ...ba(10, 700, { color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }) }}>
                                        All read
                                    </span>
                                ) : (
                                    <span style={{ ...ba(10, 700, { color: ORG, background: 'rgba(232,98,26,0.1)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }) }}>
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Reader list */}
                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 320 }}>
                            {readBy.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <Clock style={{ width: 40, height: 40, color: text3, marginBottom: 16, opacity: 0.3 }} />
                                    <p style={{ ...ba(13, 400, { color: text3, margin: 0 }) }}>No one has read this message yet</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {readBy.map((reader, index) => (
                                        <div
                                            key={`${reader.readerType}-${reader.readerId}-${index}`}
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 12, 
                                                padding: '16px 24px', 
                                                borderBottom: index === readBy.length - 1 ? 'none' : `1px solid ${border}`,
                                                transition: 'background 0.2s'
                                            }}
                                            className="hover:bg-dashboard-200"
                                        >
                                            <Avatar
                                                avatar={reader.avatar}
                                                initial={reader.initial}
                                                name={reader.name}
                                                size="sm"
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ ...ba(14, 600, { color: textC, margin: 0 }) }} className="truncate">
                                                    {reader.name || 'Unknown User'}
                                                </p>
                                                <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }}>
                                                    {reader.readAt
                                                        ? new Date(reader.readAt).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })
                                                        : 'Just now'}
                                                </p>
                                            </div>
                                            <CheckCheck style={{ width: 14, height: 14, color: ORG, flexShrink: 0 }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px 24px', borderTop: `1px solid ${border}` }}>
                            <motion.button
                                whileHover={{ background: bg2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                style={{ 
                                    width: '100%', 
                                    padding: '12px', 
                                    background: bg3, 
                                    border: `1px solid ${border}`, 
                                    borderRadius: 8, 
                                    cursor: 'pointer', 
                                    ...ba(14, 700, { color: textC, textTransform: 'uppercase' }) 
                                }}
                            >
                                Close
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReadByModal;
