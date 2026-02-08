import React from 'react';
import { File } from 'lucide-react';

/**
 * File attachment component
 */
const FileAttachment = ({ file, isSent, onClick }) => {
    return (
        <div
            className={`${isSent ? 'bg-dashboard-50 border border-dashboard-100' : 'bg-dashboard-600'} rounded-lg px-4 py-3 flex items-center space-x-3 min-w-[250px] cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={onClick}
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
        </div>
    );
};

export default FileAttachment;
