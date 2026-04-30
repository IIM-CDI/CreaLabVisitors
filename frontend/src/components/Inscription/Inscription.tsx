import React, {useState} from "react";
import "./Inscription.css";
import FormText from "../FormText/FormText";
import FormEmail from "../FormEmail/FormEmail";
import FormPassword from "../FormPassword/FormPassword";
import Bouton from "../Bouton/Bouton";
import { useApi } from "../../hooks/useApi";
import { hashPassword, isSchoolEmail } from "../../utils/auth";

interface InscriptionInterface {
    card_id: string;
};

const NO_CARD_PLACEHOLDER = "000000";

const Inscription = ({card_id}: InscriptionInterface) => {
    const { getApiUrl, getHeaders } = useApi();

    
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [formError, setFormError] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setEmailError("");
        setPasswordError("");
        setFormError("");

        if (!isSchoolEmail(email)) {
            setEmailError("L'email doit se terminer par @devinci.fr ou @edu.devinci.fr.");
            return;
        }

        const headers = getHeaders();
        const apiUrl = getApiUrl();

        try {
            if(password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
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
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.detail || `HTTP error: ${response.status}`);
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
                setPasswordError("Les mots de passe ne correspondent pas.");
                return;
            }

            if (error instanceof Error && error.message.includes("@devinci.fr ou @edu.devinci.fr")) {
                setEmailError("L'email doit se terminer par @devinci.fr ou @edu.devinci.fr.");
                return;
            }

            if (error instanceof Error && error.message) {
                setFormError(error.message);
            } else {
                setFormError("L'inscription a echoue. Veuillez reessayer.");
            }
        }
    }

    return (
        <div className="inscription_container">
            <h2>Formulaire d&apos;Inscription</h2>
            {card_id === NO_CARD_PLACEHOLDER && (
                <p className="inscription_info">
                    Aucun scan de carte detecte. Un identifiant provisoire sera utilise jusqu&apos;a l&apos;association d&apos;une carte.
                </p>
            )}
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
                    onChange={(value) => {
                        setEmail(value);
                        if (emailError) {
                            setEmailError("");
                        }
                    }}
                />
                {emailError && <p className="inscription_error">{emailError}</p>}
                <FormPassword
                    label="Mot de passe"
                    value={password}
                    onChange={(value) => {
                        setPassword(value);
                        if (passwordError) {
                            setPasswordError("");
                        }
                    }}
                    placeholder="mot de passe"
                />
                <FormPassword
                    label="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(value) => {
                        setConfirmPassword(value);
                        if (passwordError) {
                            setPasswordError("");
                        }
                    }}
                    placeholder="confirmer le mot de passe"
                />
                {passwordError && <p className="inscription_error">{passwordError}</p>}
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
                {formError && <p className="inscription_error">{formError}</p>}
                <Bouton type="submit" component_type="primary" label="S'inscrire" />
            </form>
        </div>
    );
}

export default Inscription;