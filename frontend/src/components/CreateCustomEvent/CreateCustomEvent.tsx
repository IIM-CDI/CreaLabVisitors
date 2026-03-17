import React, {useState} from "react";
import Bouton from "../Bouton/Bouton";
import FormText from "../FormText/FormText";
import FormDate from "../FormDate/FormDate";
import FormHour from "../FormHour/FormHour";
import FormColor from "../FormColor/FormColor";
import "./CreateCustomEvent.css"
import { CalendarEventData, UserData } from "../../types/globalTypes";
import { useModalEscape } from "../../hooks/useModalEscape";


interface CreateCustomEventProps {
    openModal: boolean;
    setOpenModal?: (open: boolean) => void;
    currentUser: UserData;
    onEventSave: (eventData: CalendarEventData) => void;
}

const CreateCustomEvent = ({ openModal, setOpenModal, currentUser, onEventSave }: CreateCustomEventProps) => {

    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState(String(new Date(new Date().getTime() + (60 * 60 * 1000)).toISOString().split("T")[0]));
    const [startHour, setStartHour] = useState(String(new Date(new Date().getTime() + (60 * 60 * 1000)).toISOString().split("T")[1].slice(0, 5)));
    const [endDate, setEndDate] = useState(String(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toISOString().split("T")[0]));
    const [endHour, setEndHour] = useState(String(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toISOString().split("T")[1].slice(0, 5)));
    const [color, setColor] = useState("#000000");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = () => {
        const start = new Date(`${startDate}T${startHour}`);
        const end = new Date(`${endDate}T${endHour}`);

        if (end <= start) {
            setErrorMessage("La fin de l'événement doit être après le début.");
            return;
        }

        setErrorMessage("");

        const eventData: CalendarEventData = {
            id: Math.random().toString(36).substr(2, 9),
            title: title + ` - ${currentUser.first_name} ${currentUser.last_name}`,
            start,
            end,
            startStr: start.toISOString(),
            endStr: end.toISOString(),
            duration: String(end.getTime() - start.getTime()),
            color,
            user: currentUser.first_name + " " + currentUser.last_name,
            id_card: currentUser.id_card || "",
            accepted: false,
        };

        onEventSave(eventData);

        setStartDate(String(new Date(new Date().getTime() + (60 * 60 * 1000)).toISOString().split("T")[0]));
        setStartHour(String(new Date(new Date().getTime() + (60 * 60 * 1000)).toISOString().split("T")[1].slice(0, 5)));
        setEndDate(String(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toISOString().split("T")[0]));
        setEndHour(String(new Date(new Date().getTime() + (2 * 60 * 60 * 1000)).toISOString().split("T")[1].slice(0, 5)));
        setTitle("");
        setColor("#000000");

        setOpenModal?.(false);
    }

    useModalEscape(openModal, () => setOpenModal?.(false));

    if (!openModal) return null;

    return (
        <div 
            className="create_custom_event_backdrop" 
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setOpenModal?.(false);
                }
            }}
        >
            <div className="create_custom_event">
            <div className="create_custom_event_header">
                <p className="create_custom_event_title">Créer un événement personnalisé</p>
                <Bouton label="Fermer" component_type="primary" onClick={() => {
                    setOpenModal?.(false);
                }} />
            </div>
            <form className="create_custom_event_body" onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <FormText label="Titre de l'événement" value={title} onChange={(value) => setTitle(value)} />
                    <div className="create_custom_event_date_hour">
                <FormDate label="Date de l'événement" value={startDate} onChange={(value) => setStartDate(value)} />
                <FormHour label="Heure de début" value={startHour} onChange={(value) => setStartHour(value)} />
                    </div>
                    <div className="create_custom_event_date_hour">
                <FormDate label="Date de fin" value={endDate} onChange={(value) => setEndDate(value)} />
                <FormHour label="Heure de fin" value={endHour} onChange={(value) => setEndHour(value)} />
                    </div>
                {errorMessage && <p className="create_custom_event_error">{errorMessage}</p>}
                <FormColor label="Couleur de l'événement" value={color} onChange={(value) => setColor(value)} />
                <Bouton label="Enregistrer l'événement" component_type="primary" onClick={handleSubmit} />
            </form>
        </div>
        </div>
    );
}

export default CreateCustomEvent;