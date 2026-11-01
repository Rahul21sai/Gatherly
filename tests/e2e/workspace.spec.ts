import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { parseWorkspace } from "../../src/lib/storage";
import { readFile, writeFile } from "node:fs/promises";

async function openWorkspace(page: Page, url = "/") {
  await page.goto(url);
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
}

test("downloads complete plans, briefs and calendars without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await openWorkspace(page);
  await page.getByRole("button", { name: "Take your plan with you" }).click();
  for (const [name, filename] of [
    ["Complete plan", "gatherly-plan.json"],
    ["Readable event brief", "gatherly-event-brief.md"],
    ["Calendar reminders", "gatherly-timeline.ics"],
  ]) {
    const pending = page.waitForEvent("download");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: new RegExp(`^${name}`) })
      .click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(filename);
    const content = await readFile((await download.path())!, "utf8");
    if (filename.endsWith("json"))
      expect(JSON.parse(content).input.eventType).toBe("wedding");
    if (filename.endsWith("md")) expect(content).toContain("## Budget");
    if (filename.endsWith("ics"))
      expect(content).toContain("BEGIN:VCALENDAR\r\n");
  }
  await page.getByRole("button", { name: "Close dialog" }).click();
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.flatMap((image) =>
          image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0
            ? [image.src]
            : [],
        ),
      ),
  ).toEqual([]);
  await page.screenshot({ path: "artifacts/production.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("creates an event, tracks a task and spending, and restores the workspace", async ({
  page,
}) => {
  await openWorkspace(page);
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await page.getByLabel("Event name").fill("Aarav’s birthday");
  await page.getByRole("button", { name: "Birthday", exact: true }).click();
  await page.getByLabel("City").fill("Bengaluru");
  await page.getByLabel("Event date").fill("2027-01-15");
  await page.getByLabel("Guest count").fill("30");
  await page.getByLabel("Total budget").fill("60000");
  await page.getByRole("button", { name: "Create my plan" }).click();
  await expect(
    page.getByRole("heading", { name: "Aarav’s birthday", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Budget", exact: true }).click();
  const spend = page.getByLabel(/Actual spend for/).first();
  await spend.fill("1200");
  await spend.blur();
  await expect(spend).toHaveValue("1200");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("gatherly-workspace-v1") || "[]")[0]
            ?.budget[0]?.spent,
      ),
    )
    .toBe(1200);
  const saved = await page.evaluate(() =>
    localStorage.getItem("gatherly-workspace-v1"),
  );
  await writeFile("artifacts/saved-workspace.json", saved || "[]");
  expect(parseWorkspace(saved)[0]?.input.title).toBe("Aarav’s birthday");
  await expect(page.getByText("Saved on this device").first()).toBeVisible();
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Aarav’s birthday", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Budget", exact: true }).click();
  await expect(page.getByLabel(/Actual spend for/).first()).toHaveValue("1200");
  await page.getByRole("button", { name: "Vendors", exact: true }).click();
  await page
    .getByLabel(/Status for/)
    .first()
    .selectOption("Booked");
  await expect(page.getByLabel(/Status for/).first()).toHaveValue("Booked");
  await page.getByRole("button", { name: "Inspiration", exact: true }).click();
  await page
    .getByRole("button", { name: /Save idea:/ })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: /Unsave idea:/ }).first(),
  ).toBeVisible();
});

test("assistant proposes a budget change and applies it only after confirmation", async ({
  page,
}) => {
  await openWorkspace(page);
  await page
    .getByLabel("Message your planning assistant")
    .fill("Reduce my budget by 15%");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByTestId("assistant-reply").last()).toBeVisible();
  const suggestion = page.getByTestId("assistant-suggestion").first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(
    page.getByRole("heading", { name: "Update your plan?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Update plan", exact: true }).click();
  await expect(page.getByText("Plan updated", { exact: true })).toBeVisible();
});

test("desktop and mobile are accessible and fit the viewport", async ({
  page,
  browser,
}) => {
  await openWorkspace(page);
  await expect(
    page.getByRole("heading", { name: "Let’s make it memorable." }),
  ).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
  expect(results.violations).toEqual([]);
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await openWorkspace(mobilePage, "http://127.0.0.1:3000");
  expect(
    await mobilePage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await mobilePage.getByRole("button", { name: "Open navigation" }).tap();
  await mobilePage.getByRole("button", { name: "Budget", exact: true }).tap();
  await expect(
    mobilePage.getByRole("heading", { name: "Every rupee, accounted for." }),
  ).toBeVisible();
  await mobilePage.screenshot({ path: "artifacts/mobile.png", fullPage: true });
  await mobileContext.close();
});

test("Escape keeps a busy plan dialog open and exposes a request failure", async ({
  page,
}) => {
  await page.route("**/api/plan", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Please try again." }),
    });
  });
  await openWorkspace(page);
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await page.getByLabel("Event name").fill("An evening together");
  await page.getByRole("button", { name: "Create my plan" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Please try again.",
  );
});

test("each planning view and the event form meet accessibility checks", async ({
  page,
}) => {
  await openWorkspace(page);
  const issues: { view: string; id: string; targets: string[] }[] = [];
  for (const name of ["Budget", "Timeline", "Vendors", "Inspiration"]) {
    await page.getByRole("button", { name, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    issues.push(
      ...result.violations.map((v) => ({
        view: name,
        id: v.id,
        targets: v.nodes.map((n) => JSON.stringify(n.target)),
      })),
    );
  }
  await page.getByRole("button", { name: "New event", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  issues.push(
    ...result.violations.map((v) => ({
      view: "Event form",
      id: v.id,
      targets: v.nodes.map((n) => JSON.stringify(n.target)),
    })),
  );
  expect(issues).toEqual([]);
});
