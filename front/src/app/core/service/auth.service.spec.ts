import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should not be logged in by default', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should call /api/login and store the token', () => {
    // WHEN
    service.login({ login: 'john', password: 'pwd' }).subscribe(response => {
      expect(response.token).toBe('jwt-token');
    });

    // THEN : un POST est envoyé avec les identifiants
    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ login: 'john', password: 'pwd' });
    req.flush({ token: 'jwt-token' });

    expect(service.getToken()).toBe('jwt-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should remove the token on logout', () => {
    localStorage.setItem('etudiant.token', 'jwt-token');

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
  });
});
