import {
  formatNaira,
  sanitizeRedirect,
  sanitizeSearchQuery,
  generateTransactionId,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";

describe("formatNaira", () => {
  it("formats zero", () => {
    expect(formatNaira(0)).toContain("0");
  });
  it("formats positive amounts", () => {
    const result = formatNaira(1500);
    expect(result).toContain("1");
    expect(result).toContain("500");
  });
  it("formats large amounts", () => {
    const result = formatNaira(100000);
    expect(result).toContain("100");
  });
});

describe("sanitizeRedirect", () => {
  it("returns fallback for null/undefined", () => {
    expect(sanitizeRedirect(null)).toBe("/account");
    expect(sanitizeRedirect(undefined)).toBe("/account");
  });
  it("returns fallback for empty string", () => {
    expect(sanitizeRedirect("")).toBe("/account");
  });
  it("allows relative paths starting with /", () => {
    expect(sanitizeRedirect("/account/orders")).toBe("/account/orders");
  });
  it("rejects protocol-relative URLs", () => {
    expect(sanitizeRedirect("//evil.com")).toBe("/account");
  });
  it("rejects paths not starting with /", () => {
    expect(sanitizeRedirect("account/orders")).toBe("/account");
  });
  it("uses custom fallback", () => {
    expect(sanitizeRedirect(null, "/")).toBe("/");
  });
});

describe("sanitizeSearchQuery", () => {
  it("strips special characters", () => {
    expect(sanitizeSearchQuery("hello<script>")).toBe("helloscript");
  });
  it("preserves normal text", () => {
    expect(sanitizeSearchQuery("turmeric powder")).toBe("turmeric powder");
  });
  it("preserves numbers and hyphens", () => {
    expect(sanitizeSearchQuery("spice-123")).toBe("spice-123");
  });
  it("trims whitespace", () => {
    expect(sanitizeSearchQuery("  hello  ")).toBe("hello");
  });
});

describe("generateTransactionId", () => {
  it("starts with KMA prefix", () => {
    const id = generateTransactionId();
    expect(id.startsWith("KMA")).toBe(true);
  });
  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateTransactionId()));
    expect(ids.size).toBe(1000);
  });
  it("has sufficient length", () => {
    const id = generateTransactionId();
    expect(id.length).toBeGreaterThanOrEqual(20);
  });
});

describe("getStatusColor", () => {
  it("returns correct colors", () => {
    expect(getStatusColor("pending")).toBe("#f59e0b");
    expect(getStatusColor("confirmed")).toBe("#3b82f6");
    expect(getStatusColor("delivered")).toBe("#10b981");
    expect(getStatusColor("cancelled")).toBe("#ef4444");
  });
  it("returns grey for unknown status", () => {
    expect(getStatusColor("unknown")).toBe("#6b7280");
  });
});

describe("getStatusLabel", () => {
  it("capitalizes status labels", () => {
    expect(getStatusLabel("pending")).toBe("Pending");
    expect(getStatusLabel("confirmed")).toBe("Confirmed");
    expect(getStatusLabel("delivered")).toBe("Delivered");
    expect(getStatusLabel("cancelled")).toBe("Cancelled");
  });
  it("returns raw string for unknown", () => {
    expect(getStatusLabel("unknown")).toBe("unknown");
  });
});
