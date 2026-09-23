package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Opérations CRUD sur les étudiants de la bibliothèque.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentDtoMapper studentDtoMapper;

    public StudentResponseDTO create(StudentRequestDTO request) {
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
        Student student = getStudent(id);
        studentDtoMapper.updateEntity(request, student);
        return studentDtoMapper.toDto(studentRepository.save(student));
    }

    public void delete(Long id) {
        studentRepository.delete(getStudent(id));
    }

    private Student getStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student " + id + " not found"));
    }
}
