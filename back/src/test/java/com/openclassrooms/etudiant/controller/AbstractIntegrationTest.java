package com.openclassrooms.etudiant.controller;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base commune aux tests d'intégration des controllers.
 * Une base MySQL jetable est démarrée dans un container Docker (Testcontainers)
 * et partagée par toutes les classes de test pour accélérer l'exécution.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
public abstract class AbstractIntegrationTest {

    static final MySQLContainer<?> mySQLContainer = new MySQLContainer<>("mysql:latest");

    // Container "singleton" : démarré une seule fois, pour que le contexte Spring mis en cache
    // entre les classes de test pointe toujours vers la même base.
    static {
        if (DockerClientFactory.instance().isDockerAvailable()) {
            mySQLContainer.start();
        }
    }

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mySQLContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mySQLContainer::getUsername);
        registry.add("spring.datasource.password", mySQLContainer::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create");
    }
}
