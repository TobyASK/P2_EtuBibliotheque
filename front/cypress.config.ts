import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:4300',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    setupNodeEvents(on, config) {
      // Collecte la couverture de code et génère le rapport à la fin des tests
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
