import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
    const userId = this.getUserId();
    return this.http.put<void>(`${this.apiUrl}/${userId}/${achievement.Id}`, achievement, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
  
// In achievement.service.ts
searchAchievementsByTag(userId: number, tag: string): Observable<Achievement[]> {
  const searchUrl = `${this.apiUrl}/search?tag=${tag}&userId=${userId}`;
  return this.http.get<Achievement[]>(searchUrl, this.httpOptions)
      .pipe(
          tap(data => console.log('API Response:', data)), // Log the response
          catchError(this.handleError)
      );
}


  deleteAchievement(userId: number, achievementId: number): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${userId}/${achievementId}`)
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

  getUserId(): number | null {
    const id = sessionStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

}
