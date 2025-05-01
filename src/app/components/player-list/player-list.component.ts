import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '../../models/player';
import { PlayerService } from '../../services/player.service';

interface ApiPlatformResponse {
  'hydra:member'?: Player[];
  member?: Player[];
  [key: string]: any;
}

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css'],
  standalone: false
})
export class PlayerListComponent implements OnInit {
  players: Player[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.getAllPlayers()
      .subscribe({
        next: (data: any) => {
          console.log('Players data received:', data);
          if (data && Array.isArray(data)) {
            this.players = data;
          } else if (data && data["hydra:member"]) {
            this.players = data["hydra:member"];
          } else if (data && (data as ApiPlatformResponse).member) {
            this.players = (data as ApiPlatformResponse).member || [];
          }
          console.log('Players after processing:', this.players);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading players:', error);
          this.errorMessage = 'Une erreur est survenue lors du chargement des joueurs.';
          this.isLoading = false;
        }
      });
  }

  goToAddPlayer(): void {
    this.router.navigate(['/players/new']);
  }

  goToImportPlayers(): void {
    this.router.navigate(['/players/import']);
  }

  viewPlayer(id: number): void {
    this.router.navigate(['/players', id]);
  }

  editPlayer(id: number): void {
    this.router.navigate(['/players', id, 'edit']);
  }

  deletePlayer(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      this.playerService.deletePlayer(id)
        .subscribe({
          next: () => {
            this.loadPlayers();
          },
          error: (error) => {
            console.error('Error deleting player:', error);
            this.errorMessage = 'Une erreur est survenue lors de la suppression du joueur.';
          }
        });
    }
  }
}
