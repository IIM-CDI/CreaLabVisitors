import React, { useEffect } from "react";
import "./Login.css";
import "../../services/cardScanListener"; // Auto-starts card scan logging

const Login = () => {

    useEffect(() => {
        // Notify user that card scan logging is active
        console.log("🚀 Card scan logging active - Scanned cards will appear here!");
    }, []);

    return (
        <div className="Login">
            <h2>Login Page</h2>
            <p>Check browser console for scanned card logs</p>
        </div>
    );
}

export default Login;