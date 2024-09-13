import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  industries: string[] = ['Tech', 'Finance', 'Healthcare', 'Education'];

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      industry: ['', Validators.required],
      profilePicture: [null]
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
      // Handle form submission
      console.log('Form Data:', this.signupForm.value);
      this.router.navigate(['/dashboard']);
    } else {
      // Trigger validation messages
      this.signupForm.markAllAsTouched();
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.signupForm.patchValue({
        profilePicture: file
      });
    }
  }

  get f() {
    return this.signupForm.controls;
  }
}
