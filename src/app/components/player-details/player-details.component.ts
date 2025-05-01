import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '../../models/player';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-details',
  templateUrl: './player-details.component.html',
  styleUrls: ['./player-details.component.css'],
  standalone: false
})
export class PlayerDetailsComponent implements OnInit {
  player: Player | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPlayer(+id);
      } else {
        this.router.navigate(['/players']);
      }
    });
  }

  loadPlayer(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.getPlayer(id).subscribe({
      next: (player) => {
        this.player = player;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading player:', error);
        this.errorMessage = 'Une erreur est survenue lors du chargement du joueur.';
        this.isLoading = false;
      }
    });
  }

  editPlayer(): void {
    if (this.player) {
      this.router.navigate(['/players', this.player.id, 'edit']);
    }
  }

  deletePlayer(): void {
    if (!this.player) {
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) {
      this.playerService.deletePlayer(this.player.id!).subscribe({
        next: () => {
          this.router.navigate(['/players']);
        },
        error: (error) => {
          console.error('Error deleting player:', error);
          this.errorMessage = 'Une erreur est survenue lors de la suppression du joueur.';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }
}
