# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: main.spec.ts >> College Portal Tests >> Test 10: UI компоненты - кнопки
- Location: tests\main.spec.ts:70:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Add Student/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /Add Student/i })

```

# Page snapshot

```yaml
- generic [ref=e2]: Internal Server Error
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('College Portal Tests', () => {
  4  |   
  5  |   test('Test 1: Главная страница - выбор роли', async ({ page }) => {
  6  |     await page.goto('/')
  7  |     await expect(page.locator('h1')).toContainText('College Portal')
  8  |     
  9  |     // Используем first() для уникального выбора
  10 |     await page.getByRole('button', { name: /Student/i }).first().click()
  11 |     await expect(page).toHaveURL('/dashboard')
  12 |   })
  13 | 
  14 |   test('Test 2: Dashboard - загрузка и отображение', async ({ page }) => {
  15 |     await page.goto('/dashboard')
  16 |     await expect(page.locator('h1')).toContainText('Welcome back')
  17 |     await expect(page.locator('text=Average')).toBeVisible()
  18 |     await expect(page.locator('text=AI Insights')).toBeVisible()
  19 |   })
  20 | 
  21 |   test('Test 3: Students - таблица и фильтры', async ({ page }) => {
  22 |     await page.goto('/dashboard/students')
  23 |     await expect(page.locator('h1')).toContainText('Students')
  24 |     await expect(page.locator('table')).toBeVisible()
  25 |     await expect(page.getByRole('button', { name: /Add Student/i })).toBeVisible()
  26 |     
  27 |     await page.locator('input[placeholder*="Search"]').fill('John')
  28 |     await expect(page.locator('text=John Smith')).toBeVisible()
  29 |   })
  30 | 
  31 |   test('Test 4: Students - фильтр по группе', async ({ page }) => {
  32 |     await page.goto('/dashboard/students')
  33 |     await page.locator('select').first().selectOption('CS-21')
  34 |     // Проверяем что есть студенты с CS-21 в таблице
  35 |     await expect(page.getByRole('cell', { name: 'CS-21' }).first()).toBeVisible()
  36 |   })
  37 | 
  38 |   test('Test 5: Teachers - страница преподавателей', async ({ page }) => {
  39 |     await page.goto('/dashboard/teachers')
  40 |     await expect(page.locator('h1')).toContainText('Teachers')
  41 |     await expect(page.locator('text=Dr. Robert Johnson')).toBeVisible()
  42 |   })
  43 | 
  44 |   test('Test 6: Analytics - графики', async ({ page }) => {
  45 |     await page.goto('/dashboard/analytics')
  46 |     await expect(page.locator('h1')).toContainText('Analytics')
  47 |     await expect(page.getByText('Average', { exact: true })).toBeVisible()
  48 |     await expect(page.getByText('Subject Performance')).toBeVisible()
  49 |   })
  50 | 
  51 |   test('Test 7: Grades - страница оценок', async ({ page }) => {
  52 |     await page.goto('/dashboard/grades')
  53 |     await expect(page.locator('h1')).toContainText('Grades')
  54 |     await expect(page.getByText('Mathematics', { exact: true }).first()).toBeVisible()
  55 |   })
  56 | 
  57 |   test('Test 8: Profile - профиль пользователя', async ({ page }) => {
  58 |     await page.goto('/dashboard/profile')
  59 |     await expect(page.locator('h1')).toContainText('Profile')
  60 |     await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
  61 |   })
  62 | 
  63 |   test('Test 9: Навигация - переход между страницами', async ({ page }) => {
  64 |     await page.goto('/dashboard')
  65 |     // Используем более специфичный селектор
  66 |     await page.locator('aside').getByText('Students').click()
  67 |     await expect(page).toHaveURL('/dashboard/students')
  68 |   })
  69 | 
  70 |   test('Test 10: UI компоненты - кнопки', async ({ page }) => {
  71 |     await page.goto('/dashboard/students')
> 72 |     await expect(page.getByRole('button', { name: /Add Student/i })).toBeVisible()
     |                                                                      ^ Error: expect(locator).toBeVisible() failed
  73 |     await expect(page.getByRole('button', { name: /View/i }).first()).toBeVisible()
  74 |   })
  75 | })
```