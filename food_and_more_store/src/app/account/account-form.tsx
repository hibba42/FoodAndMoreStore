"use client";

import { useActionState } from "react";
import { saveAccountDetails } from "@/lib/account-actions";
import { type AccountState, type ProfileValues } from "@/lib/checkout-types";
import { Field, StateSelect } from "../form-field";

export default function AccountForm({ defaults }: { defaults: ProfileValues }) {
  const initialState: AccountState = {
    values: defaults,
    fieldErrors: {},
    message: null,
    saved: false,
  };
  const [state, formAction, pending] = useActionState(saveAccountDetails, initialState);
  const { values, fieldErrors } = state;

  return (
    <form action={formAction} className="accountForm">
      <Field name="name" label="Full name" defaultValue={values.name} error={fieldErrors.name}
        autoComplete="name" maxLength={100} required />
      <Field name="phone" label="Phone" type="tel" defaultValue={values.phone} error={fieldErrors.phone}
        autoComplete="tel" inputMode="tel" maxLength={20} />
      <Field name="address" label="Street address" defaultValue={values.address} error={fieldErrors.address}
        autoComplete="street-address" maxLength={150} />
      <Field name="city" label="City" defaultValue={values.city} error={fieldErrors.city}
        autoComplete="address-level2" maxLength={60} />

      <div className="fieldRow">
        <StateSelect defaultValue={values.state} error={fieldErrors.state} />
        <Field name="zip" label="ZIP code" defaultValue={values.zip} error={fieldErrors.zip}
          autoComplete="postal-code" inputMode="numeric" maxLength={10} />
      </div>

      <Field
        name="dateOfBirth"
        label="Date of birth"
        type="date"
        defaultValue={values.dateOfBirth}
        error={fieldErrors.dateOfBirth}
        autoComplete="bday"
        hint="Only used to check the 21+ requirement on age-restricted items."
      />

      {state.message && (
        <p className="formMessage" role="alert">
          {state.message}
        </p>
      )}
      {state.saved && (
        <p className="formMessage" role="status">
          Your details were saved.
        </p>
      )}

      <button type="submit" className="formButton" disabled={pending}>
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
