import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../../core/service/student.service';
import { Student } from '../../../core/models/Student';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let component: StudentDetailComponent;
  let router: Router;
  const studentService = { getById: jest.fn(), delete: jest.fn() };
  const student: Student = { id: 7, firstName: 'John', lastName: 'Doe', email: 'john@mail.com' };

  const createComponent = async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  };

  const text = (selector: string) => fixture.nativeElement.querySelector(selector)?.textContent;

  beforeEach(() => {
    studentService.getById.mockReset();
    studentService.delete.mockReset();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should load the student from the id in the URL and display it', async () => {
    studentService.getById.mockReturnValue(of(student));

    await createComponent();

    expect(studentService.getById).toHaveBeenCalledWith(7);
    expect(text('[data-cy="detail-lastName"]')).toContain('Doe');
    expect(text('[data-cy="detail-email"]')).toContain('john@mail.com');
  });

  it('should display an error when the student does not exist', async () => {
    studentService.getById.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

    await createComponent();

    expect(text('[data-cy="detail-error"]')).toContain('Une erreur est survenue.');
    expect(fixture.nativeElement.querySelector('[data-cy="student-detail"]')).toBeNull();
  });

  it('should delete the student and go back to the list', async () => {
    studentService.getById.mockReturnValue(of(student));
    studentService.delete.mockReturnValue(of(undefined));
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    await createComponent();

    component.deleteStudent();

    expect(studentService.delete).toHaveBeenCalledWith(7);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

});
