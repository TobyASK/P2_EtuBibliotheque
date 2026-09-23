import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/service/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  const authService = { login: jest.fn() };

  beforeEach(async () => {
    authService.login.mockReset();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  const fillForm = (login: string, password: string) => {
    component.loginForm.setValue({ login, password });
  };

  it('should not call the API when the form is empty', () => {
    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should login and navigate to the students list', () => {
    // GIVEN
    authService.login.mockReturnValue(of({ token: 'jwt-token' }));
    fillForm('john', 'pwd');

    // WHEN
    component.onSubmit();

    // THEN
    expect(authService.login).toHaveBeenCalledWith({ login: 'john', password: 'pwd' });
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
    expect(component.loading).toBe(false);
  });

  it('should display the server error when credentials are invalid', () => {
    // GIVEN
    authService.login.mockReturnValue(throwError(() =>
      new HttpErrorResponse({ status: 401, error: { message: 'Invalid credentials' } })));
    fillForm('john', 'wrong');

    // WHEN
    component.onSubmit();
    fixture.detectChanges();

    // THEN
    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[data-cy="login-error"]').textContent).toContain('Invalid credentials');
  });
});
