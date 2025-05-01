import { Routes } from '@angular/router';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { PlayerDetailsComponent } from './components/player-details/player-details.component';
import { PlayerFormComponent } from './components/player-form/player-form.component';
import { PlayerImportComponent } from './components/player-import/player-import.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'players', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'players', component: PlayerListComponent, canActivate: [AuthGuard] },
    { path: 'players/new', component: PlayerFormComponent, canActivate: [AuthGuard] },
    { path: 'players/import', component: PlayerImportComponent, canActivate: [AuthGuard] },
    { path: 'players/:id', component: PlayerDetailsComponent, canActivate: [AuthGuard] },
    { path: 'players/:id/edit', component: PlayerFormComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'players' }
];
