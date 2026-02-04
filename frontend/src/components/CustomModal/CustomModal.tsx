import React, { useEffect } from "react";
import "./CustomModal.css";

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose }) => {
    // Close modal when clicking outside
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Modal Title</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <p>This is a custom modal component!</p>
                    <p>You can interact with the content inside this modal.</p>
                    <p>Click outside the modal or press Escape to close it.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                       Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;