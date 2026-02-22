import React from 'react';
import { File, Download } from 'lucide-react';
import { API_URL } from '../../../../api/api';

/**
 * File attachment component
 */
const FileAttachment = ({ file, isSent, onClick }) => {

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            let url = file.fileUrl || '';
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                const path = url.startsWith('/') ? url : `/${url}`;
                url = `${API_URL}${path}`;
            }
            if (!url) return;

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = file.fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div
            className={`${isSent ? 'bg-dashboard-50 border border-dashboard-100' : 'bg-dashboard-600'} rounded-lg px-4 py-3 flex items-center space-x-3 w-full max-w-[300px] min-w-0 cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={onClick}
            title={file.fileName}
        >
            <div className={`w-10 h-10 ${isSent ? 'bg-dashboard-100' : 'bg-dashboard-500'} rounded flex items-center justify-center flex-shrink-0`}>
                <File className={`w-5 h-5 ${isSent ? 'text-dashboard-600' : 'text-white'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isSent ? 'text-gray-800' : 'text-white'} truncate`}>
                    {file.fileName}
                </p>
                {file.fileSize && (
                    <p className={`text-xs ${isSent ? 'text-gray-500' : 'text-dashboard-200'}`}>
                        {file.fileSize}
                    </p>
                )}
            </div>
            <button
                onClick={handleDownload}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isSent ? 'hover:bg-dashboard-100 text-dashboard-600' : 'hover:bg-dashboard-500 text-white'}`}
                title="Download file"
            >
                <Download className="w-4 h-4" />
            </button>
        </div>
    );
};

export default FileAttachment;

