import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  backendErrors: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.backendErrors = {};
    this.http.post<any>('/api/login', this.loginForm.value).subscribe({
      next: (res) => {
        console.log('Logged in:', res);
        this.authService.setUser({
          fullname: res.fullname,
          profileImageUrl: res.profileImageUrl,
          favorite: res.favorite 
        });
        this.router.navigate(['/search']);
      },
      error: (err) => {
        this.backendErrors = err.error.errors || { general: 'Login failed' };
      }
    });
  }
}
