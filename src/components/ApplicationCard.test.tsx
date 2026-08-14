import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { makeApplication } from "@/test/factories";
import { ApplicationCard } from "./ApplicationCard";

/** The offline card renders a tooltip, which Radix requires a provider for. */
const renderCard = (ui: ReactElement) => render(<TooltipProvider>{ui}</TooltipProvider>);

describe("ApplicationCard", () => {
  it("shows what the application is", () => {
    const app = makeApplication({
      name: "HRIS",
      description: "Employee data and leave requests.",
      category: "Human Resource",
      status: "maintenance",
    });

    renderCard(<ApplicationCard app={app} onOpen={vi.fn()} onToggleFavorite={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "HRIS" })).toBeTruthy();
    expect(screen.getByText("Employee data and leave requests.")).toBeTruthy();
    expect(screen.getByText("Human Resource")).toBeTruthy();
    expect(screen.getByText("Maintenance")).toBeTruthy();
  });

  it("hands the whole application to the open handler", () => {
    const app = makeApplication();
    const onOpen = vi.fn();

    renderCard(<ApplicationCard app={app} onOpen={onOpen} onToggleFavorite={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /open/i }));

    expect(onOpen).toHaveBeenCalledWith(app);
  });

  it("names the pin action after what the click will do", () => {
    const onToggleFavorite = vi.fn();
    const app = makeApplication({ id: "hris", name: "HRIS", favorite: false });

    const { rerender } = renderCard(
      <ApplicationCard app={app} onOpen={vi.fn()} onToggleFavorite={onToggleFavorite} />,
    );

    const pin = screen.getByRole("button", { name: "Pin HRIS" });
    expect(pin.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(pin);
    expect(onToggleFavorite).toHaveBeenCalledWith("hris");

    rerender(
      <TooltipProvider>
        <ApplicationCard
          app={{ ...app, favorite: true }}
          onOpen={vi.fn()}
          onToggleFavorite={onToggleFavorite}
        />
      </TooltipProvider>,
    );

    expect(screen.getByRole("button", { name: "Unpin HRIS" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("reports when the application was last opened", () => {
    renderCard(
      <ApplicationCard app={makeApplication()} onOpen={vi.fn()} onToggleFavorite={vi.fn()} />,
    );
    expect(screen.getByText("Never opened")).toBeTruthy();

    const opened = new Date(Date.now() - 5 * 60_000).toISOString();
    render(
      <TooltipProvider>
        <ApplicationCard
          app={makeApplication({ id: "other", lastOpened: opened })}
          onOpen={vi.fn()}
          onToggleFavorite={vi.fn()}
        />
      </TooltipProvider>,
    );
    expect(screen.getByText("5m ago")).toBeTruthy();
  });

  describe("when the application is offline", () => {
    const offline = makeApplication({ name: "CMMS", status: "offline" });

    it("refuses to launch it", () => {
      const onOpen = vi.fn();

      renderCard(<ApplicationCard app={offline} onOpen={onOpen} onToggleFavorite={vi.fn()} />);
      fireEvent.click(screen.getByRole("button", { name: /open/i }));

      expect(onOpen).not.toHaveBeenCalled();
    });

    /**
     * `aria-disabled`, not `disabled`: a disabled button is not focusable, which
     * would put the tooltip explaining the refusal out of reach of keyboard and
     * screen-reader users.
     */
    it("keeps the open button focusable so the reason stays reachable", () => {
      renderCard(<ApplicationCard app={offline} onOpen={vi.fn()} onToggleFavorite={vi.fn()} />);
      const open = screen.getByRole("button", { name: /open/i });

      expect(open.getAttribute("aria-disabled")).toBe("true");
      expect(open.hasAttribute("disabled")).toBe(false);
    });

    it("still allows pinning", () => {
      const onToggleFavorite = vi.fn();

      renderCard(
        <ApplicationCard app={offline} onOpen={vi.fn()} onToggleFavorite={onToggleFavorite} />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Pin CMMS" }));

      expect(onToggleFavorite).toHaveBeenCalledWith(offline.id);
    });
  });
});
