import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { formatFullDate } from '../../../../utils/chat/dateUtils';
import { API_URL } from '../../../../api/api';
import { handleDisplayImgUrl } from '../../../../utils/chat/messageUtils';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Skeleton loading for images
 */
const ImageSkeleton = () => (
    <div style={{ width: '100%', maxWidth: 600, height: 400, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse">
        <ImageIcon style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.2)' }} />
    </div>
);

/**
 * Media viewer modal component for viewing images and files
 */
const MediaViewer = ({
    isOpen,
    media = [],
    currentIndex = 0,
    timestamp,
    onClose,
    onNavigate,
    onDownload
}) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const { bg, bg2, border, textC, text3 } = useDashboardTheme();

    useEffect(() => {
        setIsImageLoaded(false);
    }, [currentIndex]);

    if (!isOpen || media.length === 0) return null;

    const currentMedia = media[currentIndex];
    const canNavigatePrev = currentIndex > 0;
    const canNavigateNext = currentIndex < media.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ 
                        position: 'fixed', 
                        inset: 0, 
                        zIndex: 999, 
                        background: 'rgba(7,20,24,0.98)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backdropFilter: 'blur(12px)'
                    }}
                >
                    {/* Header */}
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        padding: '20px 32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ padding: 8, background: 'rgba(232,98,26,0.2)', borderRadius: '50%' }}>
                                <ImageIcon style={{ width: 20, height: 20, color: ORG }} />
                            </div>
                            <div>
                                <p style={{ ...ba(14, 600, { color: '#fff', margin: 0 }) }}>
                                    {currentMedia?.name || 'Media Viewer'}
                                </p>
                                <p style={{ ...ba(11, 400, { color: 'rgba(255,255,255,0.6)', margin: 0 }) }}>
                                    {timestamp && formatFullDate(timestamp)}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <motion.button
                                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onDownload(currentMedia)}
                                style={{
                                    padding: 10,
                                    borderRadius: '50%',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#fff'
                                }}
                            >
                                <Download style={{ width: 20, height: 20 }} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                style={{
                                    padding: 10,
                                    borderRadius: '50%',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#fff'
                                }}
                            >
                                <X style={{ width: 24, height: 24 }} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <button
                        onClick={() => onNavigate(-1)}
                        disabled={!canNavigatePrev}
                        style={{
                            position: 'absolute',
                            left: 32,
                            padding: 16,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '50%',
                            border: 'none',
                            color: '#fff',
                            cursor: canNavigatePrev ? 'pointer' : 'default',
                            opacity: canNavigatePrev ? 1 : 0.2,
                            transition: 'all 0.3s'
                        }}
                    >
                        <ChevronLeft style={{ width: 32, height: 32 }} />
                    </button>

                    <button
                        onClick={() => onNavigate(1)}
                        disabled={!canNavigateNext}
                        style={{
                            position: 'absolute',
                            right: 32,
                            padding: 16,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '50%',
                            border: 'none',
                            color: '#fff',
                            cursor: canNavigateNext ? 'pointer' : 'default',
                            opacity: canNavigateNext ? 1 : 0.2,
                            transition: 'all 0.3s'
                        }}
                    >
                        <ChevronRight style={{ width: 32, height: 32 }} />
                    </button>

                    {/* Content */}
                    <div style={{ maxWidth: '80%', maxHeight: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            >
                                {currentMedia?.type === 'image' ? (
                                    <div style={{ position: 'relative' }}>
                                        {!isImageLoaded && <ImageSkeleton />}
                                        <img
                                            src={handleDisplayImgUrl(currentMedia.url.imageUrl)}
                                            alt="Media"
                                            style={{ 
                                                maxWidth: '100%', 
                                                maxHeight: '75vh', 
                                                objectFit: 'contain', 
                                                borderRadius: 8, 
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                                display: isImageLoaded ? 'block' : 'none'
                                            }}
                                            onLoad={() => setIsImageLoaded(true)}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ 
                                        background: 'rgba(255,255,255,0.05)', 
                                        padding: 60, 
                                        borderRadius: 24, 
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ width: 80, height: 80, background: ORG, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                            <FileText style={{ width: 40, height: 40, color: '#fff' }} />
                                        </div>
                                        <h3 style={{ ...bb(32, { color: '#fff', margin: '0 0 8px 0' }) }}>
                                            {currentMedia?.name}
                                        </h3>
                                        <p style={{ ...ba(16, 400, { color: 'rgba(255,255,255,0.5)', marginBottom: 32 }) }}>
                                            {currentMedia?.size}
                                        </p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onDownload(currentMedia)}
                                            style={{
                                                padding: '12px 32px',
                                                background: ORG,
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                ...ba(14, 700, { textTransform: 'uppercase' })
                                            }}
                                        >
                                            Download File
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer / Pagination */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        padding: 32, 
                        display: 'flex', 
                        justifyContent: 'center',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'
                    }}>
                        <div style={{ padding: '8px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                            <span style={{ ...ba(14, 600, { color: '#fff' }) }}>
                                {currentIndex + 1} <span style={{ opacity: 0.5 }}>/</span> {media.length}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MediaViewer;
