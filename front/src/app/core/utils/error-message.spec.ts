import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './error-message';

describe('getErrorMessage', () => {
  it('should return the message sent by the server', () => {
    const error = new HttpErrorResponse({ status: 400, error: { message: 'Invalid credentials' } });
    expect(getErrorMessage(error)).toBe('Invalid credentials');
  });

  it('should return a generic message when the server sends none', () => {
    expect(getErrorMessage(new HttpErrorResponse({ status: 500, error: null }))).toBe('Une erreur est survenue.');
    expect(getErrorMessage(new Error('boom'))).toBe('Une erreur est survenue.');
  });
});
