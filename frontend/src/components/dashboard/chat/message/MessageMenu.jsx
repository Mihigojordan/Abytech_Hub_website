import React from 'react';
import { Copy, Edit, Trash2, Forward, CheckCheck, Reply } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Context menu for message actions
 */
const MessageMenu = ({ messageId, isSent, isGroup = false, onAction, position = 'right' }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    const MenuItem = ({ icon: Icon, label, onClick, color = textC, hoverBg = bg3 }) => (
        <motion.button
            whileHover={{ background: hoverBg }}
            onClick={onClick}
            style={{
                width: '100%',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                ...ba(13, 500, { color }),
                transition: 'all 0.2s'
            }}
        >
            <Icon style={{ width: 14, height: 14 }} />
            <span>{label}</span>
        </motion.button>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                position: 'absolute',
                top: 32,
                [position]: 0,
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 4,
                padding: '4px 0',
                zIndex: 100,
                minWidth: 160,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                overflow: 'hidden'
            }}
        >
            <MenuItem icon={Copy} label="Copy Text" onClick={() => onAction('copy', messageId)} />
            <MenuItem icon={Reply} label="Reply" onClick={() => onAction('reply', messageId)} />
            
            {isSent && (
                <MenuItem icon={Edit} label="Edit Message" onClick={() => onAction('edit', messageId)} />
            )}
            
            <MenuItem icon={Forward} label="Forward" onClick={() => onAction('forward', messageId)} />
            
            {isSent && isGroup && (
                <MenuItem icon={CheckCheck} label="Read By" color={ORG} hoverBg="rgba(232,98,26,0.1)" onClick={() => onAction('readby', messageId)} />
            )}
            
            {isSent && (
                <MenuItem icon={Trash2} label="Delete" color="#ef4444" hoverBg="rgba(239,68,68,0.1)" onClick={() => onAction('delete', messageId)} />
            )}
        </motion.div>
    );
};

export default MessageMenu;
