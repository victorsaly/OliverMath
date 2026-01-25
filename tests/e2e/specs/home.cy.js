/// <reference types="cypress" />

describe('Oliver Math - Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for Ionic components to initialize
    cy.get('ion-app').should('exist');
  });

  it('should display the home page with play button', () => {
    cy.get('.play-button').should('be.visible');
    // Button shows "Play" (from i18n) not "Play Math"
    cy.get('.play-button').should('contain.text', 'Play');
  });

  it('should display the bot container', () => {
    cy.get('.bot-container').should('be.visible');
  });

  it('should display settings button in header', () => {
    // Settings button is an ion-button in the header
    cy.get('ion-header ion-button').first().should('exist');
  });

  it('should display stars counter in header', () => {
    cy.get('ion-chip[color="warning"]').should('exist');
  });

  it('should display status indicator', () => {
    cy.get('.status-indicator').should('exist');
  });
});

describe('Oliver Math - Settings Modal', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('ion-app').should('exist');
  });

  it('should open settings modal when clicking settings button', () => {
    cy.get('ion-header ion-button').first().click();
    cy.get('ion-modal').should('be.visible');
  });

  it('should display settings groups in modal', () => {
    cy.get('ion-header ion-button').first().click();
    cy.get('ion-modal').should('be.visible');
    cy.get('.settings-group').should('have.length.at.least', 1);
  });

  it('should navigate to stats page via chip', () => {
    cy.get('ion-chip[color="warning"]').click();
    cy.url().should('include', '/stats');
  });
});

describe('Oliver Math - Accessibility', () => {
  it('should have proper page structure', () => {
    cy.visit('/');
    // Ionic components may render in shadow DOM, check for key elements
    cy.get('ion-header').should('exist');
    cy.get('ion-content').should('exist');
    cy.get('ion-footer').should('exist');
    cy.get('ion-toolbar').should('exist');
  });

  it('should have interactive elements', () => {
    cy.visit('/');
    // Check star chip exists with navigation
    cy.get('ion-chip[color="warning"]').should('exist');
    // Play button exists
    cy.get('.play-button').should('exist');
  });

  it('should be mobile responsive', () => {
    cy.visit('/');
    // Test at mobile viewport
    cy.viewport(375, 667);
    cy.get('.play-button').should('be.visible');
    
    // Test at tablet viewport
    cy.viewport(768, 1024);
    cy.get('.play-button').should('be.visible');
  });
});
