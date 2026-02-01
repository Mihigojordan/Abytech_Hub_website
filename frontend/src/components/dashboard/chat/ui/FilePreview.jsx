import React from 'react';
import { X, File } from 'lucide-react';

/**
 * File preview component showing files before sending
 */
const FilePreview = ({ files, onRemove, onClearAll }) => {
    if (files.length === 0) return null;

    return (
        <div className="px-6 py-3 bg-indigo-50 border-t border-indigo-100 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    {files.length} file(s) ready to send
                </span>
                <button
                    onClick={onClearAll}
                    className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                    Clear all
                </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {files.map((fileObj, index) => (
                    <div key={index} className="relative group">
                        {fileObj.type === 'image' ? (
                            <div className="relative">
                                <img
                                    src={fileObj.preview}
                                    alt={fileObj.name}
                                    className="w-full h-20 rounded object-cover"
                                />
                                <button
                                    onClick={() => onRemove(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative bg-white border border-indigo-200 rounded p-2 h-20 flex flex-col justify-center hover:border-indigo-300 transition-colors">
                                <File className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-600 truncate text-center">{fileObj.name}</p>
                                <button
                                    onClick={() => onRemove(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilePreview;
