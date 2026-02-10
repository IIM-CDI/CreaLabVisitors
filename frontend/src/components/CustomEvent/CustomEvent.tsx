import React, { useState } from "react";
import "./CustomEvent.css";
import { UserData, CalendarEventData } from "../../pages/Calendar/types";

interface CustomEventProps {
    userData: UserData | null;
    card_id: string;
    onEventSave: (eventData: CalendarEventData) => void;
}

const CustomEvent = ({ userData, card_id, onEventSave }: CustomEventProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        color: '#007bff'
    });

    const predefinedColors = [
        { value: '#007bff', name: 'Bleu' },
        { value: '#28a745', name: 'Vert' },
        { value: '#dc3545', name: 'Rouge' },
        { value: '#ffc107', name: 'Jaune' },
        { value: '#6f42c1', name: 'Violet' },
        { value: '#fd7e14', name: 'Orange' },
        { value: '#20c997', name: 'Turquoise' },
        { value: '#e83e8c', name: 'Rose' }
    ];

    const openModal = () => {
        setIsModalOpen(true);
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentTime = today.toTimeString().slice(0, 5);
        
        setFormData({
            title: '',
            startDate: todayStr,
            startTime: currentTime,
            endDate: todayStr,
            endTime: currentTime,
            color: '#007bff'
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            title: '',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            color: '#007bff'
        });
    };

    const calculateDuration = (start: Date, end: Date): string => {
        const diffMs = end.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userData) {
            alert('Erreur: Informations utilisateur manquantes');
            return;
        }

        const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        
        if (endDateTime <= startDateTime) {
            alert('La date de fin doit être postérieure à la date de début');
            return;
        }

        if (!formData.title.trim()) {
            alert('Le titre est requis');
            return;
        }

        const eventId = `custom-${Date.now()}-${Math.random()}`;
        
        const duration = calculateDuration(startDateTime, endDateTime);
        
        const userName = `${userData.first_name} ${userData.last_name}`;
        
        const eventData: CalendarEventData = {
            id: eventId,
            title: `${formData.title} - ${userName}`,
            user: userName,
            start: startDateTime,
            startStr: startDateTime.toISOString(),
            end: endDateTime,
            endStr: endDateTime.toISOString(),
            duration: duration,
            color: formData.color,
            id_card: card_id,
            accepted: false
        };
        onEventSave(eventData);
        closeModal();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="custom-event">
            <h3>Événement Personnalisé</h3>
            <button className="custom_event_button" onClick={openModal}>
                Créer un Événement
            </button>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nouvel Événement</h2>
                            <button 
                                className="modal-close-button" 
                                onClick={closeModal}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <form onSubmit={handleSubmit} className="event-form">
                                <div className="form-group">
                                    <label htmlFor="title">Titre de l'événement *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Ex: Réunion équipe, Formation..."
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="startDate">Date de début *</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="startTime">Heure de début *</label>
                                        <input
                                            type="time"
                                            id="startTime"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="endDate">Date de fin *</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="endTime">Heure de fin *</label>
                                        <input
                                            type="time"
                                            id="endTime"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="color">Couleur de l'événement</label>
                                    <div className="color-selector">
                                        {predefinedColors.map((colorOption) => (
                                            <label 
                                                key={colorOption.value} 
                                                className={`color-option ${formData.color === colorOption.value ? 'selected' : ''}`}
                                                style={{ backgroundColor: colorOption.value }}
                                                title={colorOption.name}
                                            >
                                                <input
                                                    type="radio"
                                                    name="color"
                                                    value={colorOption.value}
                                                    checked={formData.color === colorOption.value}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button 
                                        type="button" 
                                        className="btn-secondary" 
                                        onClick={closeModal}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Créer l'événement
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomEvent;