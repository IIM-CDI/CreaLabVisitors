import React, { useEffect, useState } from "react";
import "./Login.css";
import Inscription from "../../components/Inscription/Inscription";
import Connexion from "../../components/Connexion/Connexion";
import { useAuth } from '../../context/AuthContext';

type Props = {
    scannedCardId: string | null;
};

const Login = ({ scannedCardId }: Props) => {
    const [existingCardId, setExistingCardId] = useState<boolean | null>(null);
    const { setToken } = useAuth();
    
    useEffect(() => {
        const checkExistingCard = async (id: string) => {
            try {
                const response = await fetch(`http://localhost:8000/check-card/${id}`);
                const data = await response.json();
                setExistingCardId(data.exists);
                if (data.exists && data.token) {
                    setToken(data.token);
                }
            } catch (error) {
                console.error("Error checking existing card:", error);
            }
        }
        if (scannedCardId) {
            checkExistingCard(scannedCardId);
        } else {
            setExistingCardId(null);
        }
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