import { test, expect } from '@playwright/test'

test.describe('College Portal Tests', () => {
  
  test('Test 1: Главная страница - выбор роли', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('College Portal')
    
    // Используем first() для уникального выбора
    await page.getByRole('button', { name: /Student/i }).first().click()
    await expect(page).toHaveURL('/dashboard')
  })

  test('Test 2: Dashboard - загрузка и отображение', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back')
    await expect(page.locator('text=Average')).toBeVisible()
    await expect(page.locator('text=AI Insights')).toBeVisible()
  })

  test('Test 3: Students - таблица и фильтры', async ({ page }) => {
    await page.goto('/dashboard/students')
    await expect(page.locator('h1')).toContainText('Students')
    await expect(page.locator('table')).toBeVisible()
    await expect(page.getByRole('button', { name: /Add Student/i })).toBeVisible()
    
    await page.locator('input[placeholder*="Search"]').fill('John')
    await expect(page.locator('text=John Smith')).toBeVisible()
  })

  test('Test 4: Students - фильтр по группе', async ({ page }) => {
    await page.goto('/dashboard/students')
    await page.locator('select').first().selectOption('CS-21')
    // Проверяем что есть студенты с CS-21 в таблице
    await expect(page.getByRole('cell', { name: 'CS-21' }).first()).toBeVisible()
  })

  test('Test 5: Teachers - страница преподавателей', async ({ page }) => {
    await page.goto('/dashboard/teachers')
    await expect(page.locator('h1')).toContainText('Teachers')
    await expect(page.locator('text=Dr. Robert Johnson')).toBeVisible()
  })

  test('Test 6: Analytics - графики', async ({ page }) => {
    await page.goto('/dashboard/analytics')
    await expect(page.locator('h1')).toContainText('Analytics')
    await expect(page.getByText('Average', { exact: true })).toBeVisible()
    await expect(page.getByText('Subject Performance')).toBeVisible()
  })

  test('Test 7: Grades - страница оценок', async ({ page }) => {
    await page.goto('/dashboard/grades')
    await expect(page.locator('h1')).toContainText('Grades')
    await expect(page.getByText('Mathematics', { exact: true }).first()).toBeVisible()
  })

  test('Test 8: Profile - профиль пользователя', async ({ page }) => {
    await page.goto('/dashboard/profile')
    await expect(page.locator('h1')).toContainText('Profile')
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
  })

  test('Test 9: Навигация - переход между страницами', async ({ page }) => {
    await page.goto('/dashboard')
    // Используем более специфичный селектор
    await page.locator('aside').getByText('Students').click()
    await expect(page).toHaveURL('/dashboard/students')
  })

  test('Test 10: UI компоненты - кнопки', async ({ page }) => {
    await page.goto('/dashboard/students')
    await expect(page.getByRole('button', { name: /Add Student/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /View/i }).first()).toBeVisible()
  })
})