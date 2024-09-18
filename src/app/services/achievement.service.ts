import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Achievement } from '../models/achievement.model';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private apiUrl = 'https://localhost:5176/api/Achievements';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  addAchievement(achievement: Achievement): Observable<Achievement> {
    return this.http.post<Achievement>(this.apiUrl, achievement, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateAchievement(achievement: Achievement): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${achievement.Id}`, achievement, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteAchievement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getAchievementsByUserId(userId: number): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.apiUrl}/user/${userId}`);
  }
}
