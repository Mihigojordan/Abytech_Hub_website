import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../../../api/api';
import { handleDisplayImgUrl } from '../../../../utils/chat/messageUtils';

/**
 * Skeleton component for loading images
 */
const ImageSkeleton = () => (
    <div className="rounded-lg w-64 h-48 bg-gray-300 animate-pulse flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
);

/**
 * Lazy loaded image component with skeleton
 */
const LazyImage = ({ src, alt, className }) => {
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

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} className="relative">
            {/* Skeleton shown while loading */}
            {(!isInView || !isLoaded) && <ImageSkeleton />}

            {/* Actual image - only load when in view */}
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'} transition-opacity duration-300`}
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
    if (!images || images.length === 0) return null;

    return (
        <div className="relative">
            <div
                className={`${isSent ? 'bg-dashboard-600' : 'bg-dashboard-600'} rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={onClick}
            >
                {images.length > 1 ? (
                    <div className="relative">
                        {/* Stack effect for multiple images */}
                        <div className="absolute -top-1 -right-1 w-full h-full bg-dashboard-500 rounded-lg opacity-40"></div>
                        <div className="absolute -top-2 -right-2 w-full h-full bg-dashboard-400 rounded-lg opacity-30"></div>
                        <div className="relative">
                            <LazyImage
                                src={handleDisplayImgUrl(images[0].imageUrl)}
                                alt="Shared"
                                className="rounded-lg w-64 h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                {images.length}
                            </div>
                        </div>
                    </div>
                ) : (
                    <LazyImage
                        src={handleDisplayImgUrl(images[0].imageUrl)}
                        alt="Shared"
                        className="rounded-lg w-64 h-48 object-cover"
                    />
                )}
            </div>
        </div>
    );
};

export default ImageAttachment;
