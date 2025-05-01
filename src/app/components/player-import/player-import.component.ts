import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-import',
  templateUrl: './player-import.component.html',
  styleUrls: ['./player-import.component.css'],
  standalone: false
})
export class PlayerImportComponent {
  selectedFile: File | null = null;
  isUploading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
  }

  importPlayers(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier XLSX';
      return;
    }

    const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx') {
      this.errorMessage = 'Le fichier doit être au format XLSX';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Démarrage de l\'importation du fichier:', this.selectedFile.name);

    this.playerService.importPlayers(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Réponse d\'importation:', response);
        this.isUploading = false;
        this.successMessage = response && response.count
          ? `${response.count} joueur(s) ont été importés avec succès`
          : 'Les joueurs ont été importés avec succès';
        this.selectedFile = null;
      },
      error: (error) => {
        console.error('Erreur d\'importation détaillée:', error);
        this.isUploading = false;

        if (error.message) {
          this.errorMessage = error.message;
        } else if (typeof error === 'string') {
          this.errorMessage = error;
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'importation des joueurs. Vérifiez le format de votre fichier XLSX.';
        }

        this.errorMessage += ' Assurez-vous que votre fichier contient toutes les colonnes requises (firstName, lastName, position, team, age) et que les valeurs sont valides.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }
}
