import React, { useEffect } from "react";
import "./Connexion.css";

interface ConnexionInterface {
    card_id: string;
};

const Connexion = (props: ConnexionInterface) => {

    const [userData, setUserData] = React.useState<any>(null);

    const getProfile = (card_id: string) => {
        fetch(`http://localhost:8000/get-profile/${card_id}`)
        .then(response => response.json())
        .then(data => {
            if (data.found) {
                console.log("Profile Data:", data.data);
                setUserData(data.data);
            } else {
                console.log("No profile found for this card.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }

    useEffect(() => {
        getProfile(props.card_id);
    }, [props.card_id]);

    return (
        <div className="connexion_container">
            <h2>Connexion</h2>
            {userData ? (
                <div className="user_info">
                    <p>Connecté en tant que : {userData.first_name} {userData.last_name} </p>
                    <p>Email : {userData.email}</p>
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}

export default Connexion;