import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

/**
 * Drag and drop overlay component
 */
const DragDropOverlay = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div
            id="drag-overlay"
            className="fixed inset-0 z-50 bg-slate-600/90 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
        >
            <div className="text-center animate-pulse">
                <div className="w-32 h-32 mx-auto mb-6 border-4 border-dashed border-white rounded-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Drop files here</h2>
                <p className="text-white text-lg opacity-90">Release to upload your files</p>
            </div>
        </div>
    );
};

export default DragDropOverlay;
