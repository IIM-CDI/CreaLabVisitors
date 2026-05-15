import { io, Socket } from "socket.io-client";
import { getApiUrl } from './api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        const apiUrl = getApiUrl();
        socket = io(apiUrl, { transports: ["websocket"] });
    }
    return socket;
};

export default getSocket;
