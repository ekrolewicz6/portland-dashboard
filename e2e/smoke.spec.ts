import { test, expect } from "@playwright/test";

test("home page renders with hero and project cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "explained."
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

// ── Coverage across every topic ───────────────────────────────────────────
//
// The suite used to assert static text on one topic page. That text comes from
// src/lib/questions.ts, so it rendered identically whether the data layer
// worked or was returning 500s on every request. These run against the CI
// database seeded by ingest/ci-seed.ts and check the things that actually
// break: a route throwing, a payload losing its shape, a page failing to
// render its own heading.

const QUESTION_SLUGS = [
  "housing",
  "homelessness",
  "safety",
  "transportation",
  "education",
  "fiscal",
  "economy",
  "economic-health",
  "quality",
  "accountability",
  "climate",
] as const;

for (const slug of QUESTION_SLUGS) {
  test(`GET /api/dashboard/${slug} answers with a valid envelope`, async ({
    request,
  }) => {
    const response = await request.get(`/api/dashboard/${slug}`);
    expect(
      response.status(),
      `/api/dashboard/${slug} should not error`,
    ).toBe(200);

    const body = await response.json();
    expect(typeof body).toBe("object");
    expect(body).not.toBeNull();

    // Every topic route reports its own state. "error" means the handler
    // caught an exception it could not work around, which is a failure even
    // though the HTTP status is 200.
    if (typeof body.dataStatus === "string") {
      expect(
        body.dataStatus,
        `/api/dashboard/${slug} reported dataStatus "error"`,
      ).not.toBe("error");
    }

    // A payload claiming data must carry the fields the dashboard reads.
    const claimsData =
      body.dataStatus !== "unavailable" && body.dataAvailable !== false;
    if (claimsData) {
      expect(body).toHaveProperty("source");
      expect(Array.isArray(body.chartData)).toBe(true);
    }
  });

  test(`/dashboard/${slug} renders`, async ({ page }) => {
    const response = await page.goto(`/dashboard/${slug}`);
    expect(response?.status(), `/dashboard/${slug} should render`).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}

test("dashboard topics with seeded data report it as available", async ({
  request,
}) => {
  // housing and safety are the two topics ingest/ci-seed.ts puts rows behind,
  // so if the query layer is broken these are where it shows.
  for (const slug of ["housing", "safety"]) {
    const body = await (await request.get(`/api/dashboard/${slug}`)).json();
    expect(
      body.dataStatus,
      `${slug} has seeded rows but reported "${body.dataStatus}"`,
    ).not.toBe("unavailable");
  }
});

test("cron routes reject unauthenticated callers", async ({ request }) => {
  // These mutate data and call third-party APIs. CRON_SECRET is set in CI, so
  // a missing Authorization header must be refused rather than waved through.
  for (const path of ["sync-permits", "sync-crime", "verify-promises"]) {
    const response = await request.get(`/api/cron/${path}`);
    expect(response.status(), `/api/cron/${path} should require auth`).toBe(401);
  }
});

test("unpublished progress reports are not readable anonymously", async ({
  request,
}) => {
  const response = await request.get("/api/progress-report?drafts=true");
  expect(response.status()).toBe(200);
  const body = await response.json();
  const reports = Array.isArray(body.reports) ? body.reports : [];
  for (const report of reports) {
    expect(
      report.published,
      `anonymous caller received unpublished report "${report.slug}"`,
    ).toBe(true);
  }
});

test("the public API surface does not serve fabricated data", async ({
  request,
}) => {
  // Both routes served Math.random() series from a fixture module as open
  // data. They are gone; nothing should answer on those paths again.
  for (const path of ["/api/public/metrics", "/api/export/housing"]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should no longer exist`).toBe(404);
  }
});
