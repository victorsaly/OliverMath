/// <reference types="cypress" />

// Layout regression tests for phones.
//
// The existing specs only asserted that elements EXIST and are visible, which
// is why a HUD whose wordmark was absolutely centred - and therefore sat on top
// of the buttons on any narrow screen - passed CI while being unusable on a
// real phone. Visibility is not the same as not colliding, so these measure
// actual geometry.

const PHONES = [
  { name: 'iPhone SE / small Android', w: 320, h: 568 },
  { name: 'common Android', w: 360, h: 740 },
  { name: 'iPhone 13 mini', w: 375, h: 812 },
  { name: 'iPhone 14', w: 390, h: 844 },
  { name: 'iPhone 14 Pro Max', w: 430, h: 932 },
];

/** Bounding rect of the first match, or null when the element is absent. */
function rectOf(selector) {
  return cy.window().then((win) => {
    const el = win.document.querySelector(selector);
    return el ? el.getBoundingClientRect() : null;
  });
}

function overlaps(a, b) {
  if (!a || !b) return false;
  return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
}

function dismissIntro() {
  cy.get('body').then(($body) => {
    if ($body.find('.intro-go').length) {
      cy.get('.intro-go').click();
    }
  });
}

PHONES.forEach(({ name, w, h }) => {
  describe(`Mobile layout - ${name} (${w}x${h})`, () => {
    beforeEach(() => {
      cy.viewport(w, h);
      cy.visit('/');
      cy.get('ion-app').should('exist');
      dismissIntro();
    });

    it('hides the wordmark, which cannot fit beside five controls', () => {
      // Computed style, not should('not.be.visible'). The HUD sets
      // pointer-events: none so taps reach the scene behind it, and Cypress
      // tests visibility with elementFromPoint, which skips such elements and
      // returns the canvas underneath - so the visibility assertion passes
      // whether the mark is shown or not, and proves nothing.
      cy.get('.wordmark').should(($el) => {
        expect(getComputedStyle($el[0]).display, 'wordmark display').to.equal('none');
      });
    });

    it('does not overlap the HUD groups with the wordmark', () => {
      rectOf('.hud-left').then((left) => {
        rectOf('.wordmark').then((mark) => {
          rectOf('.hud-right').then((right) => {
            expect(overlaps(left, mark), 'settings/help/sky vs wordmark').to.be.false;
            expect(overlaps(mark, right), 'wordmark vs language/stars').to.be.false;
            expect(overlaps(left, right), 'left group vs right group').to.be.false;
          });
        });
      });
    });

    it('keeps every HUD control inside the viewport', () => {
      cy.window().then((win) => {
        const els = win.document.querySelectorAll('.hud-btn, .hud-stars');
        expect(els.length, 'HUD controls found').to.be.greaterThan(0);
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          expect(r.left, `${el.className} left edge`).to.be.at.least(0);
          expect(r.right, `${el.className} right edge`).to.be.at.most(w);
        });
      });
    });

    it('gives every control a 44px touch target', () => {
      cy.window().then((win) => {
        win.document.querySelectorAll('.hud-btn, .hud-stars, .round-btn').forEach((el) => {
          const r = el.getBoundingClientRect();
          expect(r.height, `${el.className} height`).to.be.at.least(44);
          expect(r.width, `${el.className} width`).to.be.at.least(44);
        });
      });
    });

    it('does not scroll horizontally', () => {
      cy.window().then((win) => {
        expect(win.document.documentElement.scrollWidth).to.be.at.most(w);
      });
    });

    it('does not overlap the dock with the play control', () => {
      rectOf('.status-pill').then((pill) => {
        rectOf('.round-btn').then((btn) => {
          expect(overlaps(pill, btn), 'status pill vs play button').to.be.false;
        });
      });
    });

    it('keeps the dock clear of the HUD', () => {
      rectOf('.hud').then((hud) => {
        rectOf('.dock').then((dock) => {
          expect(overlaps(hud, dock), 'HUD vs dock').to.be.false;
        });
      });
    });
  });
});

describe('Desktop layout', () => {
  it('shows the wordmark when there is room for it', () => {
    cy.viewport(1024, 768);
    cy.visit('/');
    cy.get('ion-app').should('exist');
    dismissIntro();
    cy.get('.wordmark').should(($el) => {
      expect(getComputedStyle($el[0]).display, 'wordmark display').to.not.equal('none');
      expect($el[0].getBoundingClientRect().width, 'wordmark width').to.be.greaterThan(0);
    });
    cy.get('.wordmark').should('contain.text', 'Oliver');
  });
});

describe('Mobile layout - help card', () => {
  PHONES.forEach(({ name, w, h }) => {
    it(`fits the intro card on ${name}`, () => {
      cy.viewport(w, h);
      cy.visit('/');
      cy.get('ion-app').should('exist');

      cy.get('.intro-card').should('be.visible').then(($card) => {
        const r = $card[0].getBoundingClientRect();
        expect(r.left, 'card left edge').to.be.at.least(0);
        expect(r.right, 'card right edge').to.be.at.most(w);
        expect(r.height, 'card height fits the screen').to.be.at.most(h);
      });
    });
  });
});
