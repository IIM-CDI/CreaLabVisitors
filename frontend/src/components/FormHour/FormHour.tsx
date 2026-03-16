import React from "react";
import "./FormHour.css"

interface FormHourProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const FormHour = ({ label, value, onChange }: FormHourProps) => {
    return (
        <div className="form_hour">
            <label className="form_hour_label">{label}</label>
            <input
                type="time"
                name={label}
                required
                className="form_hour_input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default FormHour;