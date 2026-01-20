import React, { useEffect } from "react";
import "./Login.css";
import "../../services/cardScanListener"; // Auto-starts card scan logging

const Login = () => {

    return (
        <div className="Login">
            <h2>Login Page</h2>
            <p>Check browser console for scanned card logs</p>
        </div>
    );
}

export default Login;