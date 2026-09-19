describe('Inscription', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('affiche les champs obligatoires quand le formulaire est vide', () => {
    cy.get('[data-cy="register-submit"]').click();

    cy.contains('First Name is required');
    cy.contains('Last Name is required');
    cy.contains('Login is required');
    cy.contains('password is required');
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

  it("affiche l'erreur renvoyée par le serveur", () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 400,
      body: { message: 'User with login john already exists' }
    });

    cy.get('[data-cy="register-firstName"]').type('John');
    cy.get('[data-cy="register-lastName"]').type('Doe');
    cy.get('[data-cy="register-login"]').type('john');
    cy.get('[data-cy="register-password"]').type('password');
    cy.get('[data-cy="register-submit"]').click();

    cy.get('[data-cy="register-error"]').should('contain', 'User with login john already exists');
    cy.url().should('include', '/register');
  });

  it('vide le formulaire avec le bouton Cancel', () => {
    cy.get('[data-cy="register-login"]').type('john');
    cy.contains('button', 'Cancel').click();

    cy.get('[data-cy="register-login"]').should('have.value', '');
  });
});
