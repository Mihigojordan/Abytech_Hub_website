import React from 'react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

/**
 * Reusable Avatar component with support for images, initials, and online status
 */
const Avatar = ({
    avatar,
    initial,
    name = '',
    online = false,
    size = 'md',
    style = {}
}) => {
    const { bg, bg2, border, textC, isDark } = useDashboardTheme();

    const sizes = {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 48,
        xl: 56
    };

    const s = sizes[size] || sizes.md;

    // Generate a deterministic color based on name
    const getAvatarColor = (name) => {
        const colors = [
            '#e8621a', // ORG
            '#1a5c78', // TEAL
            '#0f766e', // Teal dark
            '#7c2d12', // Orange dark
            '#1e293b', // Slate
            '#4338ca', // Indigo
        ];
        if (!name) return colors[0];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const avatarBg = getAvatarColor(name);

    return (
        <div style={{ position: 'relative', width: s, height: s, flexShrink: 0, ...style }}>
            <div style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: size === 'xl' ? 12 : '50%', // Editorial style: larger avatars are more squared
                overflow: 'hidden', 
                background: avatar ? bg2 : avatarBg,
                border: `1px solid ${avatar ? border : 'transparent'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: avatar ? 'none' : 'inset 0 0 10px rgba(0,0,0,0.1)'
            }}>
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <span style={{ ...bc(s * 0.45, 700, { color: '#fff' }), letterSpacing: 0.5 }}>
                        {initial || name.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
            {online && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: size === 'xl' ? -2 : 0, 
                    right: size === 'xl' ? -2 : 0, 
                    width: s * 0.28, 
                    height: s * 0.28, 
                    background: '#10b981', 
                    border: `2.5px solid ${bg}`, 
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
            )}
        </div>
    );
};

export default Avatar;
