const { test, expect } = require("@playwright/test");

test("carrega API externa e preserva os acentos", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ticket-card")).toHaveCount(12, {
    timeout: 25000,
  });
  await expect(page.locator(".theme-badge.revisao")).toHaveCount(0);
  await page.locator(".ticket-title").first().click();
  await expect(page.getByRole("dialog")).toContainText("TRADU");
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: "test-results/api-externa.png",
    fullPage: true,
  });
  await page.getByLabel("Fonte dos chamados").selectOption("local");
  await expect(page.locator(".ticket-card")).toHaveCount(9);
  await expect(page.locator(".theme-badge.revisao")).toHaveCount(9);
});

test("classifica, filtra, agrupa e move chamados no painel", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?source=local");
  await expect(page.locator(".ticket-card")).toHaveCount(9);
  await expect(
    page.getByRole("heading", { name: "Fila de atendimento." }),
  ).toBeVisible();
  await expect(page.locator(".theme-badge.revisao")).toHaveCount(9);
  await page
    .getByRole("button", { name: "Identificar assuntos", exact: true })
    .click();
  await expect(page.locator(".theme-badge.acesso")).toHaveCount(3);
  await expect(page.locator(".theme-badge.cobranca")).toHaveCount(3);
  await expect(page.locator(".theme-badge.problema_tecnico")).toHaveCount(3);
  await expect(page.getByLabel("Fonte dos chamados")).toContainText(
    "Dados mocados",
  );
  await expect(page.getByLabel("Fonte dos chamados")).toContainText(
    "Dados da API externa",
  );
  await page
    .getByRole("button", { name: "Ver classificação", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("9 com tema sugerido");
  await expect(page.getByRole("dialog")).toContainText(
    "Texto usado para identificar o assunto",
  );
  await page.screenshot({
    path: "test-results/registro-classificacao.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Fechar classificação" }).click();
  await page
    .getByRole("button", { name: "Voltar para antes da classificação" })
    .click();
  await expect(page.locator(".theme-badge.revisao")).toHaveCount(9);
  await expect(
    page
      .getByRole("region", { name: "Aguardando revisão", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(9);
  await page
    .getByRole("button", { name: "Identificar assuntos", exact: true })
    .click();
  await expect(page.locator(".theme-badge.acesso")).toHaveCount(3);
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
  await expect(page.getByLabel("Agrupar por")).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "Acesso", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(3);

  await page
    .getByLabel("Status de SUP-101", { exact: true })
    .selectOption("resolvido");
  await expect(
    page
      .getByRole("region", { name: "Acesso", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(3);
  await page
    .getByRole("button", { name: "Não consigo entrar na minha conta" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Esqueci minha senha");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Identificar assuntos" }).click();
  await expect(page.locator(".ticket-card")).toHaveCount(9);
  await expect(
    page
      .getByRole("region", { name: "Acesso", exact: true })
      .locator(".ticket-card"),
  ).toHaveCount(3);
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
  await page.route("**/api/tickets*", (route) =>
    route.fulfill({ status: 503, body: "{}" }),
  );
  await page.goto("/?source=local");
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível carregar",
  );
  await page.unroute("**/api/tickets*");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".ticket-card")).toHaveCount(9);
});
