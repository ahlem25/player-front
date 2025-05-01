import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { PlayerFormComponent } from './components/player-form/player-form.component';
import { PlayerDetailsComponent } from './components/player-details/player-details.component';
import { PlayerImportComponent } from './components/player-import/player-import.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export function tokenGetter() {
    return localStorage.getItem('auth_token');
}

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        PlayerListComponent,
        PlayerFormComponent,
        PlayerDetailsComponent,
        PlayerImportComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(routes),
        JwtModule.forRoot({
            config: {
                tokenGetter,
                allowedDomains: ['localhost:8000', `${environment.apiUrl}`],
                disallowedRoutes: [`${environment.apiUrl}/api/login_check`]
            }
        })
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { } 