import { DraggableEvent } from './types';

export const draggableEvents: DraggableEvent[] = [
    { id: 1, title: "Impression 3D", duration: "00:30", color: "#ff9f89", visibility: 'all', accepted: false },
    { id: 2, title: "Peinture", duration: "02:00", color: "#b8ff89", visibility: 'all', accepted: false },
    { id: 3, title: "Atelier Electronique", duration: "01:00", color: "#89d8ff", visibility: 'all', accepted: false },
    { id: 4, title: "Cours au Crealab", duration: "24:00", color: "#ffef89", visibility: 'staff', accepted: false },
    { id: 5, title: "Semaine de cours", duration: "120:00", color: "#d089ff", visibility: 'staff', accepted: false }
];

export const calendarConfig = {
    headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridDay,timeGridWeek,dayGridMonth"
    },
    buttonText: {
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour'
    },
    initialView: "timeGridWeek",
    firstDay: 1,
    slotLabelFormat: {
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        hour12: false as const
    },
    eventTimeFormat: {
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        hour12: false as const
    }
};