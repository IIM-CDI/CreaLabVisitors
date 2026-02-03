import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import frLocale from '@fullcalendar/core/locales/fr';
import "./Calendar.css";
import Connexion from "../../components/Connexion/Connexion";

interface CalendarEvent {
    card_id: string;
}

const draggableEvents = [
    { id: 1, title: "Impression 3D", duration: "00:30", color: "#ff9f89" },
    { id: 2, title: "Peinture", duration: "02:00", color: "#b8ff89" },
    { id: 3, title: "Atelier Electronique", duration: "01:00", color: "#89d8ff" },
    { id: 4, title: "Cours au Crealab", duration:"24:00", color: "#ffef89" },
    { id: 5, title: "Semaine de cours", duration: "120:00", color: "#d089ff" }
];

const Calendar = ({ card_id }: CalendarEvent) => {
    useEffect(() => {
        let draggableInstance: Draggable | null = null;

        const timer = setTimeout(() => {
            const draggableEl = document.getElementById("external-events");
            if (draggableEl) {
                draggableInstance = new Draggable(draggableEl, {
                    itemSelector: ".external-event",
                    eventData: (eventEl) => ({
                        title: eventEl.getAttribute("data-title"),
                        duration: eventEl.getAttribute("data-duration"),
                        backgroundColor: eventEl.getAttribute("data-color"),
                        borderColor: eventEl.getAttribute("data-color"),
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
                <Connexion card_id={card_id} />
                <div id="external-events">
                    <p><strong>Draggable Events</strong></p>
                    {draggableEvents.map((event) => (
                        <div
                            key={event.id}
                            className="external-event"
                            data-title={event.title}
                            data-duration={event.duration}
                            data-color={event.color}
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
                            {event.title}
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
                    eventReceive={(info) => console.log('Event received:', info.event.title)}
                />
            </div>
        </>
    );
};

export default Calendar;