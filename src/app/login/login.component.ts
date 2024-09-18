// src/app/components/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginModel } from '../models/login.model'; // Import the LoginModel

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData: LoginModel = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.userService.loginUser(loginData).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.snackBar.open('Login successful!', 'Close', {
            duration: 2000,
          });
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error logging in', err);
          this.snackBar.open('Login failed. Please check your credentials and try again.', 'Close', {
            duration: 2000,
          });
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  get f() {
    return this.loginForm.controls;
  }
}
