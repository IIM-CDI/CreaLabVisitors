import React from "react";
import "./Modification.css";

interface ModificationInterface {
    prenom: string;
    nom: string;
    email: string;
    card_id: string;
    setModificationOpen?: (open: boolean) => void;
}

const Modification = ({ prenom, nom, email, card_id, setModificationOpen }: ModificationInterface) => {

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const formEl = event.target as HTMLFormElement;

        const formData = new FormData(formEl);
        const updatedPrenom = formData.get("prenom");
        const updatedNom = formData.get("nom");
        const updatedEmail = formData.get("email");

        fetch("http://localhost:8000/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prenom: updatedPrenom, nom: updatedNom, email: updatedEmail, card_id }),
        })
        .then(() => {
            formEl.reset();
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
        });
    }

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
                    <input type="text" name="card_id" value={card_id} disabled />
                </label>
                <button type="button" onClick={() => setModificationOpen && setModificationOpen(false)}>Annuler</button>
                <button type="submit">Enregistrer les modifications</button>
            </form>
        </div>
    );
}

export default Modification;