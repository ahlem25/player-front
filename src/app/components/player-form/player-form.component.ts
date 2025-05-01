import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '../../models/player';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-form',
  templateUrl: './player-form.component.html',
  styleUrls: ['./player-form.component.css'],
  standalone: false
})
export class PlayerFormComponent implements OnInit {
  playerForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  playerId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.playerId = +id;
        this.loadPlayer(this.playerId);
      }
    });
  }

  initForm(): void {
    this.playerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      position: ['', Validators.required],
      team: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(16), Validators.max(50)]]
    });
  }

  get f() { return this.playerForm.controls; }

  loadPlayer(id: number): void {
    this.playerService.getPlayer(id).subscribe({
      next: (player) => {
        this.playerForm.patchValue({
          firstName: player.firstName,
          lastName: player.lastName,
          position: player.position,
          team: player.team,
          age: player.age
        });
      },
      error: (error) => {
        console.error('Error loading player:', error);
        this.errorMessage = 'Une erreur est survenue lors du chargement du joueur.';
        this.router.navigate(['/players']);
      }
    });
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const player: Player = this.playerForm.value;


    if (typeof player.age === 'string') {
      player.age = parseInt(player.age, 10);
    }


    if (this.isEditMode && this.playerId) {
      this.playerService.updatePlayer(this.playerId, player).subscribe({
        next: (response) => {
          this.router.navigate(['/players']);
        },
        error: (error) => {
          console.error('Error updating player:', error);
          this.errorMessage = 'Une erreur est survenue lors de la mise à jour du joueur.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.playerService.createPlayer(player).subscribe({
        next: (response) => {
          this.router.navigate(['/players']);
        },
        error: (error) => {
          console.error('Error creating player:', error);
          this.errorMessage = 'Une erreur est survenue lors de la création du joueur.';
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }
}
