import React from "react";
import "./Bouton.css";

interface BoutonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string,
    children?: React.ReactNode,
    component_type?: "primary" | "secondary" | "accept" | "cancel",
    onClick?: () => void
}

const Bouton = ({
    label,
    children,
    component_type = "primary",
    onClick,
    className = "",
    type = "button",
    ...buttonProps
}: BoutonProps) => {
    return (
        <button
            className={`bouton ${component_type} ${className}`.trim()}
            onClick={onClick}
            type={type}
            {...buttonProps}
        >
            {children ?? label}
        </button>
    );
}

export default Bouton;
