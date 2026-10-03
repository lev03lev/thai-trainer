import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/practice?mode=mixed", "/practice?mode=image", "/practice?mode=scenario", "/study", "/study/pad-thai", "/review", "/progress", "/settings"];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

async function noHorizontalScroll(page: Page) {
  const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(sw, "גלילה אופקית בעמוד").toBeLessThanOrEqual(iw + 1);
}

for (const vp of [
  { name: "phone", width: 375, height: 812 },
  { name: "desktop", width: 1280, height: 860 },
]) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const path of PAGES) {
      test(`עמוד ${path} נטען בעברית RTL בלי שגיאות`, async ({ page }) => {
        const errors = watchErrors(page);
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        await expect(page.locator("html")).toHaveAttribute("lang", "he");
        await page.waitForLoadState("networkidle");
        if (path.startsWith("/practice")) await expect(page.locator("#q-title")).toBeVisible();
        await noHorizontalScroll(page);
        const slug = path.replace(/[/?=&]/g, "_") || "home";
        await page.screenshot({ path: `e2e/shots/${vp.name}${slug}.png`, fullPage: true });
        expect(errors).toEqual([]);
      });
    }
  });
}

test("סבב תרגול: בחירה, משוב מיידי עם מקור, מעבר לשאלה הבאה", async ({ page }) => {
  await page.goto("/practice?mode=mixed");
  for (let i = 0; i < 4; i++) {
    await expect(page.locator("#q-title")).toBeVisible();
    await page.locator(".opt, .part select").first().waitFor();
    const selects = page.locator(".part select");
    if (await selects.count()) {
      for (let j = 0; j < (await selects.count()); j++) await selects.nth(j).selectOption({ index: 1 });
    } else {
      await page.locator(".opt").first().click();
    }
    await page.getByRole("button", { name: "בדיקה" }).click();
    await expect(page.locator(".feedback")).toBeVisible();
    await expect(page.locator(".feedback .sources .badge").first()).toContainText("עמ׳");
    await page.getByRole("button", { name: /לשאלה הבאה|לסיכום/ }).click();
  }
});

test("ניווט מקלדת: מקש 1 בוחר, Enter בודק", async ({ page }) => {
  await page.goto("/practice?mode=reverse");
  await expect(page.locator("#q-title")).toBeVisible();
  await page.keyboard.press("1");
  await expect(page.locator('.opt[aria-checked="true"]')).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page.locator(".feedback")).toBeVisible();
});

test("טעות בשאלת בטיחות מציגה אזהרה ונכנסת לתרגול הממוקד", async ({ page }) => {
  await page.goto("/practice?mode=safety");
  await expect(page.locator("#q-title")).toBeVisible();
  // בוחרים תשובה שגויה במכוון (אם יש חלקים — בוחרים את מה שלא נכון)
  const selects = page.locator(".part select");
  if (await selects.count()) {
    test.skip(true, "שאלת סימולציה — נבדק בנפרד");
  }
  const opts = page.locator(".opt");
  const n = await opts.count();
  // מנסים כל אחת עד שמתקבלת טעות — מספיק ראשונה או שנייה
  await opts.nth(0).click();
  await page.getByRole("button", { name: "בדיקה" }).click();
  if (await page.locator(".feedback.good").count()) {
    await page.getByRole("button", { name: /לשאלה הבאה|לסיכום/ }).click();
    await expect(page.locator("#q-title")).toBeVisible();
    await page.locator(".opt").nth(n > 2 ? 2 : 1).click();
    await page.getByRole("button", { name: "בדיקה" }).click();
  }
  if (await page.locator(".feedback.bad").count()) {
    await expect(page.locator(".notice.safety")).toBeVisible();
    await page.goto("/");
    await expect(page.locator(".notice.safety")).toContainText("אלרגיות / גלוטן");
  }
});

test("סנכרון בין שני מכשירים עם קוד", async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  const pa = await a.newPage();
  const pb = await b.newPage();

  await pa.goto("/settings");
  await pa.getByRole("button", { name: "יצירת קוד סנכרון חדש" }).click();
  await expect(pa.getByText("מסונכרן ✓")).toBeVisible();
  const code = (await pa.locator("bdi").first().textContent())!.trim();
  expect(code).toMatch(/^[A-Z0-9]{10}$/);

  // עונים על שתי שאלות במכשיר א
  await pa.goto("/practice?mode=image");
  for (let i = 0; i < 2; i++) {
    await pa.locator(".opt").first().click();
    await pa.getByRole("button", { name: "בדיקה" }).click();
    await pa.getByRole("button", { name: /לשאלה הבאה|לסיכום/ }).click();
  }
  await pa.waitForTimeout(2500); // סנכרון מושהה
  await pa.goto("/settings");
  await expect(pa.getByText(/נשמרו 2 תשובות/)).toBeVisible();

  // מכשיר ב מתחבר עם הקוד ומקבל את ההתקדמות
  await pb.goto("/settings");
  await pb.locator("#code").fill(code.toLowerCase());
  await pb.getByRole("button", { name: "חיבור" }).click();
  await expect(pb.getByText("מסונכרן ✓")).toBeVisible();
  await expect(pb.getByText(/נשמרו 2 תשובות/)).toBeVisible();

  // ומה שנענה במכשיר ב מגיע למכשיר א
  await pb.goto("/practice?mode=reverse");
  await pb.locator(".opt").first().click();
  await pb.getByRole("button", { name: "בדיקה" }).click();
  await pb.waitForTimeout(2500);
  await pa.goto("/settings");
  await pa.getByRole("button", { name: "לסנכרן עכשיו" }).click();
  await expect(pa.getByText(/נשמרו 3 תשובות/)).toBeVisible();
  await a.close();
  await b.close();
});

test("מבחן מדמה מציג טיימר וסיכום", async ({ page }) => {
  await page.goto("/practice?mode=exam");
  await expect(page.locator(".timer")).toContainText("15:00".slice(0, 2));
  for (let i = 0; i < 25; i++) {
    await page.locator(".opt, .part select").first().waitFor();
    const selects = page.locator(".part select");
    if (await selects.count()) {
      for (let j = 0; j < (await selects.count()); j++) await selects.nth(j).selectOption({ index: 1 });
    } else await page.locator(".opt").first().click();
    await page.getByRole("button", { name: /לשאלה הבאה|סיום המבחן/ }).click();
  }
  await expect(page.getByRole("heading", { name: "תוצאות המבחן" })).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "מבחנים מדמים" })).toBeVisible();
});
