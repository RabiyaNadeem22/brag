import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service'; // Import UserService
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar for notifications

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  industries: string[] = ['Tech', 'Finance', 'Healthcare', 'Education'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService, // Inject UserService
    private snackBar: MatSnackBar // Inject MatSnackBar for notifications
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      industry: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      // Prepare user data for submission
      const userData = {
        username: this.signupForm.value.username,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        industry: this.signupForm.value.industry
      };

      // Call the user service to create a new user
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          console.log('User created successfully', response);
          this.snackBar.open('Signup successful!', 'Close', {
            duration: 2000,
          });
          this.router.navigate(['/login']); // Navigate to dashboard after successful signup
        },
        error: (err) => {
          console.error('Error creating user', err);
          this.snackBar.open('Signup failed. Please try again.', 'Close', {
            duration: 2000,
          });
        }
      });
    } else {
      // Trigger validation messages
      this.signupForm.markAllAsTouched();
    }
  }

  get f() {
    return this.signupForm.controls;
  }
}
