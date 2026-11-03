const { test, expect } = require("@playwright/test");

test("classifica, filtra, agrupa e move chamados no painel", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".ticket-card")).toHaveCount(9);
  await expect(
    page.getByRole("heading", { name: "Cada chamado, no seu lugar." }),
  ).toBeVisible();
  await expect(page.locator(".theme-badge.acesso")).toHaveCount(3);
  await expect(page.locator(".theme-badge.cobranca")).toHaveCount(3);
  await expect(page.locator(".theme-badge.problema_tecnico")).toHaveCount(3);
  await page.screenshot({
    path: "test-results/painel-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Cobrança/ }).click();
  await expect(page.locator(".ticket-card")).toHaveCount(3);
  await page.getByRole("button", { name: /^Todos os temas/ }).click();
  await page.getByRole("textbox", { name: "Buscar chamados" }).fill("Marina");
  await expect(page.locator(".ticket-card")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "Buscar chamados" })
    .fill("sem-resultado");
  await expect(page.locator(".ticket-card")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Buscar chamados" }).fill("");
  await page.getByLabel("Agrupar por").selectOption("category");
  await expect(
    page
      .getByRole("region", { name: "Acesso", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(3);
  await page.getByLabel("Agrupar por").selectOption("status");
  await page
    .getByLabel("Status de SUP-101", { exact: true })
    .selectOption("resolvido");
  await expect(
    page
      .getByRole("region", { name: "Resolvidos", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(4);
  await page
    .getByRole("button", { name: "Não consigo entrar na minha conta" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Esqueci minha senha");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Reclassificar chamados" }).click();
  await expect(page.locator(".ticket-card")).toHaveCount(9);
  await expect(
    page
      .getByRole("region", { name: "Resolvidos", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/painel-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("mostra erro e permite tentar novamente", async ({ page }) => {
  await page.route("**/api/tickets", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível carregar",
  );
  await page.unroute("**/api/tickets");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".ticket-card")).toHaveCount(9);
});
