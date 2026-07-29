import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

beforeAll(async () => {
  if (typeof window !== "undefined") {
    await import("@testing-library/jest-dom/vitest");
  }
});

afterEach(() => {
  if (typeof window !== "undefined") {
    cleanup();
  }
});
