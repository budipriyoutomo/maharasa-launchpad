import { afterEach, describe, expect, it, vi } from "vitest";

import { makeApplication } from "@/test/factories";
import { launchApplication } from "./launcher";

describe("launchApplication", () => {
  afterEach(() => {
    window.location.hash = "";
  });

  it("opens a new tab with noopener and noreferrer", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const app = makeApplication({ url: "https://hris.example.test", launchType: "new_tab" });

    launchApplication(app);

    expect(open).toHaveBeenCalledWith("https://hris.example.test", "_blank", "noopener,noreferrer");
  });

  /**
   * `noopener` is what stops the target application from reaching back into the
   * portal through `window.opener`, so it is asserted on its own rather than
   * only as part of the call above.
   */
  it("never hands the opener reference to the target application", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    launchApplication(makeApplication());

    const features = open.mock.calls[0]?.[2];
    expect(features).toContain("noopener");
    expect(features).toContain("noreferrer");
  });

  it("defaults to a new tab for any launch type that is not same_tab", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    launchApplication(makeApplication({ launchType: "embedded" }));

    expect(open).toHaveBeenCalledTimes(1);
  });

  /**
   * A same-document URL: jsdom refuses cross-document navigation, but it does
   * apply a hash change, which is enough to prove the same-tab branch navigates
   * instead of opening a window.
   */
  it("navigates the current tab for same_tab applications", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    launchApplication(makeApplication({ url: "#/inventory", launchType: "same_tab" }));

    expect(window.location.hash).toBe("#/inventory");
    expect(open).not.toHaveBeenCalled();
  });
});
