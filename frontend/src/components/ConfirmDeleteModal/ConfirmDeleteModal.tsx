import React from "react";
import "./ConfirmDeleteModal.css";
import Bouton from "../Bouton/Bouton";
import { useModalManager } from "../../hooks/useModalManager";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    eventTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteModal = ({ isOpen, eventTitle, onConfirm, onCancel }: ConfirmDeleteModalProps) => {
    const { handleClose, handleBackdropClick } = useModalManager({
        isOpen,
        onClose: onCancel,
    });

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="confirm-delete-modal" role="dialog" aria-modal="true" aria-label="Confirmation de suppression">
                <div className="modal-body">
                    <p>
                        Êtes-vous sûr de vouloir supprimer : <strong>{eventTitle}</strong> ?
                    </p>
                    <p className="warning-text">Cette action ne peut pas être annulée.</p>
                </div>
                <div className="modal-footer">
                    <Bouton
                        component_type="cancel"
                        label="Non"
                        onClick={handleClose}
                    />
                    <Bouton
                        component_type="accept"
                        label="Oui"
                        onClick={onConfirm}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
