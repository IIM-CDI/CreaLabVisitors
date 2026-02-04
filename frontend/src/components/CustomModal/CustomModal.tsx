import React, { useEffect } from "react";
import "./CustomModal.css";
import { useAuth } from '../../context/AuthContext';
import ModalButtons from "../ModalButtons/ModalButtons";

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEventChange?: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose, onEventChange }) => {
    const { token } = useAuth();
    const [unacceptedEvents, setUnacceptedEvents] = React.useState<any[]>([]);

    const getApiUrl = () => {
        return process.env.REACT_APP_ENV === 'PROD' 
            ? process.env.REACT_APP_PROD_API_URL 
            : process.env.REACT_APP_DEV_API_URL;
    };

    const getHeaders = () => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        return headers;
    };

    const handleValidate = async (eventId: string) => {
        try {
            const response = await fetch(`${getApiUrl()}/accept-event/${eventId}`, {
                method: 'POST',
                headers: getHeaders()
            });

            if (response.ok) {
                // Refresh the list of unaccepted events
                setUnacceptedEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } else {
                console.error('Failed to accept event:', response.statusText);
            }
        } catch (error) {
            console.error('Error accepting event:', error);
        }
    };
    
    const handleDelete = async (eventId: string) => {
        try {
            const response = await fetch(`${getApiUrl()}/delete-event/${eventId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (response.ok) {
                // Refresh the list of unaccepted events
                setUnacceptedEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } else {
                console.error('Failed to delete event:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    useEffect(() => {
        const fetchUnacceptedEvents = async () => {
            try {
                const response = await fetch(`${getApiUrl()}/unaccepted-events`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setUnacceptedEvents(data.data || []);
                } else {
                    console.error('Failed to fetch unaccepted events:', response.statusText);
                    setUnacceptedEvents([]);
                }
            } catch (error) {
                console.error('Error fetching unaccepted events:', error);
                setUnacceptedEvents([]);
            }
        };

        if (isOpen) {
            fetchUnacceptedEvents();
        }
    }, [isOpen, token]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
            if (onEventChange) onEventChange();
        }
    };

    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                if (onEventChange) onEventChange();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Evenements en attente</h2>
                    <button className="modal-close-button" onClick={() => {
                        onClose();
                        if (onEventChange) onEventChange();
                    }}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    {unacceptedEvents.length === 0 ? (
                        <p>No unaccepted events.</p>
                    ) : (
                        <ul>
                            {unacceptedEvents.map((event) => (
                                <li key={event.id} className="modal-item">
                                    {event.title} - (
                                        du {new Date(event.startStr).toLocaleString('fr', { 
                                            year: 'numeric', month: '2-digit', day: '2-digit', 
                                            hour: '2-digit', minute: '2-digit' 
                                        })} à {new Date(event.endStr).toLocaleString('fr', { 
                                            year: 'numeric', month: '2-digit', day: '2-digit', 
                                            hour: '2-digit', minute: '2-digit' 
                                        })}) - <ModalButtons
                                        onValidate={() => {
                                            handleValidate(event.id);
                                        }} 
                                        onDelete={() => {
                                            handleDelete(event.id);
                                        }} 
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;