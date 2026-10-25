import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";
import { SignInForm } from "../auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in | Food & More Store" };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function SignInPage(props: Props) {
  const { next: rawNext } = await props.searchParams;
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  // Already signed in: nothing to do here.
  if (await getSession()) redirect(next);

  return (
    <div className="authPage">
      <h1>Sign in</h1>
      <SignInForm next={next} />
    </div>
  );
}
