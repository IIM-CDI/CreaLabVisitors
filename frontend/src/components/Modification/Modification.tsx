import React, { useState } from "react";
import "./Modification.css";
import { UserData } from "../../types/globalTypes";
import FormText from "../FormText/FormText";
import FormEmail from "../FormEmail/FormEmail";
import Bouton from "../Bouton/Bouton";
import { useApi } from "../../hooks/useApi";
import { useModalManager } from "../../hooks/useModalManager";

interface ModificationProps {
    userData: UserData;
    card_id: string;
    setModificationOpen?: (open: boolean) => void;
}

const Modification = ({ userData, card_id, setModificationOpen }: ModificationProps) => {
    const { getApiUrl, getHeaders } = useApi();
    const [prenom, setPrenom] = useState(userData.first_name);
    const [nom, setNom] = useState(userData.last_name);
    const [email, setEmail] = useState(userData.email);
    const [role, setRole] = useState(userData.role);
    const [isLoading, setIsLoading] = useState(false);
    const { handleClose, handleBackdropClick } = useModalManager({
        isOpen: true,
        onClose: () => setModificationOpen?.(false),
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const apiUrl = getApiUrl();
            const headers = getHeaders();

            await fetch(`${apiUrl}/update-profile`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    card_id,
                    first_name: String(prenom),
                    last_name: String(nom),
                    email: String(email),
                    role: String(role).toLowerCase()
                }),
            });
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modification_overlay" onClick={handleBackdropClick}>
            <div
                className="modification_container"
                role="dialog"
                aria-modal="true"
                aria-label="Modification des informations"
            >
                <h2>Modification des informations</h2>
                <form className="modification_form" onSubmit={handleSubmit}>
                    <FormText
                        label="prenom"
                        value={prenom}
                        defaultValue={userData.first_name}
                        onChange={setPrenom}
                    />
                    <FormText
                        label="nom"
                        value={nom}
                        defaultValue={userData.last_name}
                        onChange={setNom}
                    />
                    <FormEmail
                        label="email"
                        value={email}
                        defaultValue={userData.email}
                        onChange={setEmail}
                    />
                    <FormText
                        label="role"
                        value={role}
                        defaultValue={userData.role}
                        onChange={setRole}
                        readonly={true}
                    />
                    <FormText
                        label="card_id"
                        value={card_id}
                        defaultValue={userData.card_id}
                        onChange={() => {}}
                        readonly={true}
                    />
                    <Bouton
                        component_type="cancel"
                        label="Annuler"
                        onClick={handleClose}
                    />
                    <Bouton
                        type="submit"
                        label={isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                        component_type="accept"
                        disabled={isLoading}
                    />
                </form>
            </div>
        </div>
    );
};

export default Modification;
