import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Achievement } from '../models/achievement.model';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private apiUrl = 'http://localhost:5176/api/Achievements'; // Replace with your API URL
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getAchievementsByUserId(userId: number): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/user/${userId}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  addAchievement(achievement: Achievement, userId: number): Observable<Achievement> {
    return this.http.post<Achievement>(`http://localhost:5176/api/Achievements?userId=${userId}`, achievement);
  }
  

  updateAchievement(achievement: Achievement): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${achievement.Id}`, achievement, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteAchievement(id: number): Observable<any> {
    return this.http.delete(`http://localhost:5176/api/Achievements/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('Error occurred:', errorMessage);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
