package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailServiceTest {

    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private CustomUserDetailService customUserDetailService;

    @Test
    public void test_load_existing_user() {
        // GIVEN
        User user = new User();
        user.setLogin("john");
        when(userRepository.findByLogin("john")).thenReturn(Optional.of(user));

        // WHEN
        UserDetails userDetails = customUserDetailService.loadUserByUsername("john");

        // THEN : l'entité User est aussi un UserDetails de Spring Security
        assertThat(userDetails.getUsername()).isEqualTo("john");
        assertThat(userDetails.getAuthorities()).isEmpty();
        assertThat(userDetails.isEnabled()).isTrue();
        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
    }

    @Test
    public void test_load_unknown_user_throws_UsernameNotFoundException() {
        // GIVEN
        when(userRepository.findByLogin("ghost")).thenReturn(Optional.empty());

        // THEN
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailService.loadUserByUsername("ghost"));
    }
}
