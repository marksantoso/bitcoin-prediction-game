import { test, expect } from '@playwright/test';
import { GAME_CONFIG } from '../../src/config/game';

// Increase timeout to accommodate the full prediction workflow
test.setTimeout(90000); // 90 seconds to cover the 60-second game time plus buffer

test.describe('Bitcoin Prediction Game Page', () => {
  const mockUserId = 'test-user-123';

  test.beforeEach(async ({ page }) => {
    // Navigate to the game page with a test user ID
    await page.goto(`/play/${mockUserId}`);
    // Wait for initial data load
    await page.waitForLoadState('networkidle');
  });

  test('should display header and game rules', async ({ page }) => {
    // Check header content
    await expect(page.getByText('Bitcoin Price Prediction Game')).toBeVisible();
    await expect(page.getByText('Predict if Bitcoin will go up or down in the next 60 seconds')).toBeVisible();
    
    // Check game rules button and dialog
    const rulesButton = page.getByRole('button', { name: /How to play/i });
    await expect(rulesButton).toBeVisible();
    
    // Open rules dialog
    await rulesButton.click();
    await expect(page.getByRole('heading', { name: 'How to Play' })).toBeVisible();
  });

  test('should display TradingView chart', async ({ page }) => {
    // Check if TradingView chart container is present
    await expect(page.locator('#tradingview_chart')).toBeVisible();
    
    // Wait for any TradingView iframe to be present
    const chartIframe = page.locator('iframe[src*="tradingview.com"]');
    await expect(chartIframe).toBeVisible({
      timeout: 10000 // Increase timeout to 10 seconds
    });
    
    // Verify the iframe source
    const iframeSrc = await chartIframe.getAttribute('src');
    expect(iframeSrc).toContain('tradingview.com');
  });

  test('should display price and score grid', async ({ page }) => {
    // Check price display - use a more specific selector for the price card heading
    await expect(page.getByRole('heading', { name: 'Bitcoin Price', exact: true })).toBeVisible();
    const priceElement = page.getByTestId('current-price');
    await expect(priceElement).toBeVisible();
    
    // Verify price format ($XX,XXX.XX)
    const priceText = await priceElement.textContent();
    expect(priceText).toMatch(/^\$\d{1,3}(,\d{3})*\.\d{2}$/);

    // Check score display
    await expect(page.getByText(/Score/i)).toBeVisible();
    await expect(page.getByTestId('user-score')).toBeVisible();
  });

  test('should handle prediction workflow', async ({ page }) => {
    // Initial state - both buttons should be enabled
    const upButton = page.getByRole('button', { name: /Price will go UP/i });
    const downButton = page.getByRole('button', { name: /Price will go DOWN/i });
    
    // Wait for buttons to be visible first
    await expect(upButton).toBeVisible();
    await expect(downButton).toBeVisible();
    
    // Get initial score
    await expect(page.getByTestId('user-score')).toBeVisible();
    const initialScore = await page.getByTestId('user-score').textContent();
    const initialScoreNum = initialScore ? parseInt(initialScore) : 0;
    
    // Then check their enabled state
    await expect(upButton).toBeEnabled();
    await expect(downButton).toBeEnabled();

    // Make a prediction
    await upButton.click();

    // Verify active prediction display
    await expect(page.getByText('Active Prediction')).toBeVisible();
    await expect(page.getByText(/Starting price/)).toBeVisible();
    await expect(page.getByText(/Price will go UP/)).toBeVisible();

    // Wait for prediction to complete
    await page.waitForTimeout(GAME_CONFIG.guessResolutionTime + 1000);

    // Verify score has updated
    await expect(page.getByTestId('user-score')).toBeVisible();
    const newScore = await page.getByTestId('user-score').textContent();
    const newScoreNum = newScore ? parseInt(newScore) : 0;
    expect(Math.abs(newScoreNum - initialScoreNum)).toBe(1); // Score should change by exactly 1 point

    // Verify buttons are enabled again
    await expect(upButton).toBeEnabled();
    await expect(downButton).toBeEnabled();
  });

  test('should update price in real-time', async ({ page }) => {
    // Get initial price
    const initialPrice = await page.getByTestId('current-price').textContent();
    
    // Poll for price changes for up to 60 seconds
    const maxWaitTime = 60000; // 60 seconds
    const pollInterval = 1000; // Check every second
    const startTime = Date.now();
    let updatedPrice = initialPrice;
    
    while (Date.now() - startTime < maxWaitTime) {
      // Get current price
      updatedPrice = await page.getByTestId('current-price').textContent();
      
      // If price has changed, we can exit the loop
      if (updatedPrice !== initialPrice) {
        break;
      }
      
      // Wait before next check
      await page.waitForTimeout(pollInterval);
    }
    
    // Verify price has changed
    expect(updatedPrice).toBeDefined();
    expect(updatedPrice, 'Price should change within 60 seconds').not.toBe(initialPrice);
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Wait for the button to be ready first
    const upButton = page.getByRole('button', { name: /Price will go UP/i });
    const downButton = page.getByRole('button', { name: /Price will go DOWN/i });

    await expect(upButton).toBeVisible();
    await expect(upButton).toBeEnabled();
    await expect(downButton).toBeVisible();
    await expect(downButton).toBeEnabled();

    // Simulate offline mode
    await context.setOffline(true);

    // Should show offline state on buttons
    await expect(page.getByRole('button', { name: /Offline - Check connection/i })).toHaveCount(2);

    // Restore online mode
    await context.setOffline(false);

    // UI should recover
    await expect(upButton).toBeEnabled();
    await expect(upButton).toContainText('Price will go UP');
    await expect(downButton).toBeEnabled();
    await expect(downButton).toContainText('Price will go DOWN');
  });

  test('should persist game state across page reloads', async ({ page }) => {
    // Get initial score
    const initialScore = await page.getByTestId('user-score').textContent();

    // Make a prediction
    await page.getByRole('button', { name: /Price will go UP/i }).click();
    
    // Wait for prediction to complete
    await page.waitForTimeout(GAME_CONFIG.guessResolutionTime + 1000);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Score should persist
    const newScore = await page.getByTestId('user-score').textContent();
    expect(newScore).not.toBe(initialScore);
  });

  test('should enforce game rules', async ({ page }) => {
    // Make first prediction
    await page.getByRole('button', { name: /Price will go UP/i }).click();

    // Wait for first prediction to complete
    await page.waitForTimeout(GAME_CONFIG.guessResolutionTime + 1000);

    // Should be able to make another prediction
    await expect(page.getByRole('button', { name: /Price will go UP/i })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Price will go DOWN/i })).toBeEnabled();
  });
});
