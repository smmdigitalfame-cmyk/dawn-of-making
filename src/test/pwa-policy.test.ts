import { describe, expect, it } from "vitest";
import { isAppWorker, mayRegisterAppWorker } from "../lib/pwa-policy";

describe("PWA preview and worker safety", () => {
  it("allows only the published production app outside frames", () => {
    expect(mayRegisterAppWorker(true, "dawn-of-making.lovable.app", false, "")).toBe(true);
    expect(mayRegisterAppWorker(false, "localhost", false, "")).toBe(false);
    expect(mayRegisterAppWorker(true, "dawn-of-making.lovable.app", true, "")).toBe(false);
  });
  it("blocks preview hosts and the sw kill switch", () => {
    for (const host of ["id-preview--abc.lovable.app", "preview--abc.lovable.app", "lovableproject.com", "abc.lovableproject-dev.com", "beta.lovable.dev"]) {
      expect(mayRegisterAppWorker(true, host, false, "")).toBe(false);
    }
    expect(mayRegisterAppWorker(true, "dawn-of-making.lovable.app", false, "?sw=off")).toBe(false);
  });
  it("cleanup targets only this origin's app-shell worker, never push workers", () => {
    expect(isAppWorker("https://dawn-of-making.lovable.app/sw.js", "https://dawn-of-making.lovable.app")).toBe(true);
    expect(isAppWorker("/firebase-messaging-sw.js", "https://dawn-of-making.lovable.app")).toBe(false);
    expect(isAppWorker("https://other.example/sw.js", "https://dawn-of-making.lovable.app")).toBe(false);
  });
});