import React, { useState } from "react";
import "./Header.css";
import ValidateEvents from "../../components/ValidateEvents/ValidateEvents";

interface HeaderInterface {
    setScannedCardId?: (id: string | null) => void;
    isAdmin?: boolean;
    onEventChange?: () => void;
}

const Header = ({ setScannedCardId, isAdmin, onEventChange }: HeaderInterface) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = () => {
        if (setScannedCardId) {
            setScannedCardId(null);
            window.location.reload();
        }
    }

    const openModal = () => {
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
    }

    return (
        <header className="app_header">
            <ValidateEvents isOpen={isModalOpen} onClose={closeModal} onEventChange={onEventChange} />
            {isAdmin && <button className="modal_button" onClick={openModal}>Espace Admin - Validation des events</button>}
            <button className="logout_button" onClick={handleLogout}> Déconnexion </button>
        </header>
    );
}

export default Header;