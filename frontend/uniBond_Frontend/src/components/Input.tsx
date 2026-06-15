type Props = {
    label: string;
    name: string;
    type?: string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    autoComplete?: string;
};

export default function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    hint,
    required = false,
    autoComplete,
}: Props) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="field-label">
                {label}{required ? " *" : ""}
            </label>
            <input
                id={name}
                placeholder={placeholder ?? label}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
                className={`field-shell ${error ? "field-shell-error" : ""}`}
            />
            {error ? <p id={`${name}-error`} className="field-error">{error}</p> : null}
            {!error && hint ? <p id={`${name}-hint`} className="field-hint">{hint}</p> : null}
        </div>
    );
}
