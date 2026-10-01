/// <reference types="cypress" />

// The chrome was rebuilt in the 3D redesign: the ion-header toolbar was
// replaced by a floating HUD, the full-width play button by a round control in
// a dock, and the ion-chip status indicator by a purpose-built pill. These
// specs follow the current markup.

describe('Oliver Math - Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('ion-app').should('exist');
    // The first-run help card covers the screen, so dismiss it.
    cy.get('body').then(($body) => {
      if ($body.find('.intro-go').length) {
        cy.get('.intro-go').click();
      }
    });
  });

  it('shows the play control', () => {
    cy.get('.round-btn.play').should('be.visible');
  });

  it('shows the robot stage', () => {
    cy.get('.bot-container').should('exist');
  });

  it('shows the wordmark', () => {
    cy.get('.wordmark').should('contain.text', 'Oliver');
    cy.get('.wordmark').should('contain.text', 'Math');
  });

  it('shows the floating HUD controls', () => {
    cy.get('.hud .hud-btn').should('have.length.at.least', 3);
  });

  it('shows the star counter', () => {
    cy.get('.hud-stars').should('be.visible');
  });

  it('shows the status pill', () => {
    cy.get('.status-pill').should('exist');
  });
});

describe('Oliver Math - Settings', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('ion-app').should('exist');
    cy.get('body').then(($body) => {
      if ($body.find('.intro-go').length) {
        cy.get('.intro-go').click();
      }
    });
  });

  it('opens the settings modal from the HUD', () => {
    cy.get('.hud-btn').first().click();
    cy.get('ion-modal').should('be.visible');
    cy.get('.settings-group').should('have.length.at.least', 1);
  });

  it('offers robot colour swatches', () => {
    cy.get('.hud-btn').first().click();
    cy.get('ion-modal').should('be.visible');
    cy.get('.colour-swatch').should('have.length.at.least', 4);
  });

  it('navigates to stats from the star counter', () => {
    cy.get('.hud-stars').click();
    cy.url().should('include', '/stats');
  });
});

describe('Oliver Math - Help', () => {
  it('can be reopened after it has been dismissed', () => {
    cy.visit('/');
    cy.get('ion-app').should('exist');
    cy.get('body').then(($body) => {
      if ($body.find('.intro-go').length) {
        cy.get('.intro-go').click();
      }
    });
    cy.get('.hud-btn.help').click();
    cy.get('.intro-card').should('be.visible');
    cy.get('.intro-steps li').should('have.length', 3);
  });
});

describe('Oliver Math - Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('ion-app').should('exist');
    cy.get('body').then(($body) => {
      if ($body.find('.intro-go').length) {
        cy.get('.intro-go').click();
      }
    });
  });

  it('has the expected page structure', () => {
    cy.get('ion-content').should('exist');
    cy.get('.hud').should('exist');
    cy.get('.dock').should('exist');
  });

  it('labels every icon-only control', () => {
    cy.get('.hud-btn').each(($el) => {
      cy.wrap($el).should('have.attr', 'aria-label').and('not.be.empty');
    });
  });

  it('does not disable pinch zoom', () => {
    cy.get('meta[name="viewport"]')
      .should('have.attr', 'content')
      .and('not.contain', 'user-scalable=no')
      .and('not.contain', 'maximum-scale');
  });

  it('is usable at phone and tablet widths', () => {
    cy.viewport(375, 667);
    cy.get('.round-btn.play').should('be.visible');

    cy.viewport(768, 1024);
    cy.get('.round-btn.play').should('be.visible');
  });
});
