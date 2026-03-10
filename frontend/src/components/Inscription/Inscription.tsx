import React, {useState} from "react";
import "./Inscription.css";
import FormText from "../FormText/FormText";
import FormEmail from "../FormEmail/FormEmail";
import Bouton from "../Bouton/Bouton";
import { useApi } from "../../hooks/useApi";

interface InscriptionInterface {
    card_id: string;
};


const Inscription = ({card_id}: InscriptionInterface) => {
    const { getApiUrl, getHeaders } = useApi();

    
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const headers = getHeaders();
        const apiUrl = getApiUrl();
        fetch(`${apiUrl}/submit`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                first_name: String(prenom),
                last_name: String(nom),
                email: String(email),
                card_id,
                role: "etudiant"
            }),
        })
        .then(() => {
            setPrenom("");
            setNom("");
            setEmail("");
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error submitting profile:", error);
        });
    }

    return (
        <div className="inscription_container">
            <h2>Formulaire d'Inscription</h2>
            <form className="inscription_form" onSubmit={handleSubmit}>
                <FormText
                    label="Prénom"
                    value={prenom}
                    onChange={setPrenom}
                />
                <FormText
                    label="Nom"
                    value={nom}
                    onChange={setNom}
                />
                <FormEmail
                    label="Email"
                    value={email}
                    onChange={setEmail}
                />
                <FormText
                    label="ID Carte"
                    value={card_id}
                    readonly
                />
                <FormText
                    label="Rôle"
                    value="etudiant"
                    readonly
                />
                <Bouton type="submit" component_type="primary" label="S'inscrire" />
            </form>
        </div>
    );
}

export default Inscription;