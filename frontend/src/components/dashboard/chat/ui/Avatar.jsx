import React from 'react';

/**
 * Reusable Avatar component with support for images, initials, and online status
 */
const Avatar = ({
    avatar,
    initial,
    name = '',
    online = false,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-14 h-14 text-xl'
    };

    const onlineDotSizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4'
    };

    return (
        <div className={`relative ${className}`}>
            {avatar ? (
                <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
                    <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium bg-dashboard-300`}>
                    {initial || name.charAt(0).toUpperCase()}
                </div>
            )}
            {online && (
                <div className={`absolute bottom-0 right-0 ${onlineDotSizes[size]} bg-green-500 border-2 border-white rounded-full`}></div>
            )}
        </div>
    );
};

export default Avatar;
