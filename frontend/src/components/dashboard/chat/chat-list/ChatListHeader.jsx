import { Search } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, bb, ba } from '../../../../utils/homeConstants';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'groups', label: 'Groups' },
    { key: 'unread', label: 'Unread' },
];

const ChatListHeader = ({ searchQuery, onSearchChange, activeFilter = 'all', onFilterChange }) => {
    const { bg, bg2, bg3, textC, text3, border } = useDashboardTheme();

    return (
        <div style={{ padding: '20px 16px 0', background: bg, borderBottom: `1px solid ${border}` }}>
            <h1 style={{ ...bb(20, { color: textC, margin: '0 0 16px 4px' }) }}>Messages</h1>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 14, height: 14, color: text3, pointerEvents: 'none'
                }} />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        background: bg2,
                        border: `1px solid ${border}`,
                        borderRadius: 8,
                        ...ba(13, 400, { color: textC }),
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = ORG}
                    onBlur={e => e.target.style.borderColor = border}
                />
            </div>

            {/* Filter tabs: All / Groups / Unread */}
            <div style={{ display: 'flex', gap: 6, paddingBottom: 14 }}>
                {FILTERS.map(({ key, label }) => {
                    const active = activeFilter === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onFilterChange && onFilterChange(key)}
                            style={{
                                padding: '5px 14px',
                                borderRadius: 20,
                                border: `1px solid ${active ? ORG : border}`,
                                background: active ? ORG : bg3,
                                color: active ? '#fff' : text3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                ...ba(12, active ? 600 : 400)
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatListHeader;
