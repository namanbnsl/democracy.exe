import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const base = process.env.EXHIBIT_URL || "http://localhost:3000";
try {
  await page.goto(base);
  await page
    .getByRole("button", { name: "Run the experiment", exact: true })
    .click();
  await page.getByRole("button", { name: /CANDIDATE B/ }).click();
  await page.getByText("Your pick: Mira.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Remove Kabir", exact: true }).click();
  await page.getByText("★ Mira wins with 60 votes.", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Bring Kabir back", exact: true })
    .click();
  await page
    .getByText("★ Aarav wins with 40 votes.", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Can rankings fix this?" }).click();
  await page.getByRole("button", { name: "Transfer 25 votes" }).click();
  await page.getByText("★ Mira wins: 60 votes. A majority!").waitFor();
  await page.getByRole("button", { name: "Define a fair system" }).click();
  await page
    .getByRole("button", { name: /04 Keep comparisons independent/ })
    .click();
  await page
    .getByText("This compares two sets of ballots", { exact: false })
    .waitFor();
  await page.getByRole("button", { name: "Put it to the test" }).click();
  for (const pair of ["A vs B", "B vs C", "C vs A"])
    await page.getByRole("button", { name: pair, exact: true }).click();
  assert.match(
    await page.locator(".pair-result").innerText(),
    /Kabir\s+66\s+beats\s+Aarav\s+34/,
  );
  await page.screenshot({ path: "/tmp/democracy-paradox.png", fullPage: true });
  await page.getByRole("button", { name: "Run it again", exact: true }).click();
  await page
    .getByRole("button", { name: "Run the experiment", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await page.getByLabel("Your question").fill("Why does the winner change?");
  // Mock the missing-key response; never consume a configured API key in a UI test.
  await page.route("**/api/explain", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error:
          "AI is not connected yet. You can still explore every experiment and the built-in explanations.",
      }),
    }),
  );
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "AI is not connected yet" })
    .waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.screenshot({ path: "/tmp/democracy-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/democracy-mobile.png", fullPage: true });
  for (const button of [
    "Run the experiment",
    "Can rankings fix this?",
    "Define a fair system",
    "Put it to the test",
  ]) {
    await page.getByRole("button", { name: button, exact: true }).click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Mobile overflow after ${button}`,
    );
  }
  assert.equal(
    (
      await page.request.post(`${base}/api/explain`, {
        data: { question: "", chapter: "welcome" },
      })
    ).status(),
    400,
  );
  assert.equal(
    (
      await page.request.post(`${base}/api/explain`, {
        data: { question: "x".repeat(5000), chapter: "welcome" },
      })
    ).status(),
    413,
  );
  assert.equal(
    (
      await page.request.post(`${base}/api/explain`, {
        data: { question: "Why?", chapter: "welcome" },
        headers: { origin: "https://example.com" },
      })
    ).status(),
    403,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: complete journey, predictions, transfers, fairness, cycle, restart, dialog, AI fallback UI, mobile overflow, API validation, no browser exceptions.",
  );
} finally {
  await browser.close();
}
