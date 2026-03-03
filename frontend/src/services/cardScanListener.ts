import { io, Socket } from "socket.io-client";

let previousId: string | null = null;
let onCardScanned: ((id: string) => void) | null = null;
let socket: Socket | null = null;

export const setCardScanCallback = (callback: (id: string) => void) => {
    onCardScanned = callback;
};

const initSocket = () => {
    if (socket) return;
    const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
    socket = io(apiUrl || "http://localhost:8000", { transports: ["websocket"] });

    socket.on("connect", () => {
        console.log("Card socket connected", socket?.id);
    });

    socket.on("card_scanned", (cardId: string) => {
        try {
            if (cardId && cardId !== previousId) {
                console.log(`Card scanned (socket): ${cardId}`);
                previousId = cardId;
                if (onCardScanned) onCardScanned(cardId);
            }
        } catch (err) {
            console.error("Error handling card_scanned event:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("Card socket disconnected");
    });
};

// initialize socket listener immediately
initSocket();