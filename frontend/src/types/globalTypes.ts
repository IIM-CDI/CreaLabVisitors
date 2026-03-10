export interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    [key: string]: string;
}
export interface CalendarEvent {
    card_id: string;
    setIsAdmin: (isAdmin: boolean) => void;
    setRefreshEvents: (refreshFn: () => void) => void;
}

export interface DraggableEvent {
    id: number;
    title: string;
    duration: string;
    color: string;
    visibility: 'all' | 'staff';
    accepted: boolean;
}

export interface CalendarEventData {
    id: string;
    title: string;
    user: string;
    start: Date;
    startStr: string;
    end: Date;
    endStr: string;
    duration: string;
    color: string;
    id_card: string;
    accepted: boolean;
}

export interface FormattedCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
        user: string;
        duration: string;
        id_card: string;
        accepted: boolean;
    };
}

export interface Event {
    id: string;
    title: string;
    startStr: string;
    endStr: string;
}
