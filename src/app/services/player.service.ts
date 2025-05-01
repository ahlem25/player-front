import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { Player } from '../models/player';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = `${environment.apiUrl}/api/players`;

  constructor(private http: HttpClient) { }

  getAllPlayers(): Observable<Player[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('API Response:', response);

        if (Array.isArray(response)) {
          return response;
        }

        if (response && response['hydra:member']) {
          return response['hydra:member'];
        }

        if (response && response.member) {
          return response.member;
        }

        for (const key in response) {
          if (Array.isArray(response[key])) {
            return response[key];
          }
        }

        console.warn('Could not extract players array from response:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching players:', error);
        return of([]);
      })
    );
  }

  getPlayer(id: number): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${id}`);
  }

  createPlayer(player: Player): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, player);
  }

  updatePlayer(id: number, player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, player);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importPlayers(file: File, persistInDatabase: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${environment.apiUrl}/api/players/import`;
    const params = persistInDatabase ? '?persistInDatabase=true' : '';

    console.log('Import URL:', url + params, 'Persist in DB:', persistInDatabase);

    return this.http.post<any>(
      url + params,
      formData
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Import error details:', error);

        let errorMessage = 'Une erreur est survenue lors de l\'importation des joueurs';

        if (error.error && error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.error && error.error.title) {
          errorMessage = error.error.title;
        } else if (error.statusText) {
          errorMessage = `Erreur ${error.status}: ${error.statusText}`;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
