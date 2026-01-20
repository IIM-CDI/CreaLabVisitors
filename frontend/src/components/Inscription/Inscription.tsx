import React from "react";
import "./Inscription.css";

interface InscriptionInterface {
    card_id: string;
};

const Inscription = ({card_id}: InscriptionInterface) => {

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const prenom = formData.get("prenom");
        const nom = formData.get("nom");
        const email = formData.get("email");

        fetch("http://localhost:8000/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prenom, nom, email, card_id }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });

        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    return (
        <div className="inscription_container">
            <h2>Inscription Form</h2>
            <form className="inscription_form" onSubmit={handleSubmit}>
                <label className="form_prenom">
                    Prenom:
                    <input type="text" name="prenom" required minLength={1}  />
                </label>
                <label className="form_nom">
                    Nom:
                    <input type="text" name="nom" required minLength={1} />
                </label>
                <label className="form_email">
                    Email:
                    <input type="email" name="email" required />
                </label>
                <label className="form_card_id">
                    Card ID:
                    <input type="text" name="card_id" value={card_id} disabled />
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Inscription;