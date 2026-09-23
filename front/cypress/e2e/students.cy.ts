const students = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@mail.com' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@mail.com' },
];

describe('Gestion des étudiants', () => {
  describe('Liste', () => {
    it('affiche les étudiants', () => {
      cy.intercept('GET', '/api/students', { body: students });

      cy.visitAsLoggedIn('/students');

      cy.get('[data-cy="student-row"]').should('have.length', 2);
      cy.get('[data-cy="student-table"]').should('contain', 'Smith').and('contain', 'john@mail.com');
    });

    it("affiche un message quand il n'y a aucun étudiant", () => {
      cy.intercept('GET', '/api/students', { body: [] });

      cy.visitAsLoggedIn('/students');

      cy.get('[data-cy="list-empty"]').should('be.visible');
    });

    it('affiche une erreur quand le serveur ne répond pas correctement', () => {
      cy.intercept('GET', '/api/students', { statusCode: 500, body: {} });

      cy.visitAsLoggedIn('/students');

      cy.get('[data-cy="list-error"]').should('contain', 'Une erreur est survenue.');
    });

    it('supprime un étudiant', () => {
      cy.intercept('GET', '/api/students', { body: students });
      cy.intercept('DELETE', '/api/students/1', { statusCode: 204 }).as('delete');

      cy.visitAsLoggedIn('/students');
      cy.get('[data-cy="delete-student"]').first().click();

      cy.wait('@delete');
      cy.get('[data-cy="student-row"]').should('have.length', 1);
      cy.get('[data-cy="list-success"]').should('contain', 'Étudiant supprimé.');
    });
  });

  describe('Création', () => {
    it('affiche les erreurs de validation', () => {
      cy.visitAsLoggedIn('/students/new');

      cy.get('[data-cy="email-input"]').type('pas-un-email');
      cy.get('[data-cy="form-submit"]').click();

      cy.contains('Le prénom est obligatoire');
      cy.contains("L'email n'est pas valide");
    });

    it("crée un étudiant depuis la liste puis affiche son détail", () => {
      cy.intercept('GET', '/api/students', { body: [] });
      cy.intercept('POST', '/api/students', { statusCode: 201, body: students[0] }).as('create');
      cy.intercept('GET', '/api/students/1', { body: students[0] });

      cy.visitAsLoggedIn('/students');
      cy.get('[data-cy="add-student"]').click();
      cy.get('[data-cy="form-title"]').should('contain', 'Ajouter un étudiant');
      cy.get('[data-cy="firstName-input"]').type('John');
      cy.get('[data-cy="lastName-input"]').type('Doe');
      cy.get('[data-cy="email-input"]').type('john@mail.com');
      cy.get('[data-cy="form-submit"]').click();

      cy.wait('@create').its('request.body').should('deep.equal', {
        firstName: 'John', lastName: 'Doe', email: 'john@mail.com'
      });
      cy.url().should('match', /\/students\/1$/);
      cy.get('[data-cy="detail-email"]').should('contain', 'john@mail.com');
    });

  });

  describe('Détail', () => {
    it("affiche les informations de l'étudiant", () => {
      cy.intercept('GET', '/api/students/2', { body: students[1] });

      cy.visitAsLoggedIn('/students/2');

      cy.get('[data-cy="detail-lastName"]').should('contain', 'Smith');
      cy.get('[data-cy="detail-firstName"]').should('contain', 'Jane');
      cy.get('[data-cy="detail-email"]').should('contain', 'jane@mail.com');
    });

    it('supprime l\'étudiant et revient à la liste', () => {
      cy.intercept('GET', '/api/students/2', { body: students[1] });
      cy.intercept('DELETE', '/api/students/2', { statusCode: 204 }).as('delete');
      cy.intercept('GET', '/api/students', { body: [students[0]] });

      cy.visitAsLoggedIn('/students/2');
      cy.get('[data-cy="detail-delete"]').click();

      cy.wait('@delete');
      cy.url().should('match', /\/students$/);
      cy.get('[data-cy="student-row"]').should('have.length', 1);
    });
  });

  describe('Modification', () => {
    it("pré-remplit le formulaire et enregistre les modifications", () => {
      cy.intercept('GET', '/api/students/1', { body: students[0] });
      cy.intercept('PUT', '/api/students/1', { body: { ...students[0], firstName: 'Johnny' } }).as('update');

      cy.visitAsLoggedIn('/students/1');
      cy.get('[data-cy="detail-edit"]').click();

      cy.get('[data-cy="form-title"]').should('contain', "Modifier l'étudiant");
      cy.get('[data-cy="firstName-input"]').should('have.value', 'John').clear().type('Johnny');
      cy.get('[data-cy="form-submit"]').click();

      cy.wait('@update').its('request.body.firstName').should('equal', 'Johnny');
      cy.url().should('match', /\/students\/1$/);
    });

  });
});
