import { expect, test, type Page } from "@playwright/test";
import { THEMES } from "../src/themes/themes";

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

test("פרופיל: שם ואווטר עם תצוגה מקדימה, שמירה ושרידות אחרי רענון", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/personalize");
  const name = page.locator("#display-name");
  await name.fill("נוגה");
  // התצוגה המקדימה מתעדכנת עוד לפני השמירה
  await expect(page.locator(".pz-hero-name")).toHaveText("נוגה");
  await expect(page.getByText("שינויים שעוד לא נשמרו")).toBeVisible();
  await page.getByRole("tab", { name: /מהמטבח/ }).click();
  await page.getByRole("radio", { name: "צ'ילי" }).click();
  await expect(page.getByRole("radio", { name: "צ'ילי" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "שמירת הפרופיל" }).click();
  await expect(page.getByText("✓ הפרופיל נשמר")).toBeVisible();

  // מופיע בסרגל העליון ובמסך הבית
  const chip = page.locator("header .user-chip");
  await expect(chip).toContainText("נוגה");
  await page.reload();
  await expect(chip).toContainText("נוגה");
  await expect(chip.locator('svg[aria-label="צ\'ילי"]')).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("שלום, נוגה!");
  expect(errors).toEqual([]);
});

test("עורך אווטר: עיצוב, תצוגה חיה, שמירה ושרידות", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/personalize");
  await page.getByRole("tab", { name: /עיצוב אישי/ }).click();
  const hero = page.locator(".pz-hero img");
  await expect(hero).toBeVisible();
  const before = await hero.getAttribute("src");
  await page.getByRole("tab", { name: /שיער/ }).click();
  await page.getByRole("radio", { name: "תסרוקת / כיסוי ראש 3", exact: true }).click();
  await expect.poll(() => hero.getAttribute("src")).not.toBe(before);
  await page.getByRole("tab", { name: /משקפיים/ }).click();
  await page.getByRole("radio", { name: "משקפיים ואביזרים 2", exact: true }).click();
  await expect(page.getByRole("radio", { name: "צבע המסגרת 1", exact: true })).toBeVisible();
  const designed = await hero.getAttribute("src");
  await page.getByRole("button", { name: "שמירת הפרופיל" }).click();
  await page.reload();
  const chipImg = page.locator("header .user-chip img");
  await expect(chipImg).toHaveAttribute("alt", "אווטר בעיצוב אישי");
  expect(await chipImg.getAttribute("src")).toBe(designed);
  // נפתח שוב בעורך, עם אותו עיצוב
  await expect(page.getByRole("tab", { name: /עיצוב אישי/ })).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
});

test("ריחוף על ערכה מציג אותה בכרטיס בלבד, לחיצה מחליפה את כל המערכת", async ({ page }) => {
  await page.goto("/personalize");
  await page.getByRole("radio", { name: /גלקסיה/ }).hover();
  await expect(page.locator(".pz-hero")).toHaveAttribute("data-theme", "galaxy");
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "galaxy");
  await page.getByRole("radio", { name: /גלקסיה/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "galaxy");
});

test("ביטול שינויים מחזיר לפרופיל השמור", async ({ page }) => {
  await page.goto("/personalize");
  await page.locator("#display-name").fill("זמני");
  await page.getByRole("button", { name: "ביטול שינויים" }).click();
  await expect(page.locator("#display-name")).toHaveValue("");
  await expect(page.getByRole("button", { name: "שמירת הפרופיל" })).toBeDisabled();
});

test("ערכה מתחלפת מיד, בלי רענון, ונשמרת", async ({ page }) => {
  await page.goto("/personalize");
  const html = page.locator("html");
  const bgOf = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const before = await bgOf();
  // מסמנים את הדף — אם יהיה רענון, הסימון ייעלם
  await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 1));
  await page.getByRole("radio", { name: /חצות/ }).click();
  await expect(html).toHaveAttribute("data-theme", "midnight");
  expect(await bgOf()).not.toBe(before);
  expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(1);

  // ניווט מקלדת בין הערכות
  await page.keyboard.press("ArrowLeft");
  await expect(html).not.toHaveAttribute("data-theme", "midnight");

  await page.getByRole("radio", { name: /אוקיינוס/ }).click();
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "ocean");
  await page.goto("/study");
  await expect(html).toHaveAttribute("data-theme", "ocean");

  // חזרה ל"לפי המכשיר"
  await page.goto("/personalize");
  await page.getByRole("radio", { name: /לפי המכשיר/ }).click();
  await expect(html).not.toHaveAttribute("data-theme", /.+/);
});

// צילומי מסך של המסכים המרכזיים בכל ערכה, לבדיקה חזותית + בדיקת גלילה אופקית
const SCREENS = ["/", "/practice?mode=mixed", "/study/pad-thai", "/review", "/personalize"];
for (const t of THEMES) {
  test(`ערכה ״${t.name}״: המסכים המרכזיים`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = watchErrors(page);
    await page.goto("/");
    await page.evaluate((id) => localStorage.setItem("thai-trainer:prefs:v1", JSON.stringify({ v: 1, theme: id, displayName: "נוגה", avatarId: "face-03", updatedAt: 1 })), t.id);
    for (const s of SCREENS) {
      await page.goto(s);
      await expect(page.locator("html")).toHaveAttribute("data-theme", t.id);
      if (s.startsWith("/practice")) {
        await page.locator(".opt, .part select").first().waitFor();
        if (await page.locator(".opt").count()) {
          await page.locator(".opt").first().click();
          await page.getByRole("button", { name: "בדיקה" }).click();
        }
      }
      const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(sw, `${s} גלילה אופקית`).toBeLessThanOrEqual(iw + 1);
      await page.screenshot({ path: `e2e/shots/theme-${t.id}${s.replace(/[/?=&]/g, "_")}.png`, fullPage: false });
    }
    expect(errors).toEqual([]);
  });
}
