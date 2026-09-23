import { HttpErrorResponse } from '@angular/common/http';

/**
 * Message à afficher à l'utilisateur : celui renvoyé par le back-end quand il y en a un,
 * sinon un message générique.
 */
export function getErrorMessage(error: unknown): string {
  const message = error instanceof HttpErrorResponse ? error.error?.message : null;
  return message ?? 'Une erreur est survenue.';
}
