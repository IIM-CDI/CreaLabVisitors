import { useState } from 'react';
import { UserData, CalendarEventData, FormattedCalendarEvent } from '../types';

export const useCalendarApi = (token: string | null) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [events, setEvents] = useState<FormattedCalendarEvent[]>([]);

    const getApiUrl = () => {
        return process.env.REACT_APP_ENV === 'PROD' 
            ? process.env.REACT_APP_PROD_API_URL 
            : process.env.REACT_APP_DEV_API_URL;
    };

    const getHeaders = () => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        return headers;
    };

    const getProfile = async (id: string) => {
        try {
            const response = await fetch(`${getApiUrl()}/get-profile/${id}`, { 
                headers: getHeaders() 
            });
            const data = await response.json();
            if (data?.found) setUserData(data.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${getApiUrl()}/events`, {
                method: 'GET',
                headers: getHeaders()
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Events fetched successfully:', result);
                
                // Transform events to FullCalendar format
                const formattedEvents: FormattedCalendarEvent[] = result.data.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    start: event.start,
                    end: event.end,
                    backgroundColor: event.color,
                    borderColor: event.color,
                    extendedProps: {
                        user: event.user,
                        duration: event.duration,
                        id_card: event.id_card
                    }
                }));
                
                setEvents(formattedEvents);
            } else {
                console.error('Failed to fetch events:', response.statusText);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const saveEvent = async (eventData: CalendarEventData) => {
        try {
            const response = await fetch(`${getApiUrl()}/events`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(eventData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Event saved successfully:', result);
                // Refetch events to update the calendar
                fetchEvents();
            } else {
                console.error('Failed to save event:', response.statusText);
            }
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    return {
        userData,
        events,
        getProfile,
        fetchEvents,
        saveEvent
    };
};