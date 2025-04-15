import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  logout() {
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe(() => {
      this.authService.clearUser();
      this.notificationService.show('Logged out', 'success');
      this.router.navigate(['/search']);
    });
  }
  
  deleteAccount() {
    this.http.delete('/api/delete-account', { withCredentials: true }).subscribe(() => {
      this.authService.clearUser();
      this.notificationService.show('Account deleted', 'danger');
      this.router.navigate(['/search']);
    });
  }
  isFavoriteActive = false;
  onFavoriteClick(event: Event): void {
    this.isFavoriteActive = true;
    event.preventDefault();
    // this.router.navigate(['/favorite']).then(() => {
    //   window.location.reload();
    // });
    this.router.navigate(['/favorite'])
  }
}
