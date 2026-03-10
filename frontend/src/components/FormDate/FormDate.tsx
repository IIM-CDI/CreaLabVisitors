import React from "react";
import "./FormDate.css"

interface FormDateProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const FormDate = ({ label, value, onChange }: FormDateProps) => {
    return (
        <div className="form_date">
            <label className="form_date_label">{label}</label>
            <input
                type="date"
                name={label}
                required
                className="form_date_input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default FormDate;