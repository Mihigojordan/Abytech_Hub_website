import React from 'react';
import { File, Download, FileText } from 'lucide-react';
import { API_URL } from '../../../../api/api';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * File attachment component
 */
const FileAttachment = ({ file, isSent, onClick }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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
        <motion.div
            whileHover={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                background: bg2,
                border: `1px solid ${border}`,
                borderRadius: 4,
                width: '100%',
                maxWidth: 320,
                cursor: 'pointer'
            }}
        >
            <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 4, 
                background: bg3, 
                border: `1px solid ${border}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
            }}>
                <FileText style={{ width: 20, height: 20, color: ORG }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...ba(13, 500, { color: textC, margin: 0 }) }} className="truncate">
                    {file.fileName}
                </p>
                {file.fileSize && (
                    <p style={{ ...ba(11, 400, { color: text3, margin: 0 }) }}>
                        {file.fileSize}
                    </p>
                )}
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                style={{
                    background: 'none',
                    border: 'none',
                    color: ORG,
                    padding: 8,
                    cursor: 'pointer'
                }}
            >
                <Download style={{ width: 16, height: 16 }} />
            </motion.button>
        </motion.div>
    );
};

export default FileAttachment;

