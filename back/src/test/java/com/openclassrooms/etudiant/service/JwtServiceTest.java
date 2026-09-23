package com.openclassrooms.etudiant.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

public class JwtServiceTest {
    // Clé de test encodée en Base64 (>= 32 octets)
    private static final String SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTA=";

    private JwtService jwtService;
    private UserDetails john;

    @BeforeEach
    public void setUp() {
        jwtService = new JwtService(SECRET, 60_000);
        john = User.withUsername("john").password("pwd").build();
    }

    @Test
    public void test_generated_token_contains_username() {
        // WHEN
        String token = jwtService.generateToken(john);

        // THEN : le token est un JWT (3 parties) dont le sujet est le login
        assertThat(token.split("\\.")).hasSize(3);
        assertThat(jwtService.extractUsername(token)).isEqualTo("john");
    }

    @Test
    public void test_malformed_token_is_rejected() {
        // THEN
        assertThat(jwtService.extractUsername("not-a-jwt")).isNull();
    }

}
