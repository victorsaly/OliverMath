/// <reference types="cypress" />

describe('Oliver Math - Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the home page with start button', () => {
    cy.get('.start-button').should('be.visible');
    cy.get('.start-button').should('contain.text', 'Start');
  });

  it('should display the robot mascot', () => {
    cy.get('.robot-image').should('be.visible');
  });

  it('should display level selector', () => {
    cy.get('ion-select').should('exist');
  });

  it('should display stars counter', () => {
    cy.get('.stars-container').should('exist');
  });

  it('should start game when clicking start button', () => {
    cy.get('.start-button').click();
    // Game should display a math question
    cy.get('.speech-phrase', { timeout: 5000 }).should('exist');
  });
});

describe('Oliver Math - Game Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display operator buttons', () => {
    cy.get('ion-segment-button').should('have.length.at.least', 1);
  });

  it('should change operator when clicking segment button', () => {
    cy.get('ion-segment-button').first().click();
    cy.get('ion-segment-button').first().should('have.class', 'segment-button-checked');
  });

  it('should navigate to assistant page', () => {
    cy.visit('/assistant');
    cy.url().should('include', '/assistant');
  });
});

describe('Oliver Math - Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have proper page structure', () => {
    cy.get('ion-page').should('exist');
    cy.get('ion-content').should('exist');
  });

  it('should be mobile responsive', () => {
    // Test at mobile viewport (already set in config)
    cy.viewport(375, 667);
    cy.get('.start-button').should('be.visible');
    
    // Test at tablet viewport
    cy.viewport(768, 1024);
    cy.get('.start-button').should('be.visible');
  });
});
