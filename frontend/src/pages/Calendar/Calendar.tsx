import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import frLocale from '@fullcalendar/core/locales/fr';
import { useAuth } from '../../context/AuthContext';
import "./Calendar.css";
import Connexion from "../../components/Connexion/Connexion";

interface CalendarEvent {
    card_id: string;
}

interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    [key: string]: string;
}

const draggableEvents = [
    { id: 1, title: "Impression 3D", duration: "00:30", color: "#ff9f89", visibility: 'all' },
    { id: 2, title: "Peinture", duration: "02:00", color: "#b8ff89", visibility: 'all' },
    { id: 3, title: "Atelier Electronique", duration: "01:00", color: "#89d8ff", visibility: 'all' },
    { id: 4, title: "Cours au Crealab", duration:"24:00", color: "#ffef89", visibility: 'staff' },
    { id: 5, title: "Semaine de cours", duration: "120:00", color: "#d089ff", visibility: 'staff' }
];

const Calendar = ({ card_id }: CalendarEvent) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const { token } = useAuth();

    const getProfile = async (id: string) => {
        try {
            const headers: Record<string,string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
            const response = await fetch(`${apiUrl}/get-profile/${id}`, { headers });
            const data = await response.json();
            if (data?.found) setUserData(data.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        if (card_id) getProfile(card_id);
    }, [card_id, token]);
    useEffect(() => {
        let draggableInstance: Draggable | null = null;

        const timer = setTimeout(() => {
            const draggableEl = document.getElementById("external-events");
            if (draggableEl) {
                draggableInstance = new Draggable(draggableEl, {
                    itemSelector: ".external-event",
                    eventData: (eventEl) => ({
                        title: eventEl.getAttribute("data-title") + " - " + eventEl.getAttribute("data-user"),
                        duration: eventEl.getAttribute("data-duration"),
                        backgroundColor: eventEl.getAttribute("data-color"),
                        borderColor: eventEl.getAttribute("data-color"),
                        extendedProps: {
                            duration: eventEl.getAttribute("data-duration"),
                            user: eventEl.getAttribute("data-user")
                        },
                        id: `dropped-${Date.now()}-${Math.random()}`
                    })
                });
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            draggableInstance?.destroy();
        };
    }, []);

    return (
        <>
            <div className="connexion_container">
                <Connexion card_id={card_id} userData={userData} />
                <div id="external-events">
                    <p><strong>Draggable Events</strong></p>
                    {draggableEvents
                        .filter(event => event.visibility === 'all' || (event.visibility === 'staff' && userData?.role === 'staff'))
                        .map((event) => (
                        <div
                            key={event.id}
                            className="external-event"
                            data-title={event.title}
                            data-duration={event.duration}
                            data-color={event.color}
                            data-user={userData ? `${userData.first_name} ${userData.last_name}` : "Inconnu"}
                            style={{
                                backgroundColor: event.color,
                                color: 'black',
                                fontWeight: '500',
                                borderRadius: '5px',
                                border: 'none',
                                marginBottom: '10px',
                                padding: '4px',
                                cursor: 'grab'
                            }}
                        >
                            {event.title }
                        </div>
                    ))}
                </div>
            </div>

            <div className="calendar_container">
                <h2>Calendar Page</h2>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    locale={frLocale}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "timeGridDay,timeGridWeek,dayGridMonth"
                    }}
                    buttonText={{
                        today: 'Aujourd\'hui',
                        month: 'Mois',
                        week: 'Semaine',
                        day: 'Jour'
                    }}
                    initialView="timeGridWeek"
                    firstDay={1}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }}
                    editable
                    droppable
                    eventReceive={(info) => {
                        console.log('Event received:', {
                            id: info.event.id,
                            title: info.event.title,
                            user: info.event.extendedProps?.user,
                            start: info.event.start,
                            startStr: info.event.startStr,
                            end: info.event.end,
                            endStr: info.event.endStr,
                            duration: info.event.extendedProps?.duration,
                            color: info.event.backgroundColor,
                            user_id: card_id
                        });
                    }}
                />
            </div>
        </>
    );
};

export default Calendar;