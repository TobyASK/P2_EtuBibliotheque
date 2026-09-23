package com.openclassrooms.etudiant.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.StudentRepository;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.etudiant.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration des APIs CRUD des étudiants : controller -> service -> repository -> MySQL.
 */
public class StudentControllerTest extends AbstractIntegrationTest {

    private static final String URL = "/api/students";
    private static final String EMAIL = "john.doe@mail.com";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;

    private String bearerToken;

    @BeforeEach
    public void authenticate() {
        // Un agent de la bibliothèque se connecte pour obtenir un JWT
        User agent = new User();
        agent.setFirstName("Agent");
        agent.setLastName("Bibliotheque");
        agent.setLogin("agent");
        agent.setPassword("password");
        userService.register(agent);
        bearerToken = "Bearer " + userService.login("agent", "password");
    }

    @AfterEach
    public void cleanDatabase() {
        studentRepository.deleteAll();
        userRepository.deleteAll();
    }

    private Student saveStudent(String email) {
        Student student = new Student();
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail(email);
        return studentRepository.save(student);
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    @Test
    public void accessWithoutTokenIsUnauthorized() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void createStudentSuccessful() throws Exception {
        // GIVEN
        StudentRequestDTO request = new StudentRequestDTO("John", "Doe", EMAIL);

        // WHEN / THEN : l'étudiant est créé et renvoyé avec son id
        mockMvc.perform(MockMvcRequestBuilders.post(URL)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken)
                        .content(json(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value(EMAIL));

        assertThat(studentRepository.count()).isEqualTo(1);
    }

    @Test
    public void findAllStudents() throws Exception {
        // GIVEN
        saveStudent(EMAIL);
        saveStudent("jane.doe@mail.com");

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.get(URL)
                        .header(HttpHeaders.AUTHORIZATION, bearerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    public void findUnknownStudentIsNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get(URL + "/999999")
                        .header(HttpHeaders.AUTHORIZATION, bearerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    public void updateStudentSuccessful() throws Exception {
        // GIVEN
        Student student = saveStudent(EMAIL);
        StudentRequestDTO request = new StudentRequestDTO("Johnny", "Doe", "johnny@mail.com");

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.put(URL + "/" + student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearerToken)
                        .content(json(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Johnny"))
                .andExpect(jsonPath("$.email").value("johnny@mail.com"));

        assertThat(studentRepository.findById(student.getId())).get()
                .extracting(Student::getFirstName).isEqualTo("Johnny");
    }

    @Test
    public void deleteStudentSuccessful() throws Exception {
        // GIVEN
        Student student = saveStudent(EMAIL);

        // WHEN / THEN
        mockMvc.perform(MockMvcRequestBuilders.delete(URL + "/" + student.getId())
                        .header(HttpHeaders.AUTHORIZATION, bearerToken))
                .andExpect(status().isNoContent());

        assertThat(studentRepository.existsById(student.getId())).isFalse();
    }

}
