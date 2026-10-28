import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
   testDir: './e2e',
   fullyParallel: true,
   forbidOnly: !!process.env.CI,
   retries: process.env.CI ? 1 : 0,
   use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
   projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
   ],
   webServer: {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI,
   },
})
