import React from "react";
import "./FormEmail.css"

interface FormEmailProps {
    label: string;
    value: string;
    defaultValue?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

const FormEmail = ({ label, value, defaultValue, placeholder = "mail@exemple.com", onChange }: FormEmailProps) => {
    return (
        <div className="form_email">
            <label className="form_email_label">{label}</label>
            <input
                type="email"
                name={label}
                required
                placeholder={placeholder}
                className="form_email_input"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default FormEmail;