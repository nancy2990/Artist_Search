import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  // To store backend validation errors, keyed by field name
  backendErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {
    // Build the registration form with required fields and validators.
    this.registerForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Listen for value changes and clear the corresponding backend error as soon as the user modifies the field.
    this.registerForm.valueChanges.subscribe(() => {
      for (const field in this.backendErrors) {
        if (this.registerForm.get(field)?.dirty) {
          this.backendErrors[field] = '';
        }
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
  
    this.backendErrors = {};
  
    this.http.post<any>('/api/register', this.registerForm.value).subscribe({
      next: (response) => {
        console.log('User registered successfully:', response);
  
        this.authService.setUser({
          fullname: this.registerForm.value.fullname,
          profileImageUrl: response.profileImageUrl,
          favorite: response.favorite 
        });
  
        this.router.navigate(['/search']);
      },
      error: (errorResponse) => {
        this.backendErrors = errorResponse.error.errors;
      }
    });
    }
  
  }

