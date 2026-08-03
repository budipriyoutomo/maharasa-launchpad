import { describe, expect, it } from "vitest";

import { ApplicationService } from "./applicationService";

describe("ApplicationService", () => {
  it("returns the full catalogue with unique ids", async () => {
    const applications = await ApplicationService.getAll();

    expect(applications.length).toBeGreaterThan(0);
    expect(new Set(applications.map((app) => app.id)).size).toBe(applications.length);
  });

  it("looks an application up by id", async () => {
    await expect(ApplicationService.getById("hris")).resolves.toMatchObject({ name: "HRIS" });
    await expect(ApplicationService.getById("does-not-exist")).resolves.toBeUndefined();
  });

  it("matches search terms against name, description and category", async () => {
    const byName = await ApplicationService.query({ search: "helpdesk" });
    expect(byName.map((app) => app.id)).toContain("helpdesk");

    const byDescription = await ApplicationService.query({ search: "payslip" });
    expect(byDescription.map((app) => app.id)).toContain("payroll");

    const byCategory = await ApplicationService.query({ search: "warehouse" });
    expect(byCategory.every((app) => app.category === "Warehouse")).toBe(true);
  });

  it("ignores case and surrounding whitespace in the search term", async () => {
    const padded = await ApplicationService.query({ search: "   HeLpDeSk  " });
    expect(padded.map((app) => app.id)).toContain("helpdesk");
  });

  it("combines category and status filters", async () => {
    const results = await ApplicationService.query({ category: "IT", status: "online" });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((app) => app.category === "IT" && app.status === "online")).toBe(true);
  });

  it("returns everything for an empty query", async () => {
    const all = await ApplicationService.getAll();
    await expect(ApplicationService.query({})).resolves.toHaveLength(all.length);
  });

  it("exposes every category present in the catalogue", async () => {
    const [categories, applications] = await Promise.all([
      ApplicationService.getCategories(),
      ApplicationService.getAll(),
    ]);

    for (const app of applications) {
      expect(categories).toContain(app.category);
    }
  });
});
