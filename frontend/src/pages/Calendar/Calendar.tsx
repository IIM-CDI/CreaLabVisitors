import React, { useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from '@fullcalendar/core/locales/fr';
import { io, Socket } from "socket.io-client";
import "./Calendar.css";
import Connexion from "../../components/Connexion/Connexion";
import ExternalEvents from "./ExternalEvents";
import CustomEvent from "../../components/CustomEvent/CustomEvent";
import { useCalendarApi } from "./hooks/useCalendarApi";
import { calendarConfig } from "./constants";
import { CalendarEvent, CalendarEventData } from "./types";

const Calendar = ({ card_id, setIsAdmin, setRefreshEvents }: CalendarEvent) => {
    const { userData, events, getProfile, fetchEvents, saveEvent } = useCalendarApi();

    const handleEventChange = useCallback(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Register the refresh function with the parent component
    useEffect(() => {
        setRefreshEvents(() => handleEventChange);
    }, [setRefreshEvents, handleEventChange]);

    useEffect(() => {
        if (card_id) getProfile(card_id);
    }, [card_id, getProfile]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        setIsAdmin(!!userData?.admin);
    }, [userData, setIsAdmin]);

    // Socket connection for real-time event updates
    useEffect(() => {
        let socket: Socket | null = null;
        
        const initSocket = () => {
            const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? 
                process.env.REACT_APP_PROD_API_URL : 
                process.env.REACT_APP_DEV_API_URL;
            
            socket = io(apiUrl || "http://localhost:8000", { 
                transports: ["websocket"] 
            });

            socket.on("connect", () => {
                console.log("Calendar socket connected", socket?.id);
            });

            socket.on("events_updated", (data: { action: string; event?: any; event_id?: string }) => {
                console.log(`Event ${data.action}:`, data);
                // Refresh the calendar when any event is updated
                fetchEvents();
            });

            socket.on("disconnect", () => {
                console.log("Calendar socket disconnected");
            });
        };

        if (card_id) {
            initSocket();
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [card_id, fetchEvents]);

    const handleEventReceive = (info: any) => {
        const eventData: CalendarEventData = {
            id: info.event.id,
            title: info.event.title,
            user: info.event.extendedProps?.user || 'Unknown',
            start: info.event.start,
            startStr: info.event.startStr,
            end: info.event.end,
            endStr: info.event.endStr,
            duration: info.event.extendedProps?.duration || '01:00',
            color: info.event.backgroundColor,
            id_card: card_id,
            accepted: false
        };
        saveEvent(eventData);
    };

    return (
        <>
            <div className="connexion_container">
                <Connexion card_id={card_id} userData={userData} />
                <ExternalEvents userData={userData} />
                <CustomEvent />
            </div>

            <div className="calendar_container">
                <h2>Calendrier des Réservations</h2>
                <FullCalendar
                    key={`calendar-${events.length}-${JSON.stringify(events.map(e => ({id: e.id, color: e.backgroundColor})))}`}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locale={frLocale}
                    headerToolbar={calendarConfig.headerToolbar}
                    buttonText={calendarConfig.buttonText}
                    initialView={calendarConfig.initialView}
                    firstDay={calendarConfig.firstDay}
                    slotLabelFormat={calendarConfig.slotLabelFormat}
                    eventTimeFormat={calendarConfig.eventTimeFormat}
                    events={events}
                    editable
                    droppable
                    eventReceive={handleEventReceive}
                />
            </div>
        </>
    );
};

export default Calendar;