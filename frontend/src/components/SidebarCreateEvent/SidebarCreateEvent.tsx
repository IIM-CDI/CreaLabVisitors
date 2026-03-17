import React, { useState } from "react";
import "./SideBarCreateEvent.css"
import Bouton from "../Bouton/Bouton";
import CreateCustomEvent from "../CreateCustomEvent/CreateCustomEvent";
import { UserData, CalendarEventData } from "../../types/globalTypes";

interface CreateEventProps {
    userData: UserData | null;
    onEventSave: (eventData: CalendarEventData) => void;
}

const SidebarCreateEvent = ({ userData, onEventSave }: CreateEventProps) => {

    const [openModal, setOpenModal] = useState(false);

    if (!userData) return null;

    return (
        <>
            <div className="sidebar_create_event">
                <p className="sidebar_create_event_title">Event personnalisé</p>
                <Bouton label="Créer un événement" component_type="primary" onClick={() => setOpenModal(true)} />
            </div>
            <CreateCustomEvent openModal={openModal} setOpenModal={setOpenModal} currentUser={userData} onEventSave={onEventSave} />
        </>
    );
}

export default SidebarCreateEvent;