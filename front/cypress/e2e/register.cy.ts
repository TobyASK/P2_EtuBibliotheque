describe('Inscription', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it("inscrit l'agent puis redirige vers la page de connexion", () => {
    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');

    cy.get('[data-cy="register-firstName"]').type('John');
    cy.get('[data-cy="register-lastName"]').type('Doe');
    cy.get('[data-cy="register-login"]').type('john');
    cy.get('[data-cy="register-password"]').type('password');
    cy.get('[data-cy="register-submit"]').click();

    cy.wait('@register').its('request.body').should('deep.equal', {
      firstName: 'John', lastName: 'Doe', login: 'john', password: 'password'
    });
    cy.url().should('include', '/login');
  });

});
