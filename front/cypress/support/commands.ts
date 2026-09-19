declare global {
  namespace Cypress {
    interface Chainable {
      /** Ouvre une page en étant déjà connecté (token JWT présent dans le localStorage). */
      visitAsLoggedIn(url: string): Chainable<AUTWindow>;
    }
  }
}

Cypress.Commands.add('visitAsLoggedIn', (url: string) => {
  return cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('etudiant.token', 'fake-jwt-token');
    },
  });
});

export {};
