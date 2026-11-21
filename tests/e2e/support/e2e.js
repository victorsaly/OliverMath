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

// Sheets and panels slide in. On the CI machine those transitions did not
// advance, leaving a sheet at opacity 0 with the test waiting on it, so they
// are switched off here. What the tests check is that things appear and work,
// not how they move.
Cypress.on('window:before:load', (win) => {
  win.document.addEventListener('DOMContentLoaded', () => {
    const style = win.document.createElement('style');
    style.textContent = [
      '.sheet-enter-active', '.sheet-leave-active',
      '.panel-enter-active', '.panel-leave-active'
    ].join(',') + '{ transition: none !important; animation: none !important; }';
    win.document.head.appendChild(style);
  });
});
