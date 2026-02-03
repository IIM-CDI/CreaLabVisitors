import React from "react";
import "./Login.css";

// This component is now simplified as the main login logic has been moved to App.tsx
// It can be used for specific login-related UI if needed in the future

const Login = () => {
    return (
        <div className="Login">
            <h2>Login Page</h2>
            <div className="window_container">
                <p>Please scan your card to proceed.</p>
            </div>
        </div>
    );
};

export default Login;