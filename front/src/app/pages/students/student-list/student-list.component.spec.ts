import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

describe('StudentListComponent', () => {
  let fixture: ComponentFixture<StudentListComponent>;
  let component: StudentListComponent;
  const studentService = { getAll: jest.fn(), delete: jest.fn() };

  const students: Student[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@mail.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@mail.com' },
  ];

  const createComponent = async () => {
    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const query = (selector: string) => fixture.nativeElement.querySelector(selector);

  beforeEach(() => {
    studentService.getAll.mockReset();
    studentService.delete.mockReset();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should display the students returned by the API', async () => {
    studentService.getAll.mockReturnValue(of(students));

    await createComponent();

    expect(fixture.nativeElement.querySelectorAll('[data-cy="student-row"]').length).toBe(2);
    expect(query('[data-cy="student-table"]').textContent).toContain('Smith');
    expect(component.loading).toBe(false);
  });

  it('should not delete when the user cancels', async () => {
    studentService.getAll.mockReturnValue(of(students));
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    await createComponent();

    component.deleteStudent(students[0]);

    expect(studentService.delete).not.toHaveBeenCalled();
  });

  it('should display an error when the API fails', async () => {
    studentService.getAll.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    await createComponent();

    expect(query('[data-cy="list-error"]').textContent).toContain('Une erreur est survenue.');
  });

  it('should delete a student after confirmation', async () => {
    studentService.getAll.mockReturnValue(of(students));
    studentService.delete.mockReturnValue(of(undefined));
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    await createComponent();

    // WHEN
    component.deleteStudent(students[0]);
    fixture.detectChanges();

    // THEN : la ligne disparaît et un message de succès s'affiche
    expect(studentService.delete).toHaveBeenCalledWith(1);
    expect(component.students.map(s => s.id)).toEqual([2]);
    expect(query('[data-cy="list-success"]')).not.toBeNull();
  });

});
