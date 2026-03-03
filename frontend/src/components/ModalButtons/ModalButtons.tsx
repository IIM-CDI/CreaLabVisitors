import React from "react";
import "./ModalButtons.css";

interface ModalButtonsProps {
    onValidate: () => void;
    onDelete: () => void;
    isLoading?: boolean;
}

const ModalButtons = ({onValidate, onDelete, isLoading = false}: ModalButtonsProps) => { 
    return (
        <div className="modal-buttons-container">
            <button 
                className="validate-button"
                onClick={onValidate}
                disabled={isLoading}
            >
                {isLoading ? "Traitement..." : "✓ Valider"}
            </button>
            <button 
                className="delete-button"
                onClick={onDelete}
                disabled={isLoading}
            >
                {isLoading ? "Traitement..." : "✗ Supprimer"}
            </button>
        </div>
    );
};

export default ModalButtons;