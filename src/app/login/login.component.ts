import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Handle form submission
      console.log('Form Data:', this.loginForm.value);
      // Simulate an authentication process
      if (this.loginForm.value.email === 'user@example.com' && this.loginForm.value.password === 'password') {
        this.router.navigate(['/dashboard']);
      } else {
        console.error('Invalid email or password');
      }
    } else {
      // Trigger validation messages
      this.loginForm.markAllAsTouched();
    }
  }
  
  get f() {
    return this.loginForm.controls;
  }
}
