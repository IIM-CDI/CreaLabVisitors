import { useState, useCallback } from 'react';
import { UserData, CalendarEventData, FormattedCalendarEvent, BackendEvent } from '../types/globalTypes';
import { useApi } from './useApi';

export const useCalendarApi = () => {
    const { getApiUrl, getHeaders } = useApi();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [events, setEvents] = useState<FormattedCalendarEvent[]>([]);

    const getProfile = useCallback(async (id: string) => {
        try {
            const apiUrl = getApiUrl();
            const headers = getHeaders();
            
            const response = await fetch(`${apiUrl}/get-profile/${id}`, { 
                headers 
            });
            const data = await response.json();
            if (data?.found) setUserData(data.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }, [getApiUrl, getHeaders]);

    const fetchEvents = useCallback(async () => {
        try {
            const apiUrl = getApiUrl();
            const headers = getHeaders();
            
            const response = await fetch(`${apiUrl}/events`, {
                method: 'GET',
                headers
            });
            
            if (response.ok) {
                const result = await response.json();
                
                const formattedEvents: FormattedCalendarEvent[] = result.data.map((event: BackendEvent) => {
                    const displayColor = event.accepted ? event.color : '#808080';
                    
                    return {
                        id: event.id,
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        backgroundColor: displayColor,
                        borderColor: displayColor,
                        extendedProps: {
                            user: event.user,
                            duration: event.duration,
                            id_card: event.id_card,
                            accepted: event.accepted
                        }
                    };
                });
                
                setEvents(formattedEvents);
            } else {
                console.error('Failed to fetch events:', response.statusText);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }, [getApiUrl, getHeaders]);

    const saveEvent = useCallback(async (eventData: CalendarEventData) => {
        try {
            const apiUrl = getApiUrl();
            const headers = getHeaders();
            
            const response = await fetch(`${apiUrl}/events`, {
                method: 'POST',
                headers,
                body: JSON.stringify(eventData)
            });
            
            if (response.ok) {
                fetchEvents();
            } else {
                console.error('Failed to save event:', response.statusText);
            }
        } catch (error) {
            console.error("Error saving event:", error);
        }
    }, [fetchEvents, getApiUrl, getHeaders]);

    return {
        userData,
        events,
        getProfile,
        fetchEvents,
        saveEvent
    };
};