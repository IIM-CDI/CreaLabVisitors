import React, { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import Modification from "../Modification/Modification";
import "./Connexion.css";

interface ConnexionProps {
    card_id: string;
}

interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    [key: string]: any;
}

const Connexion = ({ card_id }: ConnexionProps) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [modificationOpen, setModificationOpen] = useState(false);

    const { token } = useAuth();

    const getProfile = async (id: string) => {
        try {
            const headers: Record<string,string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
            const response = await fetch(`${apiUrl}/get-profile/${id}`, { headers });
            const data = await response.json();
            if (data?.found) setUserData(data.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        if (card_id) getProfile(card_id);
    }, [card_id]);

    return (
        <div className="connexion_container">
            {userData ? (
                modificationOpen ? (
                    <Modification
                        prenom={userData.first_name}
                        nom={userData.last_name}
                        email={userData.email}
                        card_id={card_id}
                        setModificationOpen={setModificationOpen}
                    />
                ) : (
                    <div className="user_info">
                        <p>
                            Bonjour {userData.first_name} {userData.last_name} !
                        </p>
                        <p>Email: {userData.email}</p>
                        <button onClick={() => setModificationOpen(true)}>
                            Modifier les informations
                        </button>
                    </div>
                )
            ) : (
                <p>Chargement des informations...</p>
            )}
        </div>
    );
};

export default Connexion;