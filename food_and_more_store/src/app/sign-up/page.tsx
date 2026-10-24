import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/safe-redirect";
import { getSession } from "@/lib/session";
import { SignUpForm } from "../auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create an account | Food & More Store" };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function SignUpPage(props: Props) {
  const { next: rawNext } = await props.searchParams;
  const next = safeNextPath(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  if (await getSession()) redirect(next);

  return (
    <div className="authPage">
      <h2>Create an account</h2>
      <SignUpForm next={next} />
    </div>
  );
}
