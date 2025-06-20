import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display sign in page with correct elements', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title is displayed
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    
    // Check if device ID is displayed (should be visible)
    await expect(page.getByText(/Device ID:/)).toBeVisible();
    
    // Check if the sign in button is present
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    
    // Check if footer text is displayed
    await expect(page.getByText('Your device is automatically identified')).toBeVisible();
    await expect(page.getByText('No passwords required')).toBeVisible();
  });

  test('should redirect to play page after sign in', async ({ page }) => {
    await page.goto('/');
    
    // Click the sign in button
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    // Should redirect to play page with userId parameter
    await expect(page).toHaveURL(/\/play\/[a-zA-Z0-9-]+/);
  });

  test('should handle page refresh correctly', async ({ page }) => {
    await page.goto('/');
    
    // Get initial device ID
    const initialDeviceId = await page.getByText(/Device ID:/).textContent();
    
    // Refresh the page
    await page.reload();
    
    // Should still show a device ID after refresh
    await expect(page.getByText(/Device ID:/)).toBeVisible();
    
    // Device ID should be the same after refresh (new generation)
    const refreshedDeviceId = await page.getByText(/Device ID:/).textContent();
    expect(refreshedDeviceId).toBe(initialDeviceId);
  });
});
