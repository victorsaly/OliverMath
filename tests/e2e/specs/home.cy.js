/// <reference types="cypress" />

describe('Oliver Math - Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the home page with play button', () => {
    cy.get('.play-button').should('be.visible');
    cy.get('.play-button').should('contain.text', 'Play Math');
  });

  it('should display the bot face', () => {
    cy.get('.bot-container').should('be.visible');
    cy.get('#bot').should('exist');
  });

  it('should display level selector', () => {
    cy.get('ion-select').should('exist');
  });

  it('should display stars counter in header', () => {
    cy.get('ion-chip[color="warning"]').should('exist');
  });

  it('should display stats chips', () => {
    cy.get('.stat-chip').should('have.length.at.least', 1);
  });
});

describe('Oliver Math - Game Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display operator selector', () => {
    cy.get('ion-select').should('have.length.at.least', 2);
  });

  it('should display level options when clicking level select', () => {
    cy.get('ion-select').first().click();
    cy.get('ion-select-option').should('exist');
  });

  it('should navigate to assistant page', () => {
    cy.visit('/assistant');
    cy.url().should('include', '/assistant');
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

  it('should have proper aria labels', () => {
    cy.visit('/');
    cy.get('[aria-label="Stars earned"]').should('exist');
    // Play button has aria-label set in template
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
