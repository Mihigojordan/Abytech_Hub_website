import React from 'react';
import { Upload } from 'lucide-react';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Drag and drop overlay component
 */
const DragDropOverlay = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    id="drag-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999,
                        background: 'rgba(7,20,24,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        style={{ textAlign: 'center' }}
                    >
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{ 
                                repeat: Infinity,
                                duration: 2,
                                ease: "easeInOut"
                            }}
                            style={{ 
                                width: 140, 
                                height: 140, 
                                margin: '0 auto 32px', 
                                border: `4px dashed ${ORG}`, 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: 'rgba(232,98,26,0.1)'
                            }}
                        >
                            <Upload style={{ width: 64, height: 64, color: ORG }} />
                        </motion.div>
                        <h2 style={{ ...bb(48, { color: '#fff', margin: '0 0 8px 0' }) }}>Drop files here</h2>
                        <p style={{ ...ba(18, 400, { color: 'rgba(255,255,255,0.7)', margin: 0 }) }}>Release to upload your files</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DragDropOverlay;
