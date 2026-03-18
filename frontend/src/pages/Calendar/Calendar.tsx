import React, { useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventContentArg } from "@fullcalendar/core";
import frLocale from '@fullcalendar/core/locales/fr';
import { io, Socket } from "socket.io-client";
import "./CalendarComponent.css";
import "./FullCalendar.css";
import Sidebar from "../../layout/sidebar/Sidebar";
import { useCalendarApi } from "../../hooks/useCalendarApi";
import { useEventActions } from "../../hooks/useEventActions";
import { calendarConfig } from "./constants";
import { CalendarEvent, CalendarEventData, EventReceiveInfo } from "../../types/globalTypes";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";

const Calendar = ({ card_id, setIsAdmin, setRefreshEvents }: CalendarEvent) => {
    const { userData, events, getProfile, fetchEvents, saveEvent } = useCalendarApi();
    const { handleDelete } = useEventActions({ onEventRemoved: fetchEvents });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [deleteEventId, setDeleteEventId] = React.useState<string | null>(null);
    const [deleteEventTitle, setDeleteEventTitle] = React.useState<string>("");

    useEffect(() => {
        setRefreshEvents(() => fetchEvents);
    }, [setRefreshEvents, fetchEvents]);

    useEffect(() => {
        if (card_id) getProfile(card_id);
    }, [card_id, getProfile]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        setIsAdmin(!!userData?.admin);
    }, [userData, setIsAdmin]);

    useEffect(() => {
        let socket: Socket | null = null;
        
        const initSocket = () => {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

            socket = io(apiUrl, {
                transports: ["websocket"] 
            });

            socket.on("connect", () => {
                console.log("Calendar socket connected", socket?.id);
            });

            socket.on("events_updated", (data: { action: string; event?: CalendarEventData; event_id?: string }) => {
                console.log(`Event ${data.action}:`, data);
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

    const handleEventReceive = useCallback((info: EventReceiveInfo) => {
        const eventData: CalendarEventData = {
            id: info.event.id,
            title: info.event.title,
            user: (info.event.extendedProps.user as string) || 'Unknown',
            start: info.event.start || new Date(),
            startStr: info.event.startStr,
            end: info.event.end || info.event.start || new Date(),
            endStr: info.event.endStr,
            duration: (info.event.extendedProps.duration as string) || '01:00',
            color: info.event.backgroundColor || "#ffffff",
            id_card: card_id,
            accepted: false
        };
        saveEvent(eventData);
    }, [card_id, saveEvent]);

    const renderEventContent = useCallback((eventInfo: EventContentArg) => {
        const onDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setDeleteEventId(eventInfo.event.id);
            setDeleteEventTitle(eventInfo.event.title);
            setIsDeleteConfirmOpen(true);
        };

        return (
            <div className="calendar-event-content">
                {userData?.admin && (
                <button
                    type="button"
                    className="calendar-event-delete"
                    aria-label="Supprimer l'événement"
                    onClick={onDeleteClick}
                >
                    ×
                </button>
                )}
                <div className="calendar-event-text">
                    {eventInfo.timeText && <div className="fc-event-time">{eventInfo.timeText}</div>}
                    <div className="fc-event-title">{eventInfo.event.title}</div>
                </div>
            </div>
        );
    }, [userData?.admin]);

    const handleConfirmDelete = async () => {
        if (deleteEventId) {
            await handleDelete(deleteEventId);
            setIsDeleteConfirmOpen(false);
            setDeleteEventId(null);
            setDeleteEventTitle("");
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteConfirmOpen(false);
        setDeleteEventId(null);
        setDeleteEventTitle("");
    };

    return (
        <>
            <Sidebar userData={userData} card_id={card_id} onEventSave={saveEvent} />

            <div className="calendar_container">
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
                    allDaySlot={false}
                    eventReceive={handleEventReceive}
                    eventContent={renderEventContent}
                />
            </div>

            <ConfirmDeleteModal
                isOpen={isDeleteConfirmOpen}
                eventTitle={deleteEventTitle}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </>
    );
};

export default Calendar;