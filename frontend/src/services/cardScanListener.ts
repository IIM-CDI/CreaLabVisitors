import { getSocket } from './socketClient';

let previousId: string | null = null;
let onCardScanned: ((id: string) => void) | null = null;

export const setCardScanCallback = (callback: (id: string) => void) => {
    onCardScanned = callback;
};

const initSocket = () => {
    const socket = getSocket();

    socket.on("connect", () => {
        console.log("Card socket connected", socket.id);
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

initSocket();