import { HttpErrorResponse } from '@angular/common/http';

/**
 * Transforme une erreur HTTP en message lisible pour l'utilisateur.
 * Le back-end renvoie un objet ErrorDetails { message, details } pour les erreurs métier.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Le serveur est injoignable.';
    }
    const serverMessage = error.error?.message;
    if (typeof serverMessage === 'string' && serverMessage.length > 0) {
      return serverMessage;
    }
    switch (error.status) {
      case 400:
        return 'Les données envoyées sont invalides.';
      case 401:
        return 'Identifiants invalides ou session expirée.';
      case 404:
        return 'Élément introuvable.';
      default:
        return `Erreur serveur (${error.status}).`;
    }
  }
  return 'Une erreur inattendue est survenue.';
}
