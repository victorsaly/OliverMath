import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // The game. The product site is one level up, at the root.
    baseUrl: 'http://localhost:8100/play',
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,ts}',
    fixturesFolder: 'tests/e2e/fixtures',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    viewportWidth: 375,
    viewportHeight: 667,
    video: false,
    // Cypress waits for an element to stop moving before it taps. On CI the
    // 3D scene is drawn in software and frames can be seconds apart, so the
    // layout around the dock and the sheets takes long enough to settle that
    // taps timed out at random. The tests check outcomes, not motion.
    waitForAnimations: false,
    screenshotOnRunFailure: true,
  },
});
