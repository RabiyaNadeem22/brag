
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model'
import { LoginModel } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5176/api/Users'; 

  // Optional: set headers if needed (e.g., for authentication)
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer your-token' // Uncomment if using tokens
    })
  };

  constructor(private http: HttpClient) { }

  // Method to create a new user
  createUser(userData: User): Observable<any> {
    const formattedData = {
      name: userData.username, // Map 'username' to 'name'
      email: userData.email,
      password: userData.password,
      industry: userData.industry
    };
  
    console.log(formattedData); // Log the formatted data to check before sending
    return this.http.post(`${this.apiUrl}/signup`, formattedData, this.httpOptions);

  }

  
  loginUser(loginData: LoginModel): Observable<any> { // Use LoginModel here
    return this.http.post(`${this.apiUrl}/login`, loginData, this.httpOptions);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, this.httpOptions);
  }
  
  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user, this.httpOptions);
  }
  
  // Method to delete a user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions);
  }
}
