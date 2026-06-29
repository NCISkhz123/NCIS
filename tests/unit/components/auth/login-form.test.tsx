// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "../../../../src/components/auth/login-form";

describe("LoginForm", () => {
  it("renders email, password, and submit controls", () => {
    render(<LoginForm action={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /masuk ke cssd/i })
    ).toBeInTheDocument();
  });
});
