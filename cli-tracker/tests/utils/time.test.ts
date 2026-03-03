import { describe, it, expect } from "vitest";
import { formatDuration } from "../../src/utils/time.js";

describe("formatDuration", () => {
  it("should format seconds only", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("should format minutes and seconds", () => {
    expect(formatDuration(125)).toBe("2m 05s");
  });

  it("should format hours and minutes", () => {
    expect(formatDuration(3661)).toBe("1h 01m");
  });

  it("should format zero", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  it("should format exact hours", () => {
    expect(formatDuration(7200)).toBe("2h 00m");
  });

  it("should format large values", () => {
    expect(formatDuration(36000)).toBe("10h 00m");
  });
});
