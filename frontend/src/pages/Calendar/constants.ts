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