import { test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test("צילומי מצבי משוב", async ({ page }) => {
  // שאלה שנענתה בטעות במצב בטיחות
  await page.goto("/practice?mode=safety");
  await page.locator("#q-title").waitFor();
  for (let i = 0; i < 6; i++) {
    if (await page.locator(".part select").count()) {
      const s = page.locator(".part select");
      for (let j = 0; j < (await s.count()); j++) await s.nth(j).selectOption({ index: 1 });
    } else await page.locator(".opt").last().click();
    await page.getByRole("button", { name: "בדיקה" }).click();
    if (await page.locator(".notice.safety").count()) break;
    await page.getByRole("button", { name: /לשאלה הבאה|לסיכום/ }).click();
  }
  await page.screenshot({ path: "e2e/shots/fb_safety.png", fullPage: true });

  // תרחיש בחירה מרובה וסימולציית הזמנה
  for (let tries = 0; tries < 15; tries++) {
    await page.goto("/practice?mode=scenario");
    await page.locator("#q-title").waitFor();
    if (await page.locator(".part select").count()) {
      const s = page.locator(".part select");
      for (let j = 0; j < (await s.count()); j++) await s.nth(j).selectOption({ index: 1 });
      await page.getByRole("button", { name: "בדיקה" }).click();
      await page.screenshot({ path: "e2e/shots/fb_order.png", fullPage: true });
      break;
    }
  }
  for (let tries = 0; tries < 15; tries++) {
    await page.goto("/practice?mode=scenario");
    await page.locator("#q-title").waitFor();
    if ((await page.locator('.opt[role="checkbox"]').count()) > 0) {
      await page.locator(".opt").nth(0).click();
      await page.locator(".opt").nth(2).click();
      await page.getByRole("button", { name: "בדיקה" }).click();
      await page.screenshot({ path: "e2e/shots/fb_multi.png", fullPage: true });
      break;
    }
  }
});
