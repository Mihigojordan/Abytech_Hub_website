import React from 'react';
import { X, File, FileText } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * File preview component showing files before sending
 */
const FilePreview = ({ files, onRemove, onClearAll }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    if (files.length === 0) return null;

    return (
        <div style={{ padding: '12px 24px', background: bg2, borderTop: `1px solid ${border}`, maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: 12 }}>
                <span style={{ ...ba(12, 600, { color: textC, flex: 1 }) }}>
                    {files.length} file{files.length > 1 ? 's' : ''} ready to send
                </span>
                <button
                    onClick={onClearAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', ...ba(11, 700, { color: ORG, textTransform: 'uppercase' }) }}
                >
                    Clear all
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                {files.map((fileObj, index) => (
                    <motion.div 
                        key={index} 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ position: 'relative' }} 
                        className="group"
                    >
                        {fileObj.type === 'image' ? (
                            <div style={{ position: 'relative', width: '100%', height: 80, borderRadius: 4, overflow: 'hidden', border: `1px solid ${border}` }}>
                                <img
                                    src={fileObj.preview}
                                    alt={fileObj.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                position: 'relative', 
                                width: '100%', 
                                height: 80, 
                                borderRadius: 4, 
                                background: bg3, 
                                border: `1px solid ${border}`,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 8
                            }}>
                                <FileText style={{ width: 24, height: 24, color: ORG, marginBottom: 4 }} />
                                <p style={{ ...ba(10, 400, { color: textC, textAlign: 'center', margin: 0 }) }} className="truncate w-full">
                                    {fileObj.name}
                                </p>
                            </div>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => onRemove(index)}
                            style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#ef4444',
                                border: 'none',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 2,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            <X style={{ width: 12, height: 12 }} />
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FilePreview;
