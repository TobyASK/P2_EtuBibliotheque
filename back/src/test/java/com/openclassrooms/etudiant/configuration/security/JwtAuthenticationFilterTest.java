package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.service.JwtService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {
    private static final String TOKEN = "jwt-token";

    @Mock
    private JwtService jwtService;
    @Mock
    private CustomUserDetailService userDetailService;
    @Mock
    private FilterChain filterChain;
    @InjectMocks
    private JwtAuthenticationFilter filter;

    @AfterEach
    public void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private MockHttpServletRequest requestWithHeader(String header) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        if (header != null) {
            request.addHeader("Authorization", header);
        }
        return request;
    }

    private User buildUser() {
        User user = new User();
        user.setLogin("john");
        return user;
    }

    @Test
    public void test_request_without_token_stays_anonymous() throws Exception {
        // GIVEN
        MockHttpServletRequest request = requestWithHeader(null);
        MockHttpServletResponse response = new MockHttpServletResponse();

        // WHEN
        filter.doFilter(request, response, filterChain);

        // THEN : la requête continue sans authentification
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verify(jwtService, never()).extractUsername(any());
    }

    @Test
    public void test_valid_token_authenticates_user() throws Exception {
        // GIVEN
        User user = buildUser();
        when(jwtService.extractUsername(TOKEN)).thenReturn("john");
        when(userDetailService.loadUserByUsername("john")).thenReturn(user);
        when(jwtService.isTokenValid(TOKEN, user)).thenReturn(true);

        // WHEN
        filter.doFilter(requestWithHeader("Bearer " + TOKEN), new MockHttpServletResponse(), filterChain);

        // THEN
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).isEqualTo(user);
    }

    @Test
    public void test_invalid_token_stays_anonymous() throws Exception {
        // GIVEN
        when(jwtService.extractUsername(TOKEN)).thenReturn(null);

        // WHEN
        filter.doFilter(requestWithHeader("Bearer " + TOKEN), new MockHttpServletResponse(), filterChain);

        // THEN
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailService, never()).loadUserByUsername(any());
    }

    @Test
    public void test_token_not_matching_user_stays_anonymous() throws Exception {
        // GIVEN
        User user = buildUser();
        when(jwtService.extractUsername(TOKEN)).thenReturn("john");
        when(userDetailService.loadUserByUsername("john")).thenReturn(user);
        when(jwtService.isTokenValid(TOKEN, user)).thenReturn(false);

        // WHEN
        filter.doFilter(requestWithHeader("Bearer " + TOKEN), new MockHttpServletResponse(), filterChain);

        // THEN
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    public void test_token_of_deleted_user_stays_anonymous() throws Exception {
        // GIVEN
        when(jwtService.extractUsername(TOKEN)).thenReturn("john");
        when(userDetailService.loadUserByUsername("john")).thenThrow(new UsernameNotFoundException("not found"));

        // WHEN
        filter.doFilter(requestWithHeader("Bearer " + TOKEN), new MockHttpServletResponse(), filterChain);

        // THEN
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    public void test_non_bearer_header_is_ignored() throws Exception {
        // WHEN
        filter.doFilter(requestWithHeader("Basic abc"), new MockHttpServletResponse(), filterChain);

        // THEN
        verify(jwtService, never()).extractUsername(any());
    }
}
