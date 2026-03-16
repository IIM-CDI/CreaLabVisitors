import React, {useState} from "react";
import "./SidebarWelcome.css";
import Bouton from "../Bouton/Bouton";
import Modification from "../Modification/Modification";
import { UserData } from "../../types/globalTypes";

interface SidebarWelcomeProps {
    userData: UserData
    card_id: string;
}

const SidebarWelcome = ({ userData, card_id }: SidebarWelcomeProps) => {

    const [modificationOpen, setModificationOpen] = useState(false);

    return (
        <div className="sidebar_welcome">
            <h2 className="sidebar_welcome_title">Bonjour {userData.first_name} {userData.last_name}</h2>
            <p className="sidebar_welcome_text">{userData.email}</p>
            <Bouton component_type="primary" label="Modifier les informations" onClick={() => setModificationOpen(true)} />
            {modificationOpen && (
                <Modification
                    userData={userData}
                    card_id={card_id}
                    setModificationOpen={setModificationOpen}
                />
            )}
        </div>
    );
}

export default SidebarWelcome;