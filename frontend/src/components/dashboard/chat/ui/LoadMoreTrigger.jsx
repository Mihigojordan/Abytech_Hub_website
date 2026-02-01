import React from 'react';

/**
 * Load more trigger component for lazy loading
 */
const LoadMoreTrigger = ({ hasMore, isLoading, triggerRef }) => {
    if (!hasMore) return null;

    return (
        <div ref={triggerRef} className="flex justify-center py-2">
            {isLoading && (
                <div className="flex items-center text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                    Loading more messages...
                </div>
            )}
        </div>
    );
};

export default LoadMoreTrigger;
