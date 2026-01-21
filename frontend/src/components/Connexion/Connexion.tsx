import React, { useEffect, useState } from "react";
import Modification from "../Modification/Modification";
import "./Connexion.css";

interface ConnexionInterface {
    card_id: string;
};

const Connexion = (props: ConnexionInterface) => {

    const [userData, setUserData] = useState<any>(null);
    const [modificationOpen, setModificationOpen] = useState<boolean>(false);

    const getProfile = (card_id: string) => {
        fetch(`http://localhost:8000/get-profile/${card_id}`)
        .then(response => response.json())
        .then(data => {
            if (data.found) {
                setUserData(data.data);
            }
        })
        .catch((error) => {
            console.error("Error fetching profile:", error);
        });
    }

    useEffect(() => {
        getProfile(props.card_id);
    }, [props.card_id]);

    return (
        <div className="connexion_container">
            {userData ?  (
                modificationOpen ? (
                    <Modification 
                        prenom={userData.first_name} 
                        nom={userData.last_name} 
                        email={userData.email} 
                        card_id={props.card_id} 
                        setModificationOpen={setModificationOpen}
                    />
                ) : (
                    <div className="user_info">
                        <p> Bonjour {userData.first_name} {userData.last_name} !</p>
                        <p>Email: {userData.email}</p>
                        <button onClick={() => setModificationOpen(true)}>Modifier les informations</button>
                    </div>
                )
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

export default Connexion;