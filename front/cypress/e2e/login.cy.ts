describe('Connexion', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('connecte l\'agent, stocke le token et affiche la liste des étudiants', () => {
    cy.intercept('POST', '/api/login', { body: { token: 'fake-jwt-token' } }).as('login');
    cy.intercept('GET', '/api/students', { body: [] }).as('students');

    cy.get('[data-cy="login-input"]').type('john');
    cy.get('[data-cy="password-input"]').type('password');
    cy.get('[data-cy="login-submit"]').click();

    cy.wait('@login').its('request.body').should('deep.equal', { login: 'john', password: 'password' });
    cy.url().should('include', '/students');
    // Le token est envoyé dans le header des appels suivants
    cy.wait('@students').its('request.headers.authorization').should('equal', 'Bearer fake-jwt-token');
  });

  it('affiche une erreur quand les identifiants sont invalides', () => {
    cy.intercept('POST', '/api/login', { statusCode: 401, body: { message: 'Invalid credentials' } });

    cy.get('[data-cy="login-input"]').type('john');
    cy.get('[data-cy="password-input"]').type('wrong');
    cy.get('[data-cy="login-submit"]').click();

    cy.get('[data-cy="login-error"]').should('contain', 'Invalid credentials');
    cy.url().should('include', '/login');
  });

  it('redirige vers la connexion quand on accède aux étudiants sans être connecté', () => {
    cy.visit('/students');

    cy.url().should('include', '/login');
  });
});
