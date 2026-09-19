import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';
import { getErrorMessage } from '../../../core/utils/error-message';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-list.component.html',
  standalone: true,
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private destroyRef = inject(DestroyRef);
  students: Student[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.errorMessage = null;
    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: students => {
          this.students = students;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.errorMessage = getErrorMessage(error);
          this.loading = false;
        }
      });
  }

  deleteStudent(student: Student): void {
    if (!confirm(`Supprimer l'étudiant ${student.firstName} ${student.lastName} ?`)) {
      return;
    }
    this.errorMessage = null;
    this.successMessage = null;
    this.studentService.delete(student.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.students = this.students.filter(s => s.id !== student.id);
          this.successMessage = 'Étudiant supprimé.';
        },
        error: (error: unknown) => this.errorMessage = getErrorMessage(error)
      });
  }
}
