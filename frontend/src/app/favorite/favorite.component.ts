import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, Favorite } from '../services/auth.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  favorites: any[] = [];
  loading = false;

  constructor(private authService: AuthService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFavoritesFromServer();
  }

  loadFavoritesFromServer(): void {
    this.loading = true;
    this.http.get<any[]>('/api/favorite', { withCredentials: true }).subscribe({
      next: (res) => {
        this.favorites = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        this.loading = false;
      }
    });
  }
  removeFavorite(artistId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.http.delete(`/api/favorite/${artistId}`, { withCredentials: true }).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.artistId !== artistId);
        this.authService.removeFavorite(artistId);
      },
      error: (err) => console.error('Error removing favorite:', err)
    });
  }
  goToArtistDetails(artistId: string, event: Event): void {
    event.preventDefault();
    this.router.navigate(['/search'], { queryParams: { artistId: artistId, tab: 'info' } });
  }

  timeSince(dateString: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "");
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "");
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "");
    return seconds + " second" + (seconds !== 1 ? "s" : "");
  }
}
