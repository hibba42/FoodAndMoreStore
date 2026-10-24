"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import "./auth.css";
import "./form.css";

type Props = { next: string };

function useAuthForm(next: string) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function run(
    event: FormEvent<HTMLFormElement>,
    action: (data: FormData) => Promise<{ message?: string } | null | undefined>
  ) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const failure = await action(new FormData(event.currentTarget));
    if (failure) {
      setError(failure.message ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }
    router.push(next);
    router.refresh(); // the header and server pages must re-read the new session
  }

  return { error, pending, run };
}

export function SignInForm({ next }: Props) {
  const { error, pending, run } = useAuthForm(next);

  return (
    <form
      className="authForm"
      onSubmit={(event) =>
        run(event, async (data) => {
          const { error } = await authClient.signIn.email({
            email: String(data.get("email") ?? ""),
            password: String(data.get("password") ?? ""),
          });
          return error;
        })
      }
    >
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={100} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
        />
      </div>

      {error && (
        <p className="formMessage" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="formButton" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p>
        New here?{" "}
        <Link className="authLink" href={`/sign-up?next=${encodeURIComponent(next)}`}>
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next }: Props) {
  const { error, pending, run } = useAuthForm(next);
  const [mismatch, setMismatch] = useState(false);

  return (
    <form
      className="authForm"
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        if (data.get("password") !== data.get("confirmPassword")) {
          event.preventDefault();
          setMismatch(true);
          return;
        }
        setMismatch(false);
        return run(event, async (formData) => {
          const { error } = await authClient.signUp.email({
            name: String(formData.get("name") ?? "").trim(),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          });
          return error;
        });
      }}
    >
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={100} />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={100} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          aria-describedby="password-hint"
        />
        <p className="fieldHint" id="password-hint">
          At least 8 characters.
        </p>
      </div>
      <div className="field">
        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          aria-invalid={mismatch ? true : undefined}
          aria-describedby={mismatch ? "confirm-error" : undefined}
        />
        {mismatch && (
          <p className="fieldError" id="confirm-error">
            The passwords don&apos;t match.
          </p>
        )}
      </div>

      {error && (
        <p className="formMessage" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="formButton" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p>
        Already have an account?{" "}
        <Link className="authLink" href={`/sign-in?next=${encodeURIComponent(next)}`}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
