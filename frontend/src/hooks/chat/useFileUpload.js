import { useState, useEffect } from 'react';

/**
 * Custom hook for handling file uploads (drag, drop, paste, click)
 * @returns {Object} File upload state and handlers
 */
export const useFileUpload = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    /**
     * Handle multiple files at once
     */
    const handleMultipleFiles = (files) => {
        const fileObjects = files.map(file => ({
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.type.startsWith('image/') ? 'image' : 'file'
        }));
        setUploadedFiles(prev => [...prev, ...fileObjects]);
    };

    /**
     * Handle file input change
     */
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        handleMultipleFiles(files);
    };

    /**
     * Remove a file from the upload list
     */
    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Clear all uploaded files
     */
    const clearFiles = () => {
        setUploadedFiles([]);
    };

    // Drag and drop handlers
    useEffect(() => {
        const handleDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === document.getElementById('drag-overlay')) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            handleMultipleFiles(files);
        };

        document.addEventListener('dragenter', handleDragEnter);
        document.addEventListener('dragleave', handleDragLeave);
        document.addEventListener('dragover', handleDragOver);
        document.addEventListener('drop', handleDrop);

        return () => {
            document.removeEventListener('dragenter', handleDragEnter);
            document.removeEventListener('dragleave', handleDragLeave);
            document.removeEventListener('dragover', handleDragOver);
            document.removeEventListener('drop', handleDrop);
        };
    }, []);

    // Paste handler
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            const files = [];

            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    const file = items[i].getAsFile();
                    files.push(file);
                }
            }

            if (files.length > 0) {
                e.preventDefault();
                handleMultipleFiles(files);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, []);

    return {
        uploadedFiles,
        isDragging,
        handleFileUpload,
        removeFile,
        clearFiles
    };
};
