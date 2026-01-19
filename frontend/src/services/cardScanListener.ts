// Simple card scan console logger
export const checkScan = async () => {
    try {
        const response = await fetch("http://localhost:8000/latest-card");
        const data = await response.json();
        
        // Log to browser console if card was scanned
        if (data.id) {
            console.log(`🎫 Card Scanned: ${data.id} at ${new Date().toLocaleTimeString()}`);
        }
    } catch (error) {
        console.error("Error checking card scan:", error);
    }
};

// Auto-check for scanned cards every 2 seconds
setInterval(checkScan, 2000);