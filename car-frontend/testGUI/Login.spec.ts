import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
  });

  test('страница логина отображается', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Вход в аккаунт' })).toBeVisible();
    await expect(page.getByPlaceholder('Введите логин')).toBeVisible();
    await expect(page.getByPlaceholder('Введите пароль')).toBeVisible();
  });

  test('переход по ссылке на регистрацию работает', async ({ page }) => {
    await page.getByRole('link', { name: 'Зарегистрироваться' }).click();

    await page.waitForURL('http://localhost:5173/register');

    await expect(page).toHaveURL('http://localhost:5173/register');
    await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible();
  });

  test('валидация: нельзя отправить пустую форму', async ({ page }) => {
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Введите логин')).toBeVisible();
    await expect(page.getByText('Введите пароль')).toBeVisible();
  });

  test('ошибочный логин показывает Snackbar', async ({ page }) => {
    await page.route('**/login', async (route) => {
      return route.fulfill({
        status: 400,
        body: JSON.stringify({ error: 'Неверный логин или пароль' }),
      });
    });

    await page.getByPlaceholder('Введите логин').fill('wrong');
    await page.getByPlaceholder('Введите пароль').fill('123');

    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Неверный логин или пароль')).toBeVisible();
  });

  test('успешный логин перенаправляет на /', async ({ page }) => {
    await page.route('**/login', async (route) => {
        return route.fulfill({
        status: 200,
        body: JSON.stringify({
            data: { user: { id: 1, username: 'admin' } },
        }),
        });
    });

    await page.getByPlaceholder('Введите логин').fill('client');
    await page.getByPlaceholder('Введите пароль').fill('client');

    await page.getByRole('button', { name: 'Войти' }).click();

    await page.waitForURL('http://localhost:5173/');

    expect(page.url()).toBe('http://localhost:5173/');
  });
});
