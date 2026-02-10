import React from "react";
import "./Modification.css";

interface ModificationProps {
    prenom: string;
    nom: string;
    email: string;
    role: string;
    card_id: string;
    setModificationOpen?: (open: boolean) => void;
}

const Modification = ({ prenom, nom, email, role, card_id, setModificationOpen }: ModificationProps) => {
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const formEl = event.target as HTMLFormElement;
        const formData = new FormData(formEl);

        const updatedPrenom = String(formData.get("prenom") || "");
        const updatedNom = String(formData.get("nom") || "");
        const updatedEmail = String(formData.get("email") || "");
        const updatedRole = String(formData.get("role") || "");

        try {
            const headers: Record<string,string> = { "Content-Type": "application/json" };
            const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
            await fetch(`${apiUrl}/update-profile`, {
                method: "POST",
                headers,
                body: JSON.stringify({ prenom: updatedPrenom, nom: updatedNom, email: updatedEmail, card_id, role: updatedRole }),
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
                    Prénom :
                    <input type="text" name="prenom" defaultValue={prenom} required minLength={1} />
                </label>
                <label className="form_nom">
                    Nom :
                    <input type="text" name="nom" defaultValue={nom} required minLength={1} />
                </label>
                <label className="form_email">
                    Email :
                    <input type="email" name="email" defaultValue={email} required />
                </label>
                <label className="form_role">
                    Rôle :
                    <select name="role" >
                        <option value="etudiant" selected={role === "etudiant"}>Etudiant</option>
                        <option value="staff" selected={role === "staff"}>Staff</option>
                    </select>
                </label>
                <label className="form_card_id">
                    ID Carte :
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