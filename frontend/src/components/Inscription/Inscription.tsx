import React, {useState} from "react";
import "./Inscription.css";
import FormText from "../FormText/FormText";
import FormEmail from "../FormEmail/FormEmail";
import FormPassword from "../FormPassword/FormPassword";
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
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const headers = getHeaders();
        const apiUrl = getApiUrl();
        const hashPassword = async (password: string): Promise<string> => {
            if(password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        try {
            const hashedPassword = await hashPassword(String(password));

            const response = await fetch(`${apiUrl}/submit`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                first_name: String(prenom),
                last_name: String(nom),
                email: String(email),
                password: hashedPassword,
                card_id,
                role: "etudiant"
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            alert("Inscription réussie !");
            setPrenom("");
            setNom("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            window.location.reload();
        } catch (error) {
            console.error("Error submitting profile:", error);
            if (error instanceof Error && error.message === "Passwords do not match") {
                alert("Les mots de passe ne correspondent pas.");
                return;
            }

            alert("L'inscription a échoué. Veuillez réessayer.");
        }
    }

    return (
        <div className="inscription_container">
            <h2>Formulaire d&apos;Inscription</h2>
            <form className="inscription_form" onSubmit={handleSubmit}>
                <FormText
                    label="Prénom"
                    value={prenom}
                    onChange={setPrenom}
                    placeholder="prénom"
                />
                <FormText
                    label="Nom"
                    value={nom}
                    onChange={setNom}
                    placeholder="nom"
                />
                <FormEmail
                    label="Email"
                    value={email}
                    onChange={setEmail}
                />
                <FormPassword
                    label="Mot de passe"
                    value={password}
                    onChange={setPassword}
                    placeholder="mot de passe"
                />
                <FormPassword
                    label="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="confirmer le mot de passe"
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