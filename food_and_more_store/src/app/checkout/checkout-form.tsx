"use client";

import { useActionState } from "react";
import { placeOrder } from "@/lib/checkout-actions";
import {
  US_STATES,
  type CheckoutState,
  type CheckoutValues,
  type FieldName,
} from "@/lib/checkout-types";

type Props = {
  defaults: CheckoutValues; // blank for guests; saved details for signed-in members later
  requiresBirthDate: boolean;
};

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

function Field({
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

export default function CheckoutForm({ defaults, requiresBirthDate }: Props) {
  const initialState: CheckoutState = { values: defaults, fieldErrors: {}, message: null };
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const { values, fieldErrors } = state;

  return (
    <form action={formAction} className="checkoutForm">
      <h3>Contact</h3>
      <Field name="name" label="Full name" defaultValue={values.name} error={fieldErrors.name}
        autoComplete="name" maxLength={100} required />
      <Field name="email" label="Email" type="email" defaultValue={values.email} error={fieldErrors.email}
        autoComplete="email" inputMode="email" maxLength={100} required />
      <Field name="phone" label="Phone" type="tel" defaultValue={values.phone} error={fieldErrors.phone}
        autoComplete="tel" inputMode="tel" maxLength={20} />

      <h3>Shipping address</h3>
      <Field name="address" label="Street address" defaultValue={values.address} error={fieldErrors.address}
        autoComplete="street-address" maxLength={150} required />
      <Field name="city" label="City" defaultValue={values.city} error={fieldErrors.city}
        autoComplete="address-level2" maxLength={60} required />

      <div className="fieldRow">
        <div className="field">
          <label htmlFor="state">State</label>
          <select
            id="state"
            name="state"
            defaultValue={values.state}
            autoComplete="address-level1"
            required
            aria-invalid={fieldErrors.state ? true : undefined}
            aria-describedby={fieldErrors.state ? "state-error" : undefined}
          >
            <option value="">Choose…</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          {fieldErrors.state && (
            <p className="fieldError" id="state-error">
              {fieldErrors.state}
            </p>
          )}
        </div>
        <Field name="zip" label="ZIP code" defaultValue={values.zip} error={fieldErrors.zip}
          autoComplete="postal-code" inputMode="numeric" maxLength={10} required />
      </div>

      {requiresBirthDate && (
        <>
          <h3>Age verification</h3>
          <Field
            name="dateOfBirth"
            label="Date of birth"
            type="date"
            defaultValue={values.dateOfBirth}
            error={fieldErrors.dateOfBirth}
            autoComplete="bday"
            required
            hint="Required because your cart contains age-restricted items (21+)."
          />
        </>
      )}

      {state.message && (
        <p className="formMessage" role="alert">
          {state.message}
        </p>
      )}

      <button type="submit" className="placeOrderButton" disabled={pending}>
        {pending ? "Placing order…" : "Place order"}
      </button>
      <p className="fieldHint">
        Payment isn&apos;t connected yet. Placing an order records it, and nothing is charged.
      </p>
    </form>
  );
}
