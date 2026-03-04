"use client";

/**
 * GuestModeProvider
 *
 * Wraps the entire app and installs the guest-mode fetch interceptor
 * when the current user is a guest.  Must be placed inside the root
 * layout so that the interceptor is active before any page-level
 * fetches fire.
 *
 * Also exposes a `useGuestMode()` hook for components that need to
 * know whether we are in guest mode (e.g. to show a banner).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  installGuestFetchInterceptor,
  uninstallGuestFetchInterceptor,
} from "@/lib/guest-fetch";
import { guestStore } from "@/lib/guest-store";

interface GuestModeContextType {
  isGuest: boolean;
}

const GuestModeContext = createContext<GuestModeContextType>({
  isGuest: false,
});

export function useGuestMode() {
  return useContext(GuestModeContext);
}

// Install the interceptor eagerly so that it is in place before any
// child useEffect() makes a fetch call.
if (typeof window !== "undefined") {
  installGuestFetchInterceptor();
}

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Sync React state with localStorage (for the banner, etc.)
    const sync = () => setIsGuest(guestStore.isGuestMode());
    sync();

    // Re-check when localStorage changes (login / logout in other tabs)
    window.addEventListener("storage", sync);
    // Also poll in case the same tab writes to localStorage (storage
    // events only fire across tabs).
    const interval = setInterval(sync, 500);

    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(interval);
    };
  }, []);

  return (
    <GuestModeContext.Provider value={{ isGuest }}>
      {children}
    </GuestModeContext.Provider>
  );
}
