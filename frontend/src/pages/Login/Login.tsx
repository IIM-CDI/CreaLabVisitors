import React, { useEffect, useState } from "react";
import "./Login.css";
import Inscription from "../../components/Inscription/Inscription";
import Connexion from "../../components/Connexion/Connexion";
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
            {existingCardId === null && <h2>Login Page</h2>}
            <div className="window_container">
                {existingCardId === null && <p>Please scan your card to proceed.</p>}
                {existingCardId === false && scannedCardId && <Inscription card_id={scannedCardId} />}
                {existingCardId === true && scannedCardId && <Connexion card_id={scannedCardId} />}
            </div>
        </div>
    );
};

export default Login;