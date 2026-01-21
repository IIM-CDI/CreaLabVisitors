import React from "react";
import "./Header.css";

interface HeaderInterface {
    setScannedCardId?: (id: string | null) => void;
}

const Header = ({ setScannedCardId }: HeaderInterface) => {

    const handleLogout = () => {
        if (setScannedCardId) {
            setScannedCardId(null);
            window.location.reload();
        }
    }

    return (
        <header className="app_header">
            <button className="logout_button" onClick={handleLogout}> Déconnexion </button>
        </header>
    );
}

export default Header;