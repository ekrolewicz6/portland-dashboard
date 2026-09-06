import { test, expect } from "@playwright/test";

test("home page renders with hero and project cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "made legible"
  );
  await expect(page.getByText("Portland Parks Atlas")).toBeVisible();
});

test("dashboard hub lists topics", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Portland"
  );
  // Topic cards link into individual dashboards
  await expect(page.locator('a[href*="/dashboard/housing"]').first()).toBeVisible();
});

test("housing topic page renders hero and source citation", async ({ page }) => {
  await page.goto("/dashboard/housing");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Are We Building Enough?"
  );
  await expect(page.getByText("Data Source")).toBeVisible();
});

test("methodology page renders source tables", async ({ page }) => {
  await page.goto("/methodology");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Methodology"
  );
  await expect(page.getByText("Our Principles")).toBeVisible();
});

test("contact page renders the form", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
});

test("proposals page renders the board", async ({ page }) => {
  await page.goto("/proposals");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "What should Portland Civic Lab track next?"
  );
});

test("records page renders the guide", async ({ page }) => {
  await page.goto("/records");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "The records belong to you"
  );
});

test("org chart page renders the tree, cost bar, and comparison", async ({
  page,
}) => {
  await page.goto("/org-chart");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "The Portland org chart"
  );
  await expect(
    page.getByText("Office of the City Administrator").first()
  ).toBeVisible();
  await expect(
    page.getByText("Budgeted salary cost by service area")
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Compare every bureau" })
  ).toBeVisible();
  // comparison table links rows to bureau pages
  await expect(
    page.getByRole("link", { name: /Portland Police Bureau/ }).first()
  ).toBeVisible();
});

test("org chart links bureaus to their own pages", async ({ page }) => {
  await page.goto("/org-chart");
  const link = page
    .getByRole("link", { name: /Portland Police Bureau/ })
    .first();
  await expect(link).toHaveAttribute("href", "/org-chart/ppb");
});

test("bureau page shows salary cost, departments, and classifications", async ({
  page,
}) => {
  await page.goto("/org-chart/ppb");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Portland Police Bureau",
  );
  await expect(page.getByText("Salary cost").first()).toBeVisible();
  await expect(
    page.getByText("Salaries by job classification"),
  ).toBeVisible();
  await expect(page.getByText("Police Officer").first()).toBeVisible();
  await expect(page.getByText("Where the money goes")).toBeVisible();
});

test("org API returns the full structure", async ({ request }) => {
  const response = await request.get("/api/org");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.stats.totalUnits).toBeGreaterThan(50);
  expect(data.tree.children.length).toBe(2);
  // headcount attached: citywide authorized FTE ≈ 7,284
  expect(data.stats.totalFte).toBeGreaterThan(7000);
});

test("unique pages have their own OG metadata + image (no root leak)", async ({
  page,
}) => {
  await page.goto("/deep-dives/fpdr");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /FPDR/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /deep-dives\/fpdr\/opengraph-image/,
  );
  await page.goto("/org-chart/ppb");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Portland Police Bureau/,
  );
});

test("org personnel API exposes classification detail", async ({ request }) => {
  const response = await request.get("/api/org?view=personnel");
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.personnel.ppb.classCount).toBeGreaterThan(10);
  expect(data.personnel.ppb.classifications[0]).toHaveProperty("salaryMin");
});

test("login is a redirect, never a page with a password field", async ({
  request,
}) => {
  const response = await request.get("/login", { maxRedirects: 0 });
  expect([302, 307, 308]).toContain(response.status());
});

test("data flags API validates input", async ({ request }) => {
  const response = await request.post("/api/data-flags", {
    data: { question: "housing", message: "short" },
  });
  expect(response.status()).toBe(400);
});

test("proposals API requires membership to post", async ({ request }) => {
  const response = await request.post("/api/proposals", {
    data: {
      title: "Smoke test proposal",
      description: "This should be rejected because the request is anonymous.",
    },
  });
  expect(response.status()).toBe(401);
});
