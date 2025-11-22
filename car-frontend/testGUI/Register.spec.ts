import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
  });

  test('страница регистрации отображается', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible();

    await expect(page.getByPlaceholder('Введите логин')).toBeVisible();
    await expect(page.getByPlaceholder('Введите email')).toBeVisible();
    await expect(page.getByPlaceholder('Фамилия')).toBeVisible();
    await expect(page.getByPlaceholder('Имя')).toBeVisible();
    await expect(page.getByPlaceholder('Отчество')).toBeVisible();
    await expect(page.getByPlaceholder('Введите пароль')).toBeVisible();
    await expect(page.getByPlaceholder('Повторите пароль')).toBeVisible();
  });

  test('переход по ссылке "Войти" на страницу логина работает', async ({ page }) => {
    await page.getByRole('link', { name: 'Войти' }).click();

    await page.waitForURL('http://localhost:5173/login');

    await expect(page).toHaveURL('http://localhost:5173/login');
    await expect(page.getByRole('heading', { name: 'Вход в аккаунт' })).toBeVisible();
  });

  test('валидация: нельзя отправить пустую форму', async ({ page }) => {
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page.getByText('Введите логин')).toBeVisible();
    await expect(page.getByText('Введите email')).toBeVisible();
    await expect(page.getByText('Введите фамилию')).toBeVisible();
    await expect(page.getByText('Введите имя')).toBeVisible();
    await expect(page.getByText('Введите пароль')).toBeVisible();
  });

  test('валидация: показывает ошибку если пароли не совпадают', async ({ page }) => {
    await page.getByPlaceholder('Введите пароль').fill('Aa12345');
    await page.getByPlaceholder('Повторите пароль').fill('Wrong123');

    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await expect(page.getByText('Пароли не совпадают')).toBeVisible();
  });

  test('успешная регистрация перенаправляет на /', async ({ page }) => {

    await page.route('**/register', async (route) => {
      return route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: { user: { id: 1, username: 'newuser' } },
        }),
      });
    });

    await page.getByPlaceholder('Введите логин').fill('newuser');
    await page.getByPlaceholder('Введите email').fill('test@example.com');
    await page.getByPlaceholder('Фамилия').fill('Иванов');
    await page.getByPlaceholder('Имя').fill('Иван');
    await page.getByPlaceholder('Отчество').fill('Иванович');

    await page.getByPlaceholder('Введите пароль').fill('Aa12345');
    await page.getByPlaceholder('Повторите пароль').fill('Aa12345');

    await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

    await page.waitForURL('http://localhost:5173/');

    expect(page.url()).toBe('http://localhost:5173/');
  });

});
