/** Étudiant renvoyé par l'API (StudentResponseDTO côté back-end). */
export interface Student {
  id: number,
  firstName: string,
  lastName: string,
  email: string
}

/** Données envoyées à l'API pour créer ou modifier un étudiant (StudentRequestDTO côté back-end). */
export interface StudentRequest {
  firstName: string,
  lastName: string,
  email: string
}
