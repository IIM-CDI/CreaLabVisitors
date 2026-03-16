import React from "react";
import "./FormColor.css"

interface FormColorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const FormColor = ({ label, value, onChange }: FormColorProps) => {
    return (
        <div className="form_color">
            <label className="form_color_label">{label}</label>
            <input
                type="color"
                name={label}
                required
                className="form_color_input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default FormColor;