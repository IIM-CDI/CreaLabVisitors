import { useCallback } from 'react';

export const useApi = () => {
    const getApiUrl = useCallback(() => {
        return process.env.REACT_APP_ENV === 'PROD' 
            ? process.env.REACT_APP_PROD_API_URL 
            : process.env.REACT_APP_DEV_API_URL;
    }, []);

    const getHeaders = useCallback(() => {
        const headers: Record<string, string> = { 
            "Content-Type": "application/json" 
        };
        return headers;
    }, []);

    return { getApiUrl, getHeaders };
};