import { expect, test } from "@playwright/test";

test("keyboard dragging the antiquark transfers focus when the tube breaks and rejoins", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?ea&screens=3");
  const antiquark = page.getByRole("application", { name: "Antiquark", exact: true });
  const separation = page.getByRole("slider", { name: "Quark separation", exact: true });
  const rejoin = page.getByRole("button", { name: "Rejoin the pair", exact: true });

  await antiquark.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(antiquark).toBeFocused();
  const start = Number(await separation.getAttribute("aria-valuenow"));
  await page.keyboard.press("Shift+ArrowRight");
  await expect.poll(async () => Number(await separation.getAttribute("aria-valuenow")) - start).toBeCloseTo(0.05);
  for (let move = 0; move < 35 && !(await rejoin.isVisible()); move++) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(rejoin).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(antiquark).toBeFocused();
  await expect(separation).toHaveAttribute("aria-valuenow", String(start));
  expect(errors).toEqual([]);
});
