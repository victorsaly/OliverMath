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
