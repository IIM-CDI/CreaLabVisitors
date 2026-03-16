import React, { useEffect } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { draggableEvents } from "./CustomEventConstant";
import { UserData } from "../../types/globalTypes";
import "./SidebarCustomEvent.css"

interface SidebarCustomEventProps {
    userData: UserData | null;
}

const SidebarCustomEvent = ({ userData }: SidebarCustomEventProps) => {

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
                                user: eventEl.getAttribute("data-user"),
                                accepted: eventEl.getAttribute("data-accepted") === 'true'
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
        <div className="sidebar_custom_event">
            <p className="sidebar_custom_event_title">Custom Event Content</p>
            <div id="external-events">
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
                                data-accepted={event.accepted ? 'true' : 'false'}
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
                            ))
                            }
            </div>
        </div>
    );
}

export default SidebarCustomEvent;