import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../../../../api/api';
import { handleDisplayImgUrl } from '../../../../utils/chat/messageUtils';

/**
 * Image attachment component with stack effect for multiple images
 */
const ImageAttachment = ({ images, isSent, onClick }) => {
    if (!images || images.length === 0) return null;


    return (
        <div className="relative">
            <div
                className={`${isSent ? 'bg-indigo-600' : 'bg-indigo-600'} rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity`}
                onClick={onClick}
            >
                {images.length > 1 ? (
                    <div className="relative">
                        {/* Stack effect for multiple images */}
                        <div className="absolute -top-1 -right-1 w-full h-full bg-indigo-500 rounded-lg opacity-40"></div>
                        <div className="absolute -top-2 -right-2 w-full h-full bg-indigo-400 rounded-lg opacity-30"></div>
                        <div className="relative">
                            <img src={handleDisplayImgUrl(images[0].imageUrl)} alt="Shared" className="rounded-lg w-64 h-48 object-cover" />
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                {images.length}
                            </div>
                        </div>
                    </div>
                ) : (
                    <img src={handleDisplayImgUrl(images[0].imageUrl)} alt="Shared" className="rounded-lg w-64 h-48 object-cover" />
                )}
            </div>
        </div>
    );
};

export default ImageAttachment;
