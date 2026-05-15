export const getApiUrl = (): string => {
    return (process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000');
};

export const getHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json'
});
