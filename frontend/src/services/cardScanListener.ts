// Simple card scan listener with callback support
let previousId: string | null = null;
let onCardScanned: ((id: string) => void) | null = null;

// Function to set the callback (components can call this to listen for scans)
export const setCardScanCallback = (callback: (id: string) => void) => {
    onCardScanned = callback;
};

export const checkScan = async () => {
    try {
        const response = await fetch("http://localhost:8000/latest-card");
        const data = await response.json();
        if (data.id && data.id !== previousId) {
            console.log(`🎫 Card Scanned: ${data.id} at ${new Date().toLocaleTimeString()}`);
            previousId = data.id;
            if (onCardScanned) onCardScanned(data.id);
        }
    } catch (error) {
        console.error("Error checking card scan:", error);
    }
};

// Auto-check for scanned cards every 2 seconds
setInterval(checkScan, 2000);