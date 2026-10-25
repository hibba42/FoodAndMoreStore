"use client";

import { useSyncExternalStore } from "react";

const FORMAT: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };
const subscribe = () => () => {};

// Shows a moment in the VISITOR's own time zone.
// The server doesn't know the visitor's time zone, so the first render uses UTC
// (labelled), and the browser then switches to local time right after loading.
export default function LocalDateTime({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => new Date(iso).toLocaleString("en-US", FORMAT), // in the browser
    () => `${new Date(iso).toLocaleString("en-US", { ...FORMAT, timeZone: "UTC" })} UTC` // on the server
  );

  return <time dateTime={iso}>{text}</time>;
}
