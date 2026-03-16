import React, { useState } from "react";
import "./Header.css";
import Bouton from "../../components/Bouton/Bouton";
import AdminModal from "../../components/AdminModal/AdminModal";

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
            <AdminModal isOpen={isModalOpen} onClose={closeModal} onEventChange={onEventChange} />
                <Bouton label="Deconnexion" component_type="primary" onClick={handleLogout} />
            {isAdmin && (
                <Bouton label="Espace Admin - Validation des events" component_type="primary" onClick={openModal} />
            )}
        </header>
    );
}

export default Header;