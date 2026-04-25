import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Layers } from 'lucide-react';
import { API_URL } from '../../../../api/api';
import { handleDisplayImgUrl } from '../../../../utils/chat/messageUtils';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Skeleton component for loading images
 */
const ImageSkeleton = () => {
    const { bg3, border } = useDashboardTheme();
    return (
        <div style={{ 
            width: 256, 
            height: 192, 
            background: bg3, 
            border: `1px solid ${border}`, 
            borderRadius: 4, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }} className="animate-pulse">
            <ImageIcon style={{ width: 32, height: 32, color: ORG, opacity: 0.2 }} />
        </div>
    );
};

/**
 * Lazy loaded image component with skeleton
 */
const LazyImage = ({ src, alt, className, style }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (imgRef.current) observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} style={{ position: 'relative', width: 256, height: 192, ...style }}>
            {(!isInView || !isLoaded) && <ImageSkeleton />}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4,
                        opacity: isLoaded ? 1 : 0,
                        transition: 'opacity 0.3s',
                        ...style
                    }}
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                />
            )}
        </div>
    );
};

/**
 * Image attachment component with stack effect for multiple images
 */
const ImageAttachment = ({ images, isSent, onClick }) => {
    const { bg, bg2, border } = useDashboardTheme();
    if (!images || images.length === 0) return null;

    return (
        <motion.div
            whileHover={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                position: 'relative',
                padding: 4,
                background: bg2,
                border: `1px solid ${border}`,
                borderRadius: 4,
                cursor: 'pointer',
                overflow: 'hidden'
            }}
        >
            {images.length > 1 ? (
                <div style={{ position: 'relative' }}>
                    <LazyImage
                        src={handleDisplayImgUrl(images[0].imageUrl)}
                        alt="Shared"
                    />
                    <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        ...bc(10, 700),
                        padding: '4px 8px',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        backdropFilter: 'blur(4px)'
                    }}>
                        <Layers style={{ width: 12, height: 12 }} />
                        {images.length} PHOTOS
                    </div>
                </div>
            ) : (
                <LazyImage
                    src={handleDisplayImgUrl(images[0].imageUrl)}
                    alt="Shared"
                />
            )}
        </motion.div>
    );
};

export default ImageAttachment;
