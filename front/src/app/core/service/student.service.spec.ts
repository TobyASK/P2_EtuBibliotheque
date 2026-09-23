import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentService } from './student.service';
import { Student, StudentRequest } from '../models/Student';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const student: Student = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@mail.com' };
  const request: StudentRequest = { firstName: 'John', lastName: 'Doe', email: 'john@mail.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET the list of students', () => {
    service.getAll().subscribe(students => expect(students).toEqual([student]));

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush([student]);
  });

  it('should POST a new student', () => {
    service.create(request).subscribe(result => expect(result.id).toBe(1));

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(student);
  });

  it('should DELETE a student', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
