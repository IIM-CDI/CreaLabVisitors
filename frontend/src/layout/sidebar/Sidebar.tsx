import React from "react";
import "./Sidebar.css";
import SidebarWelcome from "../../components/SidebarWelcome/SidebarWelcome";
import SidebarCustomEvent from "../../components/SidebarCustomEvent/SidebarCustomEvent";
import SidebarCreateEvent from "../../components/SidebarCreateEvent/SidebarCreateEvent";
import { UserData, CalendarEventData } from "../../types/globalTypes";

interface SidebarProps {
    userData: UserData | null;
    card_id: string;
    onEventSave: (eventData: CalendarEventData) => void;
}

const Sidebar = ({ userData, card_id, onEventSave }: SidebarProps) => {
    return userData ? (
        <div className="app_sidebar">
            <SidebarWelcome userData={userData} card_id={card_id} />
            <SidebarCustomEvent userData={userData} />
            <SidebarCreateEvent userData={userData} onEventSave={onEventSave} />
        </div>
    ) : null;
}

export default Sidebar;