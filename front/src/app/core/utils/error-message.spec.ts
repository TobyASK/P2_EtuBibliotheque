import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './error-message';

describe('getErrorMessage', () => {
  it('should return the message sent by the server', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: 'Student with email x already exists' } });
    expect(getErrorMessage(error)).toBe('Student with email x already exists');
  });

  it('should explain that the server is unreachable (status 0)', () => {
    expect(getErrorMessage(new HttpErrorResponse({ status: 0 }))).toBe('Le serveur est injoignable.');
  });

  it.each([
    [400, 'Les données envoyées sont invalides.'],
    [401, 'Identifiants invalides ou session expirée.'],
    [404, 'Élément introuvable.'],
    [500, 'Erreur serveur (500).'],
  ])('should return a default message for status %i', (status, expected) => {
    expect(getErrorMessage(new HttpErrorResponse({ status, error: null }))).toBe(expected);
  });

  it('should return a generic message for non HTTP errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('Une erreur inattendue est survenue.');
  });
});
