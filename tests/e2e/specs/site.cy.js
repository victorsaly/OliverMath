/// <reference types="cypress" />

// The product site sits at the front address; the game is one level down in
// play/ (the Cypress base address). These check the join between the two.
const SITE = 'http://localhost:8100/';

describe('Product site', () => {
  it('explains the game and leads into it', () => {
    cy.visit(SITE);
    cy.get('h1').should('contain.text', 'Maths');
    cy.get('.steps li').should('have.length', 3);
    cy.get('.hero-phone img').should(($img) => {
      expect($img[0].naturalWidth, 'hero screenshot loaded').to.be.greaterThan(0);
    });
    cy.contains('a.button', 'Play in the browser').first().click();
    cy.location('pathname').should('eq', '/play/');
    cy.get('.round-btn.play').should('exist');
  });

  it('links to the pages for parents', () => {
    cy.visit(SITE);
    cy.contains('#parents a', 'Privacy for parents').click();
    cy.location('pathname').should('eq', '/play/privacy.html');
    cy.get('h1').should('contain.text', 'Privacy for parents');
  });

  // The game used to live at the front address, so links like /stats exist.
  it('sends an old link to the same page inside the game', () => {
    cy.visit(SITE + 'stats', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/play/stats');
    cy.get('.star-hero').should('exist');
  });

  it('opens a page inside the game from a direct link', () => {
    cy.visit(SITE + 'play/stats', { failOnStatusCode: false });
    cy.location('pathname').should('eq', '/play/stats');
    cy.get('.star-hero').should('exist');
  });
});
