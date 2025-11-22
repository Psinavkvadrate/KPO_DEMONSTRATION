import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: 1,
          username: 'client',
          role: 'User',
          full_name: 'Иван Иванов',
        })
      );
    });
  });

  const mockCars = [
    {
      VIN: 'VIN001',
      mark: 'BMW',
      model: 'X5',
      prodYear: 2021,
      amount: 5000000,
      mileage: 42000,
      status: 'Available',
      condition: 'Excellent',
      img: '',
      postDate: '2024-01-01'
    },
    {
      VIN: 'VIN002',
      mark: 'Audi',
      model: 'A6',
      prodYear: 2019,
      amount: 3500000,
      mileage: 61000,
      status: 'Available',
      condition: 'Good',
      img: '',
      postDate: '2024-01-02'
    }
  ];

  async function mockCarsRequest(page, cars = mockCars) {
    await page.route('**/api/cars', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          error: null,
          data: { data: cars, messages: null }
        })
      });
    });
  }

  test('загрузка главной страницы и отображение пользователя в шапке', async ({ page }) => {
    await mockCarsRequest(page);
    await page.goto('http://localhost:5173/');

    await expect(page.locator('.username')).toHaveText('Иван Иванов');
    await expect(page.getByText('Каталог')).toBeVisible();
    await expect(page.getByText('Мои встречи')).toBeVisible();
  });

  test('отображение спиннера загрузки при получении автомобилей', async ({ page }) => {
    await page.route('**/api/cars', async (route) => {
      await new Promise(r => setTimeout(r, 300));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ error: null, data: { data: mockCars, messages: null } })
      });
    });

    await page.goto('http://localhost:5173/');

    await expect(page.locator('.spinner')).toBeVisible();
  });

  test('отображение карточек автомобилей', async ({ page }) => {
    await mockCarsRequest(page);
    await page.goto('http://localhost:5173/');

    await expect(page.getByText('BMW')).toBeVisible();
    await expect(page.getByText('Audi')).toBeVisible();
    await expect(page.getByText('X5')).toBeVisible();
    await expect(page.getByText('A6')).toBeVisible();
  });

  test('фильтрация автомобилей по марке', async ({ page }) => {
    await mockCarsRequest(page);
    await page.goto('http://localhost:5173/');

    await page.getByPlaceholder('Марка').fill('BMW');

    await expect(page.getByText('BMW')).toBeVisible();
    await expect(page.getByText('Audi')).toHaveCount(0);
  });

  test('фильтрация автомобилей по модели', async ({ page }) => {
    await mockCarsRequest(page);
    await page.goto('http://localhost:5173/');

    await page.getByPlaceholder('Модель').fill('A6');

    await expect(page.getByText('A6')).toBeVisible();
    await expect(page.getByText('X5')).toHaveCount(0);
  });

  test('сброс всех фильтров', async ({ page }) => {
    await mockCarsRequest(page);
    await page.goto('http://localhost:5173/');

    await page.getByPlaceholder('Марка').fill('BMW');

    await expect(page.getByText('BMW')).toBeVisible();
    await expect(page.getByText('Audi')).toHaveCount(0);

    await page.getByRole('button', { name: 'Сбросить фильтры' }).click();

    await expect(page.getByText('BMW')).toBeVisible();
    await expect(page.getByText('Audi')).toBeVisible();
  });

  test('отображение сообщения об отсутствии автомобилей', async ({ page }) => {
    await mockCarsRequest(page, []);
    await page.goto('http://localhost:5173/');

    await expect(page.getByText(/Автомобили не найдены/)).toBeVisible();
  });

  test('выход из системы очищает пользователя и перенаправляет на страницу входа', async ({ page }) => {
    await mockCarsRequest(page);
    await page.goto('http://localhost:5173/');

    await page.locator('.profile-avatar').click();
    await page.getByText('Выйти').click();

    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});