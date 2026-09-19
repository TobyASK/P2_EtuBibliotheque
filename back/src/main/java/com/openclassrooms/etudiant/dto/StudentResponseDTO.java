package com.openclassrooms.etudiant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Données d'un étudiant renvoyées au front.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
