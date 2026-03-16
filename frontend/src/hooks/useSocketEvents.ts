import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApi } from './useApi';

interface UseSocketEventsProps {
    isOpen: boolean;
    onEventsUpdated: () => void;
}

export const useSocketEvents = ({ isOpen, onEventsUpdated }: UseSocketEventsProps) => {
    const { getApiUrl } = useApi();

    useEffect(() => {
        let socket: Socket | null = null;
        
        if (isOpen) {
            const apiUrl = getApiUrl();
            socket = io(apiUrl, {
                transports: ["websocket"] 
            });

            socket.on("connect", () => {
                console.log("Modal socket connected", socket?.id);
            });

            socket.on("events_updated", (data: { action: string; event?: unknown; event_id?: string }) => {
                console.log(`Modal - Event ${data.action}:`, data);
                onEventsUpdated();
            });

            socket.on("disconnect", () => {
                console.log("Modal socket disconnected");
            });
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isOpen, getApiUrl, onEventsUpdated]);
};