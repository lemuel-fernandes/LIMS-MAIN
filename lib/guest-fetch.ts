/**
 * Guest Fetch Interceptor
 *
 * When guest mode is active this module monkey-patches `window.fetch` so that:
 *   • Write operations (POST / PUT / DELETE) are redirected to the sessionStorage-
 *     backed guest store and return realistic mock responses.
 *   • Read operations (GET) are passed through to the real API and then merged
 *     with any guest-created / modified / deleted data before being returned
 *     to the calling component.
 *
 * The interceptor checks `guestStore.isGuestMode()` on **every** call so
 * that it becomes a no-op the moment the user logs out.
 */

import { guestStore, type GuestCollection } from "./guest-store";

// ── helpers ──────────────────────────────────────────────────────────

function mockResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function parseBody(init?: RequestInit): Promise<any> {
  if (!init?.body) return {};
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }
  // FormData, ReadableStream, etc. — can't easily parse
  return {};
}

function extractUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return (input as Request).url;
}

function extractMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== "string" && !(input instanceof URL)) {
    return ((input as Request).method || "GET").toUpperCase();
  }
  return "GET";
}

// ── route handler types ──────────────────────────────────────────────

type WriteHandler = {
  match: (url: string, method: string) => boolean;
  handle: (
    url: string,
    method: string,
    init?: RequestInit
  ) => Promise<Response>;
};

type ReadMergeRule = {
  match: (url: string) => boolean;
  collection: GuestCollection;
};

// ── write handlers (POST / PUT / DELETE) ─────────────────────────────

const writeHandlers: WriteHandler[] = [
  // ── Equipment ──────────────────────────────────────────────────────
  {
    match: (url, m) =>
      m === "POST" && /\/incharge\/equipment\/api\/?(\?.*)?$/.test(url),
    handle: async (_u, _m, init) => {
      const body = await parseBody(init);
      const item = guestStore.add("equipments", {
        ...body,
        status: body.status || "Available",
      });
      return mockResponse({ insertedId: item._id });
    },
  },
  {
    match: (url, m) =>
      m === "POST" && /\/api\/equipments\/upload\/?(\?.*)?$/.test(url),
    handle: async () =>
      mockResponse({
        message: "File uploaded successfully (guest mode — no rows imported).",
        totalRows: 0,
      }),
  },

  // ── Issuances ──────────────────────────────────────────────────────
  {
    match: (url, m) =>
      m === "POST" && /\/api\/issuances\/?(\?.*)?$/.test(url),
    handle: async (_u, _m, init) => {
      const body = await parseBody(init);
      guestStore.add("issuances", {
        studentRegNo: body.studentRegNo,
        experimentId: body.experimentId || null,
        experimentName: body.experimentName || "Custom Issuance",
        equipmentIds: body.equipmentIds || [],
        issuanceDate: new Date().toISOString(),
        returnDate: null,
        status: "Active",
        studentDetails: {},
        equipmentDetails: [],
      });
      return mockResponse({ message: "Issuance recorded successfully!" });
    },
  },
  {
    match: (url, m) =>
      m === "PUT" && /\/api\/issuances\/?(\?.*)?$/.test(url),
    handle: async (_u, _m, init) => {
      const body = await parseBody(init);
      if (body.issuanceId) {
        guestStore.modify("issuances", body.issuanceId, {
          status: "Returned",
          returnDate: new Date().toISOString(),
        });
      }
      return mockResponse({ message: "Equipment returned successfully!" });
    },
  },

  // ── Departments ────────────────────────────────────────────────────
  {
    match: (url, m) =>
      m === "POST" && /\/instructor\/departments\/api\/?(\?.*)?$/.test(url),
    handle: async (_u, _m, init) => {
      const body = await parseBody(init);
      const dept = guestStore.add("departments", body);
      return mockResponse({
        message: "Department created successfully!",
        insertedId: dept._id,
      });
    },
  },
  {
    match: (url, m) =>
      m === "PUT" && /\/instructor\/departments\/api\/?(\?.*)?$/.test(url),
    handle: async (_u, _m, init) => {
      const body = await parseBody(init);
      if (body._id) guestStore.modify("departments", body._id, body);
      return mockResponse({ message: "Department updated successfully!" });
    },
  },
  {
    match: (url, m) =>
      m === "DELETE" && /\/instructor\/departments\/api\/?(\?.*)?$/.test(url),
    handle: async (_u, _m, init) => {
      const body = await parseBody(init);
      if (body._id) guestStore.markDeleted("departments", body._id);
      return mockResponse({ message: "Department deleted successfully!" });
    },
  },

  // ── Profile operations (just return success, no store needed) ──────
  {
    match: (url, m) =>
      m === "POST" && /\/profile\/api\/change-password\/?(\?.*)?$/.test(url),
    handle: async () =>
      mockResponse({ message: "Password changed successfully (guest mode)." }),
  },
  {
    match: (url, m) =>
      (m === "POST" || m === "PUT") &&
      /\/profile\/api\/notifications?\/?(\?.*)?$/.test(url),
    handle: async () =>
      mockResponse({ message: "Settings updated successfully (guest mode)." }),
  },
  {
    match: (url, m) =>
      m === "POST" && /\/instructor\/profile\/api\/?(\?.*)?$/.test(url),
    handle: async () =>
      mockResponse({ message: "Password changed successfully (guest mode)." }),
  },
  {
    match: (url, m) =>
      m === "PUT" && /\/instructor\/profile\/api\/?(\?.*)?$/.test(url),
    handle: async () =>
      mockResponse({ message: "Settings updated successfully (guest mode)." }),
  },

  // ── Catch-all for any other POST/PUT/DELETE/PATCH to /api paths ────
  // This ensures we never accidentally write to the DB.
  {
    match: (url, m) =>
      ["POST", "PUT", "DELETE", "PATCH"].includes(m) &&
      /\/(api|incharge|instructor)\//.test(url),
    handle: async () =>
      mockResponse({ message: "Operation completed (guest mode)." }),
  },
];

// ── read-merge rules (GET) ───────────────────────────────────────────

const readMergeRules: ReadMergeRule[] = [
  {
    match: (url) => /\/incharge\/equipment\/api\/?(\?.*)?$/.test(url),
    collection: "equipments",
  },
  {
    // Only the "list all" endpoint, not single-issuance ?id= queries
    match: (url) =>
      /\/api\/issuances\/?$/.test(url) || /\/api\/issuances\?(?!.*id=)/.test(url),
    collection: "issuances",
  },
  {
    match: (url) => /\/api\/departments\/?(\?.*)?$/.test(url),
    collection: "departments",
  },
  {
    match: (url) => /\/instructor\/departments\/api\/?(\?.*)?$/.test(url),
    collection: "departments",
  },
];

// ── guest profile handler (intercepts profile GETs) ──────────────────

function isProfileGet(url: string, method: string): boolean {
  return (
    method === "GET" &&
    /\/(incharge|instructor)\/profile\/api\/?(\?.*)?$/.test(url)
  );
}

function guestProfileResponse(): Response {
  const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = raw ? JSON.parse(raw) : {};
  return mockResponse({
    _id: "guest_user",
    name: "Guest User",
    email: user.email || "guest@lims.demo",
    role: user.role || "incharge",
    designation: user.designation || "Guest",
    department: "Guest Department",
    joinDate: new Date().toISOString(),
    avatarUrl: null,
    notificationSettings: {
      emailNotifications: false,
      pushNotifications: false,
    },
  });
}

// ── install / uninstall ──────────────────────────────────────────────

let originalFetch: typeof window.fetch | null = null;

export function installGuestFetchInterceptor() {
  if (typeof window === "undefined") return;
  if (originalFetch) return; // already patched

  originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    // If not in guest mode, pass through transparently
    if (!guestStore.isGuestMode()) {
      return originalFetch!(input, init);
    }

    const url = extractUrl(input);
    const method = extractMethod(input, init);

    // 1. Write operations → guest store
    for (const handler of writeHandlers) {
      if (handler.match(url, method)) {
        return handler.handle(url, method, init);
      }
    }

    // 2. Profile GET → mock profile
    if (isProfileGet(url, method)) {
      return guestProfileResponse();
    }

    // 3. Read operations → real fetch + merge
    if (method === "GET") {
      for (const rule of readMergeRules) {
        if (rule.match(url)) {
          const realResponse = await originalFetch!(input, init);
          if (realResponse.ok) {
            try {
              const realData = await realResponse.json();
              if (Array.isArray(realData)) {
                const merged = guestStore.mergeWithReal(
                  rule.collection,
                  realData
                );
                return mockResponse(merged);
              }
              return mockResponse(realData);
            } catch {
              return realResponse;
            }
          }
          return realResponse;
        }
      }
    }

    // 4. Everything else → pass through
    return originalFetch!(input, init);
  };
}

export function uninstallGuestFetchInterceptor() {
  if (typeof window === "undefined") return;
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
}
