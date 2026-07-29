import { describe, expect, it } from "vitest";

import { config } from "../../../middleware";

describe("root middleware config", () => {
  it("only matches protected module routes", () => {
    expect(config.matcher).toEqual(["/cssd/:path*", "/laundry/:path*"]);
  });
});
