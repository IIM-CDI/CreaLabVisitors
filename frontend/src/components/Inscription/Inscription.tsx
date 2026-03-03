import React from "react";
import "./Inscription.css";

interface InscriptionInterface {
    card_id: string;
};


const Inscription = ({card_id}: InscriptionInterface) => {

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const formEl = event.target as HTMLFormElement;

        const formData = new FormData(formEl);
        const prenom = formData.get("prenom");
        const nom = formData.get("nom");
        const email = formData.get("email");

        const headers: Record<string,string> = { "Content-Type": "application/json" };
        const apiUrl = process.env.REACT_APP_ENV === 'PROD' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
        fetch(`${apiUrl}/submit`, {
            method: "POST",
            headers,
            body: JSON.stringify({ prenom, nom, email, card_id }),
        })
        .then(() => {
            formEl.reset();
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
                <label className="form_prenom">
                    Prénom :
                    <input type="text" name="prenom" required minLength={1}  />
                </label>
                <label className="form_nom">
                    Nom :
                    <input type="text" name="nom" required minLength={1} />
                </label>
                <label className="form_email">
                    Email :
                    <input type="email" name="email" required />
                </label>
                <label className="form_card_id">
                    ID Carte :
                    <input type="text" name="card_id" value={card_id} disabled />
                </label>
                <label className="form_role">
                    Rôle :
                    <select name="role" >
                        <option value="etudiant" selected>Etudiant</option>
                        <option value="staff">Staff</option>
                    </select>
                </label>
                <button type="submit">S'inscrire</button>
            </form>
        </div>
    );
}

export default Inscription;