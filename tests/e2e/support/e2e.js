// E2E test support file
// Add custom commands here

Cypress.Commands.add('startGame', () => {
  cy.get('.start-button').click();
});

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err) => {
  // Ignore speech synthesis errors in test environment
  if (err.message.includes('speechSynthesis') || 
      err.message.includes('SpeechRecognition') ||
      err.message.includes('microphone')) {
    return false;
  }
  return true;
});

// Sheets and panels slide in. The CI machine draws the 3D scene in software,
// so frames can be seconds apart; a sheet then sits at its starting position
// (off screen, transparent) long after a test expects to tap it. Under test
// the sheets appear in place at once. What the tests check is that things
// appear and work, not how they move.
Cypress.on('window:before:load', (win) => {
  win.document.addEventListener('DOMContentLoaded', () => {
    const style = win.document.createElement('style');
    const names = ['sheet', 'panel'];
    const moving = names.flatMap((n) => [`.${n}-enter-active`, `.${n}-leave-active`]).join(',');
    const starting = names.flatMap((n) => [`.${n}-enter-from`, `.${n}-leave-to`]).join(',');
    style.textContent =
      `${moving}{ transition: none !important; animation: none !important; }` +
      `${starting}{ transform: none !important; opacity: 1 !important; }`;
    win.document.head.appendChild(style);
  });
});
