import React, { useState } from "react";
import Modification from "../Modification/Modification";
import "./Connexion.css";

interface ConnexionProps {
    card_id: string;
    userData: UserData | null;
}

interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    [key: string]: string;
}

const Connexion = ({ card_id, userData }: ConnexionProps) => {
    const [modificationOpen, setModificationOpen] = useState(false);

    return (
        <>
            {userData ? (
                modificationOpen ? (
                    <Modification
                        prenom={userData.first_name}
                        nom={userData.last_name}
                        email={userData.email}
                        role={userData.role}
                        card_id={card_id}
                        setModificationOpen={setModificationOpen}
                    />
                ) : (
                    <div className="user_info">
                        <p>
                            Bonjour {userData.first_name} {userData.last_name} !
                        </p>
                        <p>Email: {userData.email}</p>
                        <p>Role: {userData.role}</p>
                        <button onClick={() => setModificationOpen(true)}>
                            Modifier les informations
                        </button>
                    </div>
                )
            ) : (
                <p>Chargement des informations...</p>
            )}
        </>
    );
};

export default Connexion;