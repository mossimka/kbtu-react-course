export const formatCacheAge = (seconds: number | null) => {
    if (seconds === null) return 'just now';
    if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s ago`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
    return `${Math.round(seconds / 86400)}d ago`;
};

export const formatCacheTimestamp = (timestamp: number | null) => {
    if (!timestamp) return null;
    try {
        return new Intl.DateTimeFormat(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
        }).format(timestamp);
    } catch {
        return null;
    }
};
