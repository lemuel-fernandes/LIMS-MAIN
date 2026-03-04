/**
 * Guest Store — sessionStorage-backed temporary data store for guest mode.
 *
 * Maintains three layers per collection:
 *   - added: items created by the guest (with fake IDs)
 *   - deleted: IDs of real DB items the guest "deleted"
 *   - modified: patches applied to real DB items by the guest
 *
 * On GET requests the interceptor fetches real data from the API and then
 * calls `mergeWithReal()` to overlay guest changes before returning to the UI.
 */

const GUEST_PREFIX = "guest_store_";

export type GuestCollection =
  | "equipments"
  | "departments"
  | "issuances";

function generateId(): string {
  return (
    "guest_" +
    Date.now().toString(16) +
    Math.random().toString(16).slice(2, 10)
  );
}

export const guestStore = {
  // ── helpers ────────────────────────────────────────────────────────

  isGuestMode(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return false;
      return JSON.parse(raw).isGuest === true;
    } catch {
      return false;
    }
  },

  // ── per-collection accessors ───────────────────────────────────────

  getAdded(collection: GuestCollection): any[] {
    try {
      const raw = sessionStorage.getItem(`${GUEST_PREFIX}added_${collection}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getDeleted(collection: GuestCollection): string[] {
    try {
      const raw = sessionStorage.getItem(
        `${GUEST_PREFIX}deleted_${collection}`
      );
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getModified(collection: GuestCollection): Record<string, any> {
    try {
      const raw = sessionStorage.getItem(
        `${GUEST_PREFIX}modified_${collection}`
      );
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  // ── mutators ───────────────────────────────────────────────────────

  add(collection: GuestCollection, data: any): any {
    const items = this.getAdded(collection);
    const newItem = { ...data, _id: generateId() };
    items.push(newItem);
    sessionStorage.setItem(
      `${GUEST_PREFIX}added_${collection}`,
      JSON.stringify(items)
    );
    return newItem;
  },

  markDeleted(collection: GuestCollection, id: string) {
    // guest-created item → just remove from added list
    const added = this.getAdded(collection);
    const guestItem = added.find((item) => item._id === id);
    if (guestItem) {
      sessionStorage.setItem(
        `${GUEST_PREFIX}added_${collection}`,
        JSON.stringify(added.filter((item) => item._id !== id))
      );
      return;
    }
    // real DB item → mark as deleted
    const deleted = this.getDeleted(collection);
    if (!deleted.includes(id)) {
      deleted.push(id);
      sessionStorage.setItem(
        `${GUEST_PREFIX}deleted_${collection}`,
        JSON.stringify(deleted)
      );
    }
  },

  modify(collection: GuestCollection, id: string, updates: any) {
    // guest-created item → update in-place
    const added = this.getAdded(collection);
    const idx = added.findIndex((item) => item._id === id);
    if (idx !== -1) {
      added[idx] = { ...added[idx], ...updates };
      sessionStorage.setItem(
        `${GUEST_PREFIX}added_${collection}`,
        JSON.stringify(added)
      );
      return;
    }
    // real DB item → store a patch
    const modified = this.getModified(collection);
    modified[id] = { ...(modified[id] || {}), ...updates };
    sessionStorage.setItem(
      `${GUEST_PREFIX}modified_${collection}`,
      JSON.stringify(modified)
    );
  },

  // ── merge guest overlay with real API data ─────────────────────────

  mergeWithReal(collection: GuestCollection, realData: any[]): any[] {
    const added = this.getAdded(collection);
    const deleted = this.getDeleted(collection);
    const modified = this.getModified(collection);

    const processedReal = realData
      .filter((item) => !deleted.includes(String(item._id)))
      .map((item) => {
        const mods = modified[String(item._id)];
        return mods ? { ...item, ...mods } : item;
      });

    return [...processedReal, ...added];
  },

  // ── cleanup ────────────────────────────────────────────────────────

  clearAll() {
    if (typeof window === "undefined") return;
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(GUEST_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  },
};
