import type { ChangeEvent } from "react";

type Option = {
    value: string;
    label: string;
};

type Props = {
    id?: string;
    name?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: Option[];
    className?: string;
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
};

export default function Select({ id, name, value, onChange, options, className, label, error, hint, required }: Props) {
    const fieldId = id ?? name;

    return (
        <div className="space-y-1.5">
            {label && <label htmlFor={fieldId} className="field-label">{label}{required ? " *" : ""}</label>}
            <select
                id={fieldId}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
                className={className || `field-shell ${error ? "field-shell-error" : ""}`}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {error ? <p id={`${fieldId}-error`} className="field-error">{error}</p> : null}
            {!error && hint ? <p id={`${fieldId}-hint`} className="field-hint">{hint}</p> : null}
        </div>
    );
}
