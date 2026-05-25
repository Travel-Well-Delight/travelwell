"use client";

import { useEffect, useState } from "react";

/**
 * Returns a stable UUID for this browser session.
 * Used to link chat history for logged-out users.
 * Stored in sessionStorage so it resets on tab close.
 */
export function useGuestId(): string {
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    let id = sessionStorage.getItem("tg_guest_id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("tg_guest_id", id);
    }
    setGuestId(id);
  }, []);

  return guestId;
}
