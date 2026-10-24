import "./form.css";
import { US_STATES, type FieldName } from "@/lib/checkout-types";

type FieldProps = {
  name: FieldName;
  label: string;
  defaultValue: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
  required?: boolean;
  hint?: string;
};

// A labelled text input with an optional hint and error message,
// wired up for screen readers (aria-describedby / aria-invalid).
export function Field({
  name,
  label,
  defaultValue,
  error,
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
  required = false,
  hint,
}: FieldProps) {
  const hintId = `${name}-hint`;
  const errorId = `${name}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {!required && <span className="optional"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {hint && (
        <p className="fieldHint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="fieldError" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

type StateSelectProps = {
  defaultValue: string;
  error?: string;
  required?: boolean;
};

export function StateSelect({ defaultValue, error, required = false }: StateSelectProps) {
  return (
    <div className="field">
      <label htmlFor="state">
        State
        {!required && <span className="optional"> (optional)</span>}
      </label>
      <select
        id="state"
        name="state"
        defaultValue={defaultValue}
        autoComplete="address-level1"
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "state-error" : undefined}
      >
        <option value="">Choose…</option>
        {US_STATES.map((s) => (
          <option key={s.code} value={s.code}>
            {s.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="fieldError" id="state-error">
          {error}
        </p>
      )}
    </div>
  );
}
