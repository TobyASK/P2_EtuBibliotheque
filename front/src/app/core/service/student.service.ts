import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, StudentRequest } from '../models/Student';

const API_URL = '/api/students';

/**
 * Appels aux APIs CRUD des étudiants. Le token est ajouté par authInterceptor.
 */
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(API_URL);
  }

  getById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${API_URL}/${id}`);
  }

  create(student: StudentRequest): Observable<Student> {
    return this.httpClient.post<Student>(API_URL, student);
  }

  update(id: number, student: StudentRequest): Observable<Student> {
    return this.httpClient.put<Student>(`${API_URL}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${API_URL}/${id}`);
  }
}
