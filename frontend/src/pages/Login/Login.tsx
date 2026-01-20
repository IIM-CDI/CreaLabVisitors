import React, { useEffect, useState } from "react";
import "./Login.css";
import Inscription from "../../components/Inscription/Inscription";
import { setCardScanCallback } from "../../services/cardScanListener";

const Login = () => {
    const [scannedCardId, setScannedCardId] = useState<string | null>(null);
    const [existingCardId, setExistingCardId] = useState<boolean | null>(null);
    
    useEffect(() => {
        setCardScanCallback((id: string) => setScannedCardId(id));
        const checkExistingCard = async (id: string) => {
            console.log("Checking existing card for ID:", id);
            try {
                const response = await fetch(`http://localhost:8000/check-card/${id}`);
                const data = await response.json();
                setExistingCardId(data.exists);
            } catch (error) {
                console.error("Error checking existing card:", error);
            }
        }
        if (scannedCardId) {
            checkExistingCard(scannedCardId);
        }
        return () => setCardScanCallback(() => {});
    }, [scannedCardId]);

    return (
        <div className="Login">
            <h2>Login Page</h2>
            {scannedCardId && <p>{existingCardId ? "Card exists" : "Card does not exist"} Scanned Card ID: {scannedCardId}</p>}
            <div className="window_container">
                <Inscription />
            </div>
        </div>
    );
};

export default Login;