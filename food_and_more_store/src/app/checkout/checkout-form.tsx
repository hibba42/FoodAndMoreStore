"use client";

import { useActionState } from "react";
import { placeOrder } from "@/lib/checkout-actions";
import { type CheckoutState, type CheckoutValues } from "@/lib/checkout-types";
import { Field, StateSelect } from "../form-field";

type Props = {
  defaults: CheckoutValues; // blank for guests; saved details for signed-in members
  requiresBirthDate: boolean;
  signedIn: boolean;
};

export default function CheckoutForm({ defaults, requiresBirthDate, signedIn }: Props) {
  const initialState: CheckoutState = {
    values: defaults,
    fieldErrors: {},
    message: null,
    saveDetails: true,
  };
  const [state, formAction, pending] = useActionState(placeOrder, initialState);
  const { values, fieldErrors } = state;

  return (
    <form action={formAction} className="checkoutForm">
      <h2>Contact</h2>
      <Field name="name" label="Full name" defaultValue={values.name} error={fieldErrors.name}
        autoComplete="name" maxLength={100} required />
      <Field name="email" label="Email" type="email" defaultValue={values.email} error={fieldErrors.email}
        autoComplete="email" inputMode="email" maxLength={100} required />
      <Field name="phone" label="Phone" type="tel" defaultValue={values.phone} error={fieldErrors.phone}
        autoComplete="tel" inputMode="tel" maxLength={20} />

      <h2>Shipping address</h2>
      <Field name="address" label="Street address" defaultValue={values.address} error={fieldErrors.address}
        autoComplete="street-address" maxLength={150} required />
      <Field name="city" label="City" defaultValue={values.city} error={fieldErrors.city}
        autoComplete="address-level2" maxLength={60} required />

      <div className="fieldRow">
        <StateSelect defaultValue={values.state} error={fieldErrors.state} required />
        <Field name="zip" label="ZIP code" defaultValue={values.zip} error={fieldErrors.zip}
          autoComplete="postal-code" inputMode="numeric" maxLength={10} required />
      </div>

      {requiresBirthDate && (
        <>
          <h2>Age verification</h2>
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

      {signedIn && (
        <div className="checkboxField">
          <input
            id="saveDetails"
            name="saveDetails"
            type="checkbox"
            defaultChecked={state.saveDetails}
          />
          <label htmlFor="saveDetails">Save these details to my account</label>
        </div>
      )}

      {state.message && (
        <p className="formMessage" role="alert">
          {state.message}
        </p>
      )}

      <button type="submit" className="formButton" disabled={pending}>
        {pending ? "Placing order…" : "Place order"}
      </button>
      <p className="fieldHint">
        This is a demo store: no payment is taken and nothing is shipped, so please use
        made-up contact details.
      </p>
    </form>
  );
}
