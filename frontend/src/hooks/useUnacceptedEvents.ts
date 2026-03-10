import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export const useUnacceptedEvents = () => {
    const [unacceptedEvents, setUnacceptedEvents] = useState<any[]>([]);
    const { getApiUrl, getHeaders } = useApi();

    const fetchUnacceptedEvents = useCallback(async () => {
        try {
            const response = await fetch(`${getApiUrl()}/unaccepted-events`, {
                method: 'GET',
                headers: getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                setUnacceptedEvents(data.data || []);
            } else {
                console.error('Failed to fetch unaccepted events:', response.statusText);
                setUnacceptedEvents([]);
            }
        } catch (error) {
            console.error('Error fetching unaccepted events:', error);
            setUnacceptedEvents([]);
        }
    }, [getApiUrl, getHeaders]);

    const removeEvent = useCallback((eventId: string) => {
        setUnacceptedEvents(prevEvents => 
            prevEvents.filter(event => event.id !== eventId)
        );
    }, []);

    return {
        unacceptedEvents,
        fetchUnacceptedEvents,
        removeEvent
    };
};