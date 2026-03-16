interface DraggableEvent {
    id: number;
    title: string;
    duration: string;
    color: string;
    visibility: 'all' | 'staff';
    accepted: boolean;
}

export const draggableEvents: DraggableEvent[] = [
    { id: 1, title: "Impression 3D", duration: "00:30", color: "#ff8c8c", visibility: 'all', accepted: false },
    { id: 2, title: "Peinture", duration: "02:00", color: "#98ff8c", visibility: 'all', accepted: false },
    { id: 3, title: "Atelier Electronique", duration: "01:00", color: "#8cbaff", visibility: 'all', accepted: false },
    { id: 4, title: "Cours au Crealab", duration: "24:00", color: "#fff48c", visibility: 'staff', accepted: false },
    { id: 5, title: "Semaine de cours", duration: "120:00", color: "#ff8cfd", visibility: 'staff', accepted: false }
];