import React from "react";
import "./Inscription.css";

const Inscription = () => {

    return (
        <div className="inscription_container">
            <h2>Inscription Form</h2>
            <form className="inscription_form">
                <label className="form_prenom">
                    Prenom:
                    <input type="text" name="prenom" />
                </label>
                <label className="form_nom">
                    Nom:
                    <input type="text" name="nom" />
                </label>
                <label className="form_email">
                    Email:
                    <input type="email" name="email" />
                </label>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Inscription;