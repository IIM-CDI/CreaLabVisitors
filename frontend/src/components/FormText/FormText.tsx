import React from "react";
import "./FormText.css"

interface FormTextProps {
    label: string;
    value: string;
    defaultValue?: string;
    readonly?: boolean;
    onChange?: (value: string) => void;
}

const FormText = ({ label, value, defaultValue, readonly, onChange }: FormTextProps) => {
    return (
        <div className="form_text">
            <label className="form_text_label">{label}</label>
            <input
                type="text"
                name={label}
                required
                placeholder="Nom de l'evenement"
                className="form_text_input"
                value={value}
                defaultValue={defaultValue}
                onChange={(e) => onChange?.(e.target.value)}
                readOnly={readonly}
            />
        </div>
    );
}

export default FormText;