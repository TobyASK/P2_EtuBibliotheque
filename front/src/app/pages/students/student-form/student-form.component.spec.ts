import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentFormComponent } from './student-form.component';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

describe('StudentFormComponent', () => {
  let fixture: ComponentFixture<StudentFormComponent>;
  let component: StudentFormComponent;
  let router: Router;
  const studentService = { getById: jest.fn(), create: jest.fn(), update: jest.fn() };
  const student: Student = { id: 3, firstName: 'John', lastName: 'Doe', email: 'john@mail.com' };

  // id = null => création (/students/new), sinon modification (/students/:id/edit)
  const createComponent = async (id: string | null) => {
    await TestBed.configureTestingModule({
      imports: [StudentFormComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(StudentFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  const fillForm = () => {
    component.studentForm.setValue({ firstName: 'John', lastName: 'Doe', email: 'john@mail.com' });
  };

  beforeEach(() => {
    studentService.getById.mockReset();
    studentService.create.mockReset();
    studentService.update.mockReset();
  });

  describe('creation mode', () => {
    beforeEach(async () => createComponent(null));

    it('should show validation errors and not call the API when the form is invalid', () => {
      component.studentForm.patchValue({ email: 'not-an-email' });

      component.onSubmit();
      fixture.detectChanges();

      expect(studentService.create).not.toHaveBeenCalled();
      expect(fixture.nativeElement.textContent).toContain('Le prénom est obligatoire');
      expect(fixture.nativeElement.textContent).toContain("L'email n'est pas valide");
    });

    it('should create the student and show its detail page', () => {
      studentService.create.mockReturnValue(of(student));
      fillForm();

      component.onSubmit();

      expect(studentService.create).toHaveBeenCalledWith(
        { firstName: 'John', lastName: 'Doe', email: 'john@mail.com' });
      expect(router.navigate).toHaveBeenCalledWith(['/students', 3]);
    });

  });

  describe('edition mode', () => {
    it('should load the student and pre-fill the form', async () => {
      studentService.getById.mockReturnValue(of(student));

      await createComponent('3');

      expect(component.isEdit).toBe(true);
      expect(studentService.getById).toHaveBeenCalledWith(3);
      expect(component.studentForm.value).toEqual(
        { firstName: 'John', lastName: 'Doe', email: 'john@mail.com' });
    });

    it('should update the student', async () => {
      studentService.getById.mockReturnValue(of(student));
      studentService.update.mockReturnValue(of(student));
      await createComponent('3');

      component.studentForm.patchValue({ firstName: 'Johnny' });
      component.onSubmit();

      expect(studentService.update).toHaveBeenCalledWith(3,
        { firstName: 'Johnny', lastName: 'Doe', email: 'john@mail.com' });
      expect(router.navigate).toHaveBeenCalledWith(['/students', 3]);
    });

  });
});
