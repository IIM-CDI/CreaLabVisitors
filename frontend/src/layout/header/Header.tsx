import React, { useState } from "react";
import "./Header.css";
import CustomModal from "../../components/CustomModal/CustomModal";

interface HeaderInterface {
    setScannedCardId?: (id: string | null) => void;
    isAdmin?: boolean;
}

const Header = ({ setScannedCardId, isAdmin }: HeaderInterface) => {
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
            <CustomModal isOpen={isModalOpen} onClose={closeModal} />
            {isAdmin !== false && <button className="modal_button" onClick={openModal} > Open Modal </button>}
            <button className="logout_button" onClick={handleLogout}> Déconnexion </button>
        </header>
    );
}

export default Header;