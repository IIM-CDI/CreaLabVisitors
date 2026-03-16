import React, { useEffect } from "react";
import "./AdminModal.css";
import Bouton from "../Bouton/Bouton";
import { useUnacceptedEvents } from "../../hooks/useUnacceptedEvents";
import { useEventActions } from "../../hooks/useEventActions";
import { useSocketEvents } from "../../hooks/useSocketEvents";
import { useModalManager } from "../../hooks/useModalManager";
import { formatEventDate } from "../../hooks/useDateFormat";

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEventChange?: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onEventChange }) => {
    const { unacceptedEvents, fetchUnacceptedEvents, removeEvent } = useUnacceptedEvents();
    const { handleValidate, handleDelete } = useEventActions({ onEventRemoved: removeEvent });
    const { handleClose, handleBackdropClick } = useModalManager({ isOpen, onClose, onEventChange });
    
    useSocketEvents({ isOpen, onEventsUpdated: fetchUnacceptedEvents });

    useEffect(() => {
        if (isOpen) {
            fetchUnacceptedEvents();
        }
    }, [isOpen, fetchUnacceptedEvents]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Evenements en attente</h2>
                    <button className="modal-close-button" onClick={handleClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    {unacceptedEvents.length === 0 ? (
                        <p>Aucun événement en attente de validation.</p>
                    ) : (
                        <ul>
                            {unacceptedEvents.map((event) => (
                                <li key={event.id} className="modal-item">
                                    {event.title} - (
                                        du {formatEventDate(event.startStr)} à {formatEventDate(event.endStr)}
                                    )
                                    <div className="modal-boutons">
                                        <Bouton component_type="accept" label="Valider" onClick={() => handleValidate(event.id)} />
                                        <Bouton component_type="cancel" label="Supprimer" onClick={() => handleDelete(event.id)} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminModal;