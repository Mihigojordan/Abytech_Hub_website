import React from 'react';
import { Search } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

/**
 * Chat list header component - search bar and "Chats" title
 */
const ChatListHeader = ({ searchQuery, onSearchChange }) => {
    const { bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

    return (
        <div style={{ padding: '24px 20px', background: bg2, borderBottom: `1px solid ${border}` }}>
            <h1 style={{ ...bb(24, { color: textC, margin: '0 0 20px' }) }}>Messages</h1>
            <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: text3 }} />
                <input
                    type="text"
                    placeholder="Search people, groups..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 16px 10px 38px',
                        background: bg3,
                        border: `1px solid ${border}`,
                        borderRadius: 4,
                        color: textC,
                        ...ba(13, 400),
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                />
            </div>
        </div>
    );
};

export default ChatListHeader;
