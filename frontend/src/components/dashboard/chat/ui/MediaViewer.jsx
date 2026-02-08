import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, Calendar, File } from 'lucide-react';
import { formatFullDate } from '../../../../utils/chat/dateUtils';
import { API_URL } from '../../../../api/api';
import { handleDisplayImgUrl } from '../../../../utils/chat/messageUtils';

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
    if (!isOpen || media.length === 0) return null;

    const currentMedia = media[currentIndex];
    const canNavigatePrev = currentIndex > 0;
    const canNavigateNext = currentIndex < media.length - 1;
    
    

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation buttons */}
            <button
                onClick={() => onNavigate(-1)}
                disabled={!canNavigatePrev}
                className={`absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10 ${!canNavigatePrev ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
                onClick={() => onNavigate(1)}
                disabled={!canNavigateNext}
                className={`absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10 ${!canNavigateNext ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Media content */}
            <div className="max-w-5xl w-full h-full flex flex-col items-center justify-center p-20">
              
                
                {currentMedia?.type === 'image' ? (
                    <img
                        src={handleDisplayImgUrl(currentMedia.url.imageUrl)}
                        alt="Media"
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                    />
                ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-md w-full">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center mb-6">
                                <File className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">
                                {currentMedia?.name}
                            </h3>
                            <p className="text-lg text-gray-300 mb-8">
                                {currentMedia?.size}
                            </p>
                            <button
                                onClick={() => onDownload(currentMedia)}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Download File
                            </button>
                        </div>
                    </div>
                )}

                {/* Info bar */}
                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center justify-between max-w-2xl w-full">
                    <div className="flex items-center gap-3 text-white">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {timestamp && formatFullDate(timestamp)}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-white text-sm font-medium">
                            {currentIndex + 1} / {media.length}
                        </span>
                        {currentMedia?.type === 'image' && (
                            <button
                                onClick={() => onDownload(currentMedia)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation message */}
                {(currentIndex === 0 || currentIndex === media.length - 1) && media.length > 1 && (
                    <div className="mt-4 text-gray-400 text-sm">
                        {currentIndex === 0 && 'This is the first item'}
                        {currentIndex === media.length - 1 && 'This is the last item'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaViewer;
