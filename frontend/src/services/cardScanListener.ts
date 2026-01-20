let previousId: string | null = null;
let onCardScanned: ((id: string) => void) | null = null;

export const setCardScanCallback = (callback: (id: string) => void) => {
    onCardScanned = callback;
};

export const checkScan = async () => {
    try {
        const response = await fetch("http://localhost:8000/latest-card");
        const data = await response.json();
        if (data.id && data.id !== previousId) {
            console.log(`Card scanned: ${data.id}`);
            previousId = data.id;
            if (onCardScanned) onCardScanned(data.id);
        }
    } catch (error) {
        console.error("Error checking card scan:", error);
    }
};

setInterval(checkScan, 2000);