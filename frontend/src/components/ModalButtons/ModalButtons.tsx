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
                {isLoading ? "Processing..." : "✓ Validate"}
            </button>
            <button 
                className="delete-button"
                onClick={onDelete}
                disabled={isLoading}
            >
                {isLoading ? "Processing..." : "✗ Delete"}
            </button>
        </div>
    );
};

export default ModalButtons;