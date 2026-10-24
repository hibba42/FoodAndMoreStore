// Types and constants shared by the checkout form (client) and the
// order-placing Server Action. No server-only imports here.

export const FIELD_NAMES = [
  "name",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "zip",
  "dateOfBirth",
] as const;

export type FieldName = (typeof FIELD_NAMES)[number];
export type CheckoutValues = Record<FieldName, string>;

export type CheckoutState = {
  values: CheckoutValues; // what to show in the form (kept after errors)
  fieldErrors: Partial<Record<FieldName, string>>;
  message: string | null; // form-level message
  saveDetails: boolean; // "save these details to my account" (signed-in only)
};

// The account page edits the same fields except email (which belongs to the account).
export const PROFILE_FIELD_NAMES = [
  "name",
  "phone",
  "address",
  "city",
  "state",
  "zip",
  "dateOfBirth",
] as const;

export type ProfileValues = Record<(typeof PROFILE_FIELD_NAMES)[number], string>;

export type AccountState = {
  values: ProfileValues;
  fieldErrors: Partial<Record<FieldName, string>>;
  message: string | null;
  saved: boolean;
};

export const EMPTY_VALUES: CheckoutValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  dateOfBirth: "",
};

export const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

export const STATE_CODES: string[] = US_STATES.map((s) => s.code);
