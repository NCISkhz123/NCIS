// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LogoutButton } from "@/components/layout/logout-button";

describe("LogoutButton", () => {
  it("renders a submit button for the provided server action", () => {
    render(<LogoutButton logoutAction={async () => {}} />);

    expect(screen.getByRole("button", { name: /logout/i })).toHaveAttribute(
      "type",
      "submit"
    );
  });
});
