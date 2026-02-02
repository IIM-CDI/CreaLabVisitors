import React from "react";
import { useAuth } from '../../context/AuthContext';
import "./Modification.css";

interface ModificationProps {
    prenom: string;
    nom: string;
    email: string;
    card_id: string;
    setModificationOpen?: (open: boolean) => void;
}

const Modification = ({ prenom, nom, email, card_id, setModificationOpen }: ModificationProps) => {
    const { token } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const formEl = event.target as HTMLFormElement;
        const formData = new FormData(formEl);

        const updatedPrenom = String(formData.get("prenom") || "");
        const updatedNom = String(formData.get("nom") || "");
        const updatedEmail = String(formData.get("email") || "");

        try {
            const headers: Record<string,string> = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;
            const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
            await fetch(`${apiUrl}/update-profile`, {
                method: "POST",
                headers,
                body: JSON.stringify({ prenom: updatedPrenom, nom: updatedNom, email: updatedEmail, card_id }),
            });
            formEl.reset();
            if (setModificationOpen) setModificationOpen(false);
            // keep reload as a fallback to refresh displayed data
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="modification_container">
            <h2>Modification des informations</h2>
            <form className="modification_form" onSubmit={handleSubmit}>
                <label className="form_prenom">
                    Prénom:
                    <input type="text" name="prenom" defaultValue={prenom} required minLength={1} />
                </label>
                <label className="form_nom">
                    Nom:
                    <input type="text" name="nom" defaultValue={nom} required minLength={1} />
                </label>
                <label className="form_email">
                    Email:
                    <input type="email" name="email" defaultValue={email} required />
                </label>
                <label className="form_card_id">
                    Card ID:
                    <input type="text" name="card_id" value={card_id} readOnly />
                </label>
                <button type="button" onClick={() => setModificationOpen && setModificationOpen(false)}>
                    Annuler
                </button>
                <button type="submit">Enregistrer les modifications</button>
            </form>
        </div>
    );
};

export default Modification;