import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // The game. The product site is one level up, at /OliverMath/.
    baseUrl: 'http://localhost:8100/OliverMath/play',
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,ts}',
    fixturesFolder: 'tests/e2e/fixtures',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    viewportWidth: 375,
    viewportHeight: 667,
    video: false,
    screenshotOnRunFailure: true,
  },
});
