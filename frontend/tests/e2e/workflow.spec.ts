import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({ status: 401, json: { detail: 'Sem sessão' } }),
  );
});

test('CA-WF-001/002/007: renders 22 nodes and automatically plays, pauses and restarts', async ({
  page,
}) => {
  await page.goto('/engineering/workflow');
  await expect(
    page.getByText('Modo demonstração — execução simulada'),
  ).toBeVisible();
  await expect(page.locator('.react-flow__node')).toHaveCount(22);
  await page.getByLabel('Velocidade', { exact: true }).selectOption('4');
  await page.getByRole('button', { name: 'Iniciar simulação' }).click();
  await expect(page.getByRole('progressbar')).not.toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await page.getByRole('button', { name: 'Pausar' }).click();
  const progress = await page
    .getByRole('progressbar')
    .getAttribute('aria-valuenow');
  await page.waitForTimeout(500);
  await expect(page.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    progress ?? '0',
  );
  await page.getByRole('button', { name: 'Retomar' }).click();
  await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await expect(page.getByRole('log')).toContainText('Ready to start workflow');
});

test('CA-WF-003a/005a: demonstrates failure, recovery, log filters and export', async ({
  page,
}) => {
  await page.goto('/engineering/workflow');
  await page.getByLabel('Selecionar cenário').selectOption('unit-failure');
  await page.getByLabel('Velocidade', { exact: true }).selectOption('4');
  await page.getByRole('button', { name: 'Iniciar simulação' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '100',
    { timeout: 30_000 },
  );
  await expect(page.getByRole('log')).toContainText(
    'ISBN duplicado não tratado',
  );
  await expect(page.getByRole('log')).toContainText(
    'Software aprovado: aprovado no cenário demonstrativo.',
  );
  await page.getByLabel('Filtrar nível dos logs').selectOption('ERROR');
  await expect(page.locator('.log-line')).toHaveCount(1);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar histórico' }).click();
  expect((await download).suggestedFilename()).toBe(
    'workflow-demonstracao.json',
  );
  await page.getByRole('button', { name: 'Limpar logs' }).click();
  await expect(page.locator('.log-line')).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '100',
  );
});

test('CA-WF-001a/006: selects artifacts, zooms, follows and supports keyboard controls', async ({
  page,
}) => {
  await page.goto('/engineering/workflow');
  await page.locator('[data-id="spec"]').click();
  await expect(
    page.getByRole('complementary', { name: 'Detalhes da etapa selecionada' }),
  ).toContainText('Especificação SDD');
  await page
    .getByRole('button', { name: 'Próxima etapa', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('progressbar')).not.toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await page
    .getByRole('button', { name: 'Etapa anterior', exact: true })
    .click();
  await expect(page.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await page.getByLabel('Seguir etapa').check();
  await page.locator('.react-flow__controls-zoomin').click();
  await page.locator('.react-flow__controls-fitview').click();
});

test('CA-UI-005/CA-WF-006a: captures responsive dark and light layouts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/engineering/workflow');
  await expect(page.locator('.react-flow__node')).toHaveCount(22);
  await page.screenshot({
    path: 'artifacts/studio-desktop-dark.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Tema claro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.screenshot({
    path: 'artifacts/studio-desktop-light.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('button', { name: 'Tema escuro' }).click();
  await page.getByRole('button', { name: 'Fechar menu' }).click();
  for (const name of ['Copiar logs', 'Exportar histórico', 'Limpar logs']) {
    const button = page.getByRole('button', { name });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeInViewport();
    const bounds = await button.boundingBox();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(390);
  }
  await page.screenshot({
    path: 'artifacts/studio-mobile-dark.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([
    'library-theme',
  ]);
});

test('CA-WF-005b/006: controls terminal scroll, clipboard and fullscreen', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/engineering/workflow');
  await page.getByLabel('Auto-scroll').uncheck();
  for (let index = 0; index < 20; index += 1) {
    await page.getByRole('button', { name: 'Próxima etapa', exact: true }).click();
  }
  const terminal = page.getByRole('log');
  expect(await terminal.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  expect(await terminal.evaluate((element) => element.scrollTop)).toBe(0);
  await page.getByLabel('Auto-scroll').check();
  await expect.poll(() => terminal.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await page.getByLabel('Auto-scroll').uncheck();
  await terminal.evaluate((element) => { element.scrollTop = 0; });
  await page.getByRole('button', { name: 'Próxima etapa', exact: true }).click();
  expect(await terminal.evaluate((element) => element.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Copiar logs' }).click();
  await expect(page.getByText('Logs copiados.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('[ORCHESTRATOR]');
  await page.getByRole('button', { name: 'Tela cheia' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null)).toBe(true);
  await expect(page.locator(':fullscreen').getByText('Modo demonstração — execução simulada')).toBeVisible();
  await page.getByRole('button', { name: 'Tela cheia' }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
});
