package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.mapper.StudentDtoMapperImpl;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StudentServiceTest {
    private static final Long ID = 1L;
    private static final String EMAIL = "john.doe@mail.com";

    @Mock
    private StudentRepository studentRepository;

    // Le vrai mapper généré par MapStruct : on teste le service avec la conversion réelle
    private final StudentDtoMapper studentDtoMapper = new StudentDtoMapperImpl();

    private StudentService studentService;

    @BeforeEach
    public void setUp() {
        studentService = new StudentService(studentRepository, studentDtoMapper);
    }

    private StudentRequestDTO buildRequest(String email) {
        return new StudentRequestDTO("John", "Doe", email);
    }

    private Student buildStudent(Long id, String email) {
        Student student = new Student();
        student.setId(id);
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setEmail(email);
        return student;
    }

    @Test
    public void test_create_student() {
        // GIVEN
        when(studentRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student toSave = invocation.getArgument(0);
            toSave.setId(ID);
            return toSave;
        });

        // WHEN
        StudentResponseDTO created = studentService.create(buildRequest(EMAIL));

        // THEN : l'étudiant est sauvegardé et renvoyé avec son id
        assertThat(created.getId()).isEqualTo(ID);
        assertThat(created.getEmail()).isEqualTo(EMAIL);
    }

    @Test
    public void test_create_student_with_existing_email_throws_IllegalArgumentException() {
        // GIVEN
        when(studentRepository.existsByEmail(EMAIL)).thenReturn(true);

        // THEN : rien n'est sauvegardé
        assertThrows(IllegalArgumentException.class, () -> studentService.create(buildRequest(EMAIL)));
        verify(studentRepository, never()).save(any());
    }

    @Test
    public void test_create_null_student_throws_IllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> studentService.create(null));
    }

    @Test
    public void test_find_all_students() {
        // GIVEN
        when(studentRepository.findAll()).thenReturn(List.of(buildStudent(1L, EMAIL), buildStudent(2L, "jane@mail.com")));

        // WHEN
        List<StudentResponseDTO> students = studentService.findAll();

        // THEN
        assertThat(students).extracting(StudentResponseDTO::getId).containsExactly(1L, 2L);
    }

    @Test
    public void test_find_student_by_id() {
        // GIVEN
        when(studentRepository.findById(ID)).thenReturn(Optional.of(buildStudent(ID, EMAIL)));

        // WHEN
        StudentResponseDTO student = studentService.findById(ID);

        // THEN
        assertThat(student.getFirstName()).isEqualTo("John");
        assertThat(student.getLastName()).isEqualTo("Doe");
    }

    @Test
    public void test_find_unknown_student_throws_EntityNotFoundException() {
        // GIVEN
        when(studentRepository.findById(ID)).thenReturn(Optional.empty());

        // THEN
        assertThrows(EntityNotFoundException.class, () -> studentService.findById(ID));
    }

    @Test
    public void test_update_student() {
        // GIVEN
        Student existing = buildStudent(ID, EMAIL);
        when(studentRepository.findById(ID)).thenReturn(Optional.of(existing));
        when(studentRepository.existsByEmailAndIdNot("new@mail.com", ID)).thenReturn(false);
        when(studentRepository.save(existing)).thenReturn(existing);
        StudentRequestDTO request = new StudentRequestDTO("Johnny", "Doe", "new@mail.com");

        // WHEN
        StudentResponseDTO updated = studentService.update(ID, request);

        // THEN : les champs sont copiés dans l'entité existante (même id)
        ArgumentCaptor<Student> captor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(ID);
        assertThat(updated.getFirstName()).isEqualTo("Johnny");
        assertThat(updated.getEmail()).isEqualTo("new@mail.com");
    }

    @Test
    public void test_update_student_with_email_of_another_student_throws_IllegalArgumentException() {
        // GIVEN
        when(studentRepository.findById(ID)).thenReturn(Optional.of(buildStudent(ID, EMAIL)));
        when(studentRepository.existsByEmailAndIdNot("taken@mail.com", ID)).thenReturn(true);

        // THEN
        assertThrows(IllegalArgumentException.class,
                () -> studentService.update(ID, buildRequest("taken@mail.com")));
        verify(studentRepository, never()).save(any());
    }

    @Test
    public void test_delete_student() {
        // GIVEN
        Student existing = buildStudent(ID, EMAIL);
        when(studentRepository.findById(ID)).thenReturn(Optional.of(existing));

        // WHEN
        studentService.delete(ID);

        // THEN
        verify(studentRepository).delete(existing);
    }

    @Test
    public void test_delete_unknown_student_throws_EntityNotFoundException() {
        // GIVEN
        when(studentRepository.findById(ID)).thenReturn(Optional.empty());

        // THEN
        assertThrows(EntityNotFoundException.class, () -> studentService.delete(ID));
        verify(studentRepository, never()).delete(any());
    }
}
