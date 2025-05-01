import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { Player } from '../models/player';
import { environment } from '../../environments/environment';

interface ApiPlatformResponse {
  'hydra:member'?: Player[];
  member?: Player[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = `${environment.apiUrl}/api/players`;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json, application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getAllPlayers(): Observable<Player[]> {
    console.log('Getting all players with options:', this.httpOptions);
    return this.http.get<any>(this.apiUrl, this.httpOptions).pipe(
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
    return this.http.get<Player>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  createPlayer(player: Player): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, player, this.httpOptions);
  }

  updatePlayer(id: number, player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${id}`, player, this.httpOptions);
  }

  deletePlayer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions);
  }

  importPlayers(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);

    const uploadOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json, application/ld+json'
      })
    };

    return this.http.post<any>(`${environment.apiUrl}/api/players/import`, formData, uploadOptions)
      .pipe(
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
