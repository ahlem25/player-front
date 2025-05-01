import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

interface ImportError {
  row: number;
  data: any[];
  error: string;
}

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

  importResults: any = null;
  shouldPersist = false;
  notImportedPlayers: ImportError[] = [];

  columns = ['Prénom', 'Nom', 'Position', 'Équipe', 'Âge'];

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
      this.importResults = null;
      this.notImportedPlayers = [];
    }
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.importResults = null;
    this.notImportedPlayers = [];
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
    this.importResults = null;
    this.notImportedPlayers = [];

    console.log('Début importation, persistInDatabase =', this.shouldPersist);


    this.playerService.importPlayers(this.selectedFile, this.shouldPersist).subscribe({
      next: (response) => {
        console.log('Réponse d\'importation:', response);
        this.isUploading = false;

        if (response && response.success) {
          this.importResults = {
            importedCount: response.importedCount || 0,
            notImportedCount: response.notImportedCount || 0,
            totalRows: response.totalRows || 0
          };

          this.successMessage = response.message ||
            (this.shouldPersist ?
              `${response.importedCount} joueur(s) ont été importés avec succès` :
              `${response.importedCount} joueur(s) ont été validés avec succès`);

          if (response.notImportedPlayers && response.notImportedPlayers.length > 0) {
            this.notImportedPlayers = response.notImportedPlayers;
          }
        } else {
          this.errorMessage = response.message || 'Une erreur inconnue est survenue lors de l\'importation';
        }
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

        this.errorMessage += ' Assurez-vous que votre fichier contient les colonnes requises (Prénom, Nom, Position, Équipe, Âge) et que les valeurs sont valides.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }

  goToPlayerList(): void {
    this.router.navigate(['/players']);
  }
}
