import React from 'react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';

/**
 * Load more trigger component for lazy loading
 */
const LoadMoreTrigger = ({ hasMore, isLoading, triggerRef }) => {
    const { text3 } = useDashboardTheme();

    if (!hasMore) return null;

    return (
        <div ref={triggerRef} style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div 
                        style={{ 
                            width: 16, 
                            height: 16, 
                            border: '2px solid rgba(232,98,26,0.2)', 
                            borderTopColor: ORG, 
                            borderRadius: '50%' 
                        }} 
                        className="animate-spin" 
                    />
                    <span style={{ ...ba(12, 500, { color: text3 }) }}>Loading more messages...</span>
                </div>
            )}
        </div>
    );
};

export default LoadMoreTrigger;
