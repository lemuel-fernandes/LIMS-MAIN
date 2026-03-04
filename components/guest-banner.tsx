"use client";

/**
 * GuestBanner
 *
 * A thin amber banner that appears at the very top of every page when
 * the user is logged in as a guest, reminding them that all changes
 * are temporary.
 */

import { useGuestMode } from "./guest-mode-provider";
import { AlertTriangle } from "lucide-react";

export function GuestBanner() {
  const { isGuest } = useGuestMode();

  if (!isGuest) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800 flex items-center justify-center gap-2 sticky top-0 z-50">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>
        <strong>Guest Mode</strong> — All changes are temporary and will be lost
        when you log out or close the browser.
      </span>
    </div>
  );
}
