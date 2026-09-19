package com.openclassrooms.etudiant.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

public class JwtServiceTest {
    // Clé de test encodée en Base64 (>= 32 octets)
    private static final String SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4OTA=";
    private static final String OTHER_SECRET = "YW5vdGhlci1zZWNyZXQta2V5LWZvci11bml0LXRlc3RzLTEyMzQ1Njc4";

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
    public void test_token_is_valid_for_its_owner_only() {
        // GIVEN
        String token = jwtService.generateToken(john);
        UserDetails jane = User.withUsername("jane").password("pwd").build();

        // THEN
        assertThat(jwtService.isTokenValid(token, john)).isTrue();
        assertThat(jwtService.isTokenValid(token, jane)).isFalse();
    }

    @Test
    public void test_malformed_token_is_rejected() {
        // THEN
        assertThat(jwtService.extractUsername("not-a-jwt")).isNull();
        assertThat(jwtService.isTokenValid("not-a-jwt", john)).isFalse();
    }

    @Test
    public void test_token_signed_with_another_key_is_rejected() {
        // GIVEN : token signé par un autre serveur
        String foreignToken = new JwtService(OTHER_SECRET, 60_000).generateToken(john);

        // THEN
        assertThat(jwtService.extractUsername(foreignToken)).isNull();
    }

    @Test
    public void test_expired_token_is_rejected() {
        // GIVEN : durée de validité négative, le token est déjà expiré
        String expiredToken = new JwtService(SECRET, -1_000).generateToken(john);

        // THEN
        assertThat(jwtService.isTokenValid(expiredToken, john)).isFalse();
    }
}
