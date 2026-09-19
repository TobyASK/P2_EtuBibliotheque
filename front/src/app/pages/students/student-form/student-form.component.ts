import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { MaterialModule } from '../../../shared/material.module';
import { StudentService } from '../../../core/service/student.service';
import { Student, StudentRequest } from '../../../core/models/Student';
import { getErrorMessage } from '../../../core/utils/error-message';

/**
 * Formulaire commun à la création (/students/new) et à la modification (/students/:id/edit).
 */
@Component({
  selector: 'app-student-form',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-form.component.html',
  standalone: true,
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  studentForm: FormGroup = new FormGroup({});
  studentId: number | null = null;
  submitted = false;
  loading = false;
  errorMessage: string | null = null;

  get isEdit(): boolean {
    return this.studentId !== null;
  }

  get form() {
    return this.studentForm.controls;
  }

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId = Number(id);
      this.loadStudent(this.studentId);
    }
  }

  private loadStudent(id: number): void {
    this.loading = true;
    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email
          });
          this.loading = false;
        },
        error: (error: unknown) => {
          this.errorMessage = getErrorMessage(error);
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    if (this.studentForm.invalid) {
      return;
    }
    const request: StudentRequest = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value
    };
    const call$: Observable<Student> = this.studentId !== null
      ? this.studentService.update(this.studentId, request)
      : this.studentService.create(request);

    this.loading = true;
    call$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student: Student) => {
          this.loading = false;
          this.router.navigate(['/students', student.id]);
        },
        error: (error: unknown) => {
          this.loading = false;
          this.errorMessage = getErrorMessage(error);
        }
      });
  }
}
