import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { provideRouter, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { UserService } from '../../core/service/user.service';
import { UserMockService } from '../../core/service/user-mock.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: UserMockService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useClass: UserMockService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as unknown as UserMockService;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  const fillForm = () => {
    component.registerForm.setValue({ firstName: 'John', lastName: 'Doe', login: 'john', password: 'pwd' });
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call the API when required fields are missing', () => {
    const spy = jest.spyOn(userService, 'register');

    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should register the user and redirect to the login page', () => {
    // GIVEN
    const spy = jest.spyOn(userService, 'register');
    fillForm();

    // WHEN
    component.onSubmit();

    // THEN
    expect(spy).toHaveBeenCalledWith({ firstName: 'John', lastName: 'Doe', login: 'john', password: 'pwd' });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

});
