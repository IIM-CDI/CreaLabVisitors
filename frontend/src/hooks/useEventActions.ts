import { useCallback } from 'react';
import { useApi } from './useApi';

interface UseEventActionsProps {
    onEventRemoved: (eventId: string) => void;
}

export const useEventActions = ({ onEventRemoved }: UseEventActionsProps) => {
    const { getApiUrl, getHeaders } = useApi();

    const handleValidate = useCallback(async (eventId: string) => {
        try {
            const response = await fetch(`${getApiUrl()}/accept-event/${eventId}`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (response.ok) {
                onEventRemoved(eventId);
            } else {
                console.error('Failed to accept event:', response.statusText);
            }
        } catch (error) {
            console.error('Error accepting event:', error);
        }
    }, [getApiUrl, getHeaders, onEventRemoved]);
    
    const handleDelete = useCallback(async (eventId: string) => {
        try {
            const response = await fetch(`${getApiUrl()}/delete-event/${eventId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (response.ok) {
                onEventRemoved(eventId);
            } else {
                console.error('Failed to delete event:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    }, [getApiUrl, getHeaders, onEventRemoved]);

    return { handleValidate, handleDelete };
};