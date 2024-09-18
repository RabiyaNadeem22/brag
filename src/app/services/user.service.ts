import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5176/api/Users'; 

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Create a new user
  createUser(userData: User): Observable<any> {
    const formattedData = {
      name: userData.username,
      email: userData.email,
      password: userData.password,
      industry: userData.industry
    };

    console.log('Creating user with data:', formattedData);
    return this.http.post(`${this.apiUrl}/signup`, formattedData, this.httpOptions);
  }

 // UserService: loginUser method
loginUser(loginData: LoginModel): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, loginData, this.httpOptions).pipe(
    tap((response: any) => {
      if (response && response.userId) { // Adjust according to your API response structure
        this.setUserId(response.userId);
      } else {
        console.error('User ID not found in login response');
      }
    })
  );
}


  // Get user details by ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  // Update user details
  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user, this.httpOptions);
  }

  // Delete a user by ID
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  // Set user ID in session storage
  setUserId(id: number): void {
    sessionStorage.setItem('userId', id.toString());
  }

  // Get user ID from session storage
  getUserId(): number | null {
    const id = sessionStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  // Remove user ID from session storage
  clearUserId(): void {
    sessionStorage.removeItem('userId');
  }
}
