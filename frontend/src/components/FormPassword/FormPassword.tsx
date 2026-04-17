import React from "react";
import "./FormPassword.css";

interface FormPasswordProps {
    label: string;
    value: string;
    defaultValue?: string;
    readonly?: boolean;
    placeholder?: string;
    onChange?: (value: string) => void;
}

const FormPassword = ({ label, value, defaultValue, readonly, placeholder, onChange }: FormPasswordProps) => {
    return (
        <div className="form_password">
            <label className="form_password_label">{label}</label>
            <input
                type="password"
                name={label}
                required
                placeholder={placeholder}
                className="form_password_input"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange?.(e.target.value)}
                readOnly={readonly}
            />
        </div>
    );
}

export default FormPassword;