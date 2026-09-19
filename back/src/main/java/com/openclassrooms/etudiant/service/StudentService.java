package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;

/**
 * Opérations CRUD sur les étudiants de la bibliothèque.
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentDtoMapper studentDtoMapper;

    public StudentResponseDTO create(StudentRequestDTO request) {
        Assert.notNull(request, "Student must not be null");
        log.info("Creating new student");
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Student with email " + request.getEmail() + " already exists");
        }
        Student saved = studentRepository.save(studentDtoMapper.toEntity(request));
        return studentDtoMapper.toDto(saved);
    }

    public List<StudentResponseDTO> findAll() {
        return studentDtoMapper.toDtoList(studentRepository.findAll());
    }

    public StudentResponseDTO findById(Long id) {
        return studentDtoMapper.toDto(getStudent(id));
    }

    public StudentResponseDTO update(Long id, StudentRequestDTO request) {
        Assert.notNull(request, "Student must not be null");
        log.info("Updating student {}", id);
        Student student = getStudent(id);
        if (studentRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new IllegalArgumentException("Student with email " + request.getEmail() + " already exists");
        }
        studentDtoMapper.updateEntity(request, student);
        return studentDtoMapper.toDto(studentRepository.save(student));
    }

    public void delete(Long id) {
        log.info("Deleting student {}", id);
        studentRepository.delete(getStudent(id));
    }

    private Student getStudent(Long id) {
        Assert.notNull(id, "Id must not be null");
        return studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student " + id + " not found"));
    }
}
