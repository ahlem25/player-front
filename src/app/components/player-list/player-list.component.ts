import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { Player } from '../../models/player';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css'],
  standalone: false
})
export class PlayerListComponent implements OnInit, OnDestroy {
  allPlayers: Player[] = []; 
  filteredPlayers: Player[] = []; 
  displayedPlayers: Player[] = []; 

  isLoading = false;
  errorMessage = '';

 
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  searchTerm = '';
  searchTermChanged = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchSubscription = this.searchTermChanged.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterPlayers();
    });

    this.loadPlayers();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadPlayers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.playerService.getAllPlayers()
      .subscribe({
        next: (players) => {
          this.allPlayers = players;
          this.filterPlayers();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading players:', error);
          this.errorMessage = 'Une erreur est survenue lors du chargement des joueurs.';
          this.isLoading = false;
        }
      });
  }

  filterPlayers(): void {
    this.currentPage = 1;

    if (!this.searchTerm) {
      this.filteredPlayers = [...this.allPlayers];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPlayers = this.allPlayers.filter(player =>
        (player.firstName?.toLowerCase().includes(term)) ||
        (player.lastName?.toLowerCase().includes(term)) ||
        (player.position?.toLowerCase().includes(term)) ||
        (player.team?.toLowerCase().includes(term)) ||
        (player.age?.toString().includes(term))
      );
    }

    this.totalItems = this.filteredPlayers.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedPlayers();
  }

  updateDisplayedPlayers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredPlayers.length);
    this.displayedPlayers = this.filteredPlayers.slice(startIndex, endIndex);
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTermChanged.next(term);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchTermChanged.next('');
  }

  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPlayers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedPlayers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPlayers();
    }
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
