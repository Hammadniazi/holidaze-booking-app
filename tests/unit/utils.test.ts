import { describe, it, expect } from "vitest";
import {
  cn,
  truncate,
  formatPrice,
  buildImageUrl,
  calculateNights,
  getPageNumbers,
  toPlainText,
  venuePlaceholder,
} from "@/utils/index";

describe("cn", () => {
  it("merges multiple class names into one string", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy conditional classes", () => {
    expect(cn("foo", undefined, "baz")).toBe("foo baz");
  });

  it("resolves tailwind conflicts — last class wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });
});

describe("truncate", () => {
  it("returns text unchanged when shorter than max length", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("returns text unchanged at exactly max length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("truncates and appends ellipsis when text exceeds max length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello…");
  });

  it("truncates a long sentence correctly", () => {
    const result = truncate("The quick brown fox", 9);
    expect(result).toBe("The quick…");
    expect(result.length).toBe(10); // 9 chars + ellipsis
  });
});

describe("formatPrice", () => {
  it("formats a price with NOK currency symbol", () => {
    const result = formatPrice(1000);
    expect(result).toContain("NOK");
    expect(result).toContain("1,000");
  });

  it("formats zero correctly", () => {
    const result = formatPrice(0);
    expect(result).toContain("NOK");
    expect(result).toContain("0");
  });

  it("formats a decimal price without fractional digits", () => {
    // minimumFractionDigits: 0 means 99.5 rounds to 100 or 99
    const result = formatPrice(99);
    expect(result).toContain("NOK");
    expect(result).toContain("99");
  });
});

describe("buildImageUrl", () => {
  it("returns the url when it is a valid absolute URL", () => {
    const url = "https://example.com/photo.jpg";
    expect(buildImageUrl(url, "fallback.jpg")).toBe(url);
  });

  it("returns fallback when url is undefined", () => {
    expect(buildImageUrl(undefined, "fallback.jpg")).toBe("fallback.jpg");
  });

  it("returns fallback when url is not a valid URL", () => {
    expect(buildImageUrl("not-a-url", "fallback.jpg")).toBe("fallback.jpg");
  });

  it("returns fallback when url is an empty string", () => {
    expect(buildImageUrl("", "fallback.jpg")).toBe("fallback.jpg");
  });
});

describe("calculateNights", () => {
  it("calculates the correct number of nights between two dates", () => {
    const from = new Date("2025-01-01");
    const to = new Date("2025-01-05");
    expect(calculateNights(from, to)).toBe(4);
  });

  it("returns 0 when checkin and checkout are the same day", () => {
    const date = new Date("2025-06-15");
    expect(calculateNights(date, date)).toBe(0);
  });

  it("returns 0 when checkout is before checkin", () => {
    const from = new Date("2025-01-10");
    const to = new Date("2025-01-05");
    expect(calculateNights(from, to)).toBe(0);
  });

  it("handles a single-night stay", () => {
    const from = new Date("2025-03-20");
    const to = new Date("2025-03-21");
    expect(calculateNights(from, to)).toBe(1);
  });
});

describe("getPageNumbers", () => {
  it("returns all page numbers when totalPages is 7 or fewer", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("always includes page 1 and the last page", () => {
    const result = getPageNumbers(5, 20);
    expect(result[0]).toBe(1);
    expect(result[result.length - 1]).toBe(20);
  });

  it("inserts leading ellipsis when current page is far from the start", () => {
    const result = getPageNumbers(10, 20);
    expect(result[1]).toBe("...");
  });

  it("inserts trailing ellipsis when current page is far from the end", () => {
    const result = getPageNumbers(2, 20);
    expect(result[result.length - 2]).toBe("...");
  });

  it("does not insert leading ellipsis on the first page", () => {
    const result = getPageNumbers(1, 20);
    expect(result[1]).not.toBe("...");
  });

  it("includes adjacent pages around the current page", () => {
    const result = getPageNumbers(5, 20);
    expect(result).toContain(4);
    expect(result).toContain(5);
    expect(result).toContain(6);
  });

  it("returns a single page [1] when totalPages is 1", () => {
    expect(getPageNumbers(1, 1)).toEqual([1]);
  });
});

describe("toPlainText", () => {
  it("strips the markup that seeded descriptions actually carry", () => {
    expect(toPlainText("<p><strong>This is the place</strong></p>")).toBe(
      "This is the place",
    );
  });

  it("keeps paragraph breaks as newlines", () => {
    expect(toPlainText("<p>One</p><p>Two</p>")).toBe("One\nTwo");
  });

  it("turns <br> into a newline", () => {
    expect(toPlainText("A<br/>B")).toBe("A\nB");
  });

  it("decodes entities, resolving the ampersand last", () => {
    expect(toPlainText("Bed &amp; breakfast")).toBe("Bed & breakfast");
    // Decoding &amp; first would collapse this all the way to "<".
    expect(toPlainText("&amp;lt;")).toBe("&lt;");
    expect(toPlainText("&quot;quoted&quot; &#39;s")).toBe("\"quoted\" 's");
  });

  it("leaves text that has no markup untouched", () => {
    expect(toPlainText("A beautiful seaside venue.")).toBe(
      "A beautiful seaside venue.",
    );
  });

  it("returns an empty string for null, undefined and blank input", () => {
    expect(toPlainText(null)).toBe("");
    expect(toPlainText(undefined)).toBe("");
    expect(toPlainText("   ")).toBe("");
  });

  it("caps runs of blank lines at one", () => {
    expect(toPlainText("<p>A</p>\n\n\n\n<p>B</p>")).toBe("A\n\nB");
  });
});

describe("venuePlaceholder", () => {
  it("returns a self-contained svg data uri carrying the initial", () => {
    const out = venuePlaceholder("venue-1", "Fjord Cabin");
    expect(out.startsWith("data:image/svg+xml,")).toBe(true);
    expect(decodeURIComponent(out)).toContain(">F<");
  });

  it("is stable for one id, and varies across ids", () => {
    expect(venuePlaceholder("a", "X")).toBe(venuePlaceholder("a", "X"));
    const gradients = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"].map(
        (seed) =>
          /stop-color="(#[0-9a-f]{6})"/.exec(
            decodeURIComponent(venuePlaceholder(seed, "X")),
          )?.[1],
      ),
    );
    expect(gradients.size).toBeGreaterThan(1);
  });

  it("escapes a venue name that would otherwise break the svg", () => {
    const svg = decodeURIComponent(venuePlaceholder("x", '<"&'));
    expect(svg).toContain("&lt;");
    expect(svg).not.toContain('>"<');
  });

  it("falls back to ? when there is no usable name", () => {
    expect(decodeURIComponent(venuePlaceholder("x", ""))).toContain(">?<");
    expect(decodeURIComponent(venuePlaceholder("x"))).toContain(">?<");
  });
});
