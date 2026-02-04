import React, { useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from '@fullcalendar/core/locales/fr';
import { useAuth } from '../../context/AuthContext';
import "./Calendar.css";
import Connexion from "../../components/Connexion/Connexion";
import ExternalEvents from "./ExternalEvents";
import { useCalendarApi } from "./hooks/useCalendarApi";
import { calendarConfig } from "./constants";
import { CalendarEvent, CalendarEventData } from "./types";

const Calendar = ({ card_id, setIsAdmin, setRefreshEvents }: CalendarEvent) => {
    const { token } = useAuth();
    const { userData, events, getProfile, fetchEvents, saveEvent } = useCalendarApi(token);

    const handleEventChange = useCallback(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Register the refresh function with the parent component
    useEffect(() => {
        setRefreshEvents(() => handleEventChange);
    }, [setRefreshEvents, handleEventChange]);

    useEffect(() => {
        if (card_id) getProfile(card_id);
    }, [card_id, token]);

    useEffect(() => {
        fetchEvents();
    }, [token]);

    useEffect(() => {
        setIsAdmin(!!userData?.admin);
    }, [userData, setIsAdmin]);

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
            </div>

            <div className="calendar_container">
                <h2>Calendar Page</h2>
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