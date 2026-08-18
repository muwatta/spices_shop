/**
 * API Security Tests
 *
 * Tests that sensitive endpoints properly enforce authentication and authorization.
 * Uses mocked Supabase client to avoid database dependencies.
 */

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
  createAdminClient: jest.fn(),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
  getRateLimitIdentifier: jest.fn().mockReturnValue("127.0.0.1"),
  rateLimitResponse: jest.fn().mockReturnValue(null),
}));

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockCreateAdminClient = createAdminClient as jest.MockedFunction<typeof createAdminClient>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>;
const mockRateLimitResponse = rateLimitResponse as jest.MockedFunction<typeof rateLimitResponse>;

const originalEnv = process.env;

beforeAll(() => {
  process.env = { ...originalEnv, RESEND_API_KEY: "test-key" };
});

afterAll(() => {
  process.env = originalEnv;
});

function makeRequest(url: string, body?: Record<string, unknown>, method = "POST") {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function mockFullClient(opts: {
  user?: { id: string; email: string } | null;
  authError?: boolean;
  orderQuery?: { data: any; error: any };
}) {
  const client: any = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: opts.user ?? null },
        error: opts.authError ? { message: "Not authenticated" } : null,
      }),
    },
  };
  if (opts.orderQuery !== undefined) {
    client.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(opts.orderQuery),
    });
  }
  mockCreateClient.mockReturnValue(client);
}

describe("/api/send-order-email", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects unauthenticated requests", async () => {
    mockFullClient({ authError: true });
    const { POST } = await import("@/app/api/send-order-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-order-email", { orderId: "abc", status: "pending" }));
    expect(res.status).toBe(401);
  });

  it("rejects requests without orderId", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/send-order-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-order-email", { status: "pending" }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid status", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/send-order-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-order-email", { orderId: "abc", status: "invalid" }));
    expect(res.status).toBe(400);
  });

  it("rejects when order not found", async () => {
    mockFullClient({
      user: { id: "user-1", email: "test@test.com" },
      orderQuery: { data: null, error: { message: "not found" } },
    });
    const { POST } = await import("@/app/api/send-order-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-order-email", { orderId: "nonexistent", status: "pending" }));
    expect(res.status).toBe(404);
  });

  it("rejects when user does not own the order", async () => {
    mockFullClient({
      user: { id: "user-1", email: "test@test.com" },
      orderQuery: {
        data: { id: "order-1", customer_id: "user-other", status: "pending", customers: null },
        error: null,
      },
    });
    const { POST } = await import("@/app/api/send-order-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-order-email", { orderId: "order-1", status: "pending" }));
    expect(res.status).toBe(403);
  });

  it("applies rate limiting", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 60 });
    mockRateLimitResponse.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 }) as any,
    );
    const { POST } = await import("@/app/api/send-order-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-order-email", { orderId: "abc", status: "pending" }));
    expect(res.status).toBe(429);
  });
});

describe("/api/send-password-change-email", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects unauthenticated requests", async () => {
    mockFullClient({ authError: true });
    const { POST } = await import("@/app/api/send-password-change-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-password-change-email", {}));
    expect(res.status).toBe(401);
  });

  it("applies rate limiting", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 300 });
    mockRateLimitResponse.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 }) as any,
    );
    const { POST } = await import("@/app/api/send-password-change-email/route");
    const res = await POST(makeRequest("http://localhost/api/send-password-change-email", {}));
    expect(res.status).toBe(429);
  });
});

describe("/api/admin/check", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects unauthenticated requests", async () => {
    mockFullClient({ authError: true });
    const { POST } = await import("@/app/api/admin/check/route");
    const res = await POST(makeRequest("http://localhost/api/admin/check", { email: "admin@test.com" }));
    expect(res.status).toBe(401);
  });

  it("prevents checking other users' admin status", async () => {
    mockFullClient({ user: { id: "user-1", email: "user@test.com" } });
    const { POST } = await import("@/app/api/admin/check/route");
    const res = await POST(makeRequest("http://localhost/api/admin/check", { email: "admin@test.com" }));
    expect(res.status).toBe(403);
  });

  it("allows checking own admin status", async () => {
    mockFullClient({ user: { id: "user-1", email: "admin@test.com" } });
    mockCreateAdminClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { email: "admin@test.com" }, error: null }),
      }),
    } as any);
    const { POST } = await import("@/app/api/admin/check/route");
    const res = await POST(makeRequest("http://localhost/api/admin/check", { email: "admin@test.com" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.isAdmin).toBe(true);
  });
});

describe("/api/auth/signup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("applies rate limiting", async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 600 });
    mockRateLimitResponse.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 }) as any,
    );
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(makeRequest("http://localhost/api/auth/signup", {
      email: "test@test.com",
      password: "password123",
      full_name: "Test User",
    }));
    expect(res.status).toBe(429);
  });
});

describe("/api/auth/reset-password", () => {
  beforeEach(() => jest.clearAllMocks());

  it("applies rate limiting", async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 300 });
    mockRateLimitResponse.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 }) as any,
    );
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(makeRequest("http://localhost/api/auth/reset-password", { email: "test@test.com" }));
    expect(res.status).toBe(429);
  });

  it("rejects invalid email", async () => {
    const { POST } = await import("@/app/api/auth/reset-password/route");
    const res = await POST(makeRequest("http://localhost/api/auth/reset-password", { email: "" }));
    expect(res.status).toBe(400);
  });
});

describe("/api/checkout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("applies rate limiting", async () => {
    mockCheckRateLimit.mockResolvedValueOnce({ allowed: false, retryAfter: 600 });
    mockRateLimitResponse.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 }) as any,
    );
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {}));
    expect(res.status).toBe(429);
  });

  it("rejects unauthenticated requests", async () => {
    mockFullClient({ authError: true });
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {
      full_name: "Test",
      phone: "123",
      address_line1: "Addr",
      city: "City",
      state: "State",
      payment_method: "cash_on_delivery",
      items: [{ product_id: "abc", quantity: 1 }],
    }));
    expect(res.status).toBe(401);
  });

  it("rejects missing delivery details", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {
      full_name: "",
      phone: "",
      address_line1: "",
      city: "",
      state: "",
      payment_method: "cash_on_delivery",
      items: [{ product_id: "abc", quantity: 1 }],
    }));
    expect(res.status).toBe(400);
  });

  it("rejects empty items", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {
      full_name: "Test",
      phone: "123",
      address_line1: "Addr",
      city: "City",
      state: "State",
      payment_method: "cash_on_delivery",
      items: [],
    }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid payment method", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {
      full_name: "Test",
      phone: "123",
      address_line1: "Addr",
      city: "City",
      state: "State",
      payment_method: "bitcoin",
      items: [{ product_id: "abc", quantity: 1 }],
    }));
    expect(res.status).toBe(400);
  });

  it("rejects bank transfer without payment proof", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {
      full_name: "Test",
      phone: "123",
      address_line1: "Addr",
      city: "City",
      state: "State",
      payment_method: "bank_transfer",
      payment_proof_url: "",
      items: [{ product_id: "abc", quantity: 1 }],
    }));
    expect(res.status).toBe(400);
  });

  it("rejects invalid quantities", async () => {
    mockFullClient({ user: { id: "user-1", email: "test@test.com" } });
    const { POST } = await import("@/app/api/checkout/route");
    const res = await POST(makeRequest("http://localhost/api/checkout", {
      full_name: "Test",
      phone: "123",
      address_line1: "Addr",
      city: "City",
      state: "State",
      payment_method: "cash_on_delivery",
      items: [
        { product_id: "abc", quantity: "not-a-number" },
        { product_id: "def", quantity: -1 },
      ],
    }));
    expect(res.status).toBe(400);
  });
});
