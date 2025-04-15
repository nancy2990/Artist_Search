import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-artist-search',
  templateUrl: './artist-search.component.html',
  styleUrls: ['./artist-search.component.css']
})
export class ArtistSearchComponent implements OnInit {

  artistName: string = '';
  artists: any[] = [];
  searchLoading: boolean = false;
  errorMessage: string = '';

  selectedArtistId: string | null = null;
  artistInfo: any = null;
  artistArtworks: any[] = [];
  activeTab: string = 'info';
  detailsLoading: boolean = false;

  categories: any[] = [];           
  categoriesLoading: boolean = false;
  selectedCategoryId: string | null = null;
  @Output() selectArtwork = new EventEmitter<any>();

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['artistId']) {
        this.selectedArtistId = params['artistId'];
        this.activeTab = params['tab'] || 'info';
        this.loadArtistDetails();
        this.loadSimilarArtistDetails();
      } else {
        this.selectedArtistId = null;
        this.artistInfo = null;
        this.artistArtworks = [];
      }
    });
  }
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.router.navigate([], {
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  searchArtist(): void {
    if (!this.artistName.trim()) return;
    this.searchLoading = true;
    this.errorMessage = '';
    this.http
    .get<any[]>('/api/search', {
      params: { q: this.artistName },
      withCredentials: true
    })
  .subscribe({
        next: (data) => {
          this.searchLoading = false;
          if (data.length === 0) {
            this.errorMessage = 'No results found.';
          } else {
            this.artists = data.map((artist: any) => ({
              artistId: artist.artistId,
              name: artist.name,
              image: artist.image
            }));
          }
        },
        error: () => {
          this.searchLoading = false;
          this.errorMessage = 'Error fetching artist data. Please try again.';
        }
      });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '../../assets/artsy_logo.svg';
  }

  toggleActive(event: any): void {
    const cardElement = event.currentTarget;
    cardElement.classList.toggle('card-active');
  }

  selectArtist(artistId: string): void {
    if (this.selectedArtistId === artistId) {
      return;
    }
    this.selectedArtistId = artistId;
    this.activeTab = 'info';
    this.router.navigate([], {
      queryParams: { artistId: artistId, tab: this.activeTab },
      queryParamsHandling: 'merge'
    });
    this.loadArtistDetails();
  }
  

  loadArtistDetails(): void {
    if (!this.selectedArtistId) return;
    this.detailsLoading = true;
    this.http
  .get<any>(`/api/artist/${this.selectedArtistId}/artworks`, {
    withCredentials: true
  })
      .subscribe({
        next: (data) => {
          this.detailsLoading = false;
          this.artistInfo = data.artistInfo;
          this.artistArtworks = data.artworks;
        },
        error: () => {
          this.detailsLoading = false;
          console.log("loadArtistDetails error");
        }
      });
  }

  clearSearch(): void {
    this.artistName = '';
    this.artists = [];
    this.artistInfo = null;
    this.artistArtworks = [];
    this.errorMessage = '';
    this.selectedArtistId = null;
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true  
    });
  }

  viewCategories(artwork: any): void {
    this.selectedCategoryId = artwork.id;
    this.categoriesLoading = true;
    this.categories = [];
    this.selectArtwork.emit(artwork);
  }

  toggleFavorite(artistId: string, event: Event): void {
    event.stopPropagation();
    if (this.authService.isFavorited(artistId)) {
      this.http.delete(`/api/favorite/${artistId}`, { withCredentials: true })
        .subscribe({
          next: () => {
            this.authService.removeFavorite(artistId);
            this.notificationService.show('Removed from favorites', 'danger');
          },
          error: err => console.error(err)
        });
    } else {
      this.http.post('/api/favorite', { artistId }, { withCredentials: true })
        .subscribe({
          next: () => {
            this.authService.addFavorite({ artistId, addedAt: new Date().toISOString() });
            this.notificationService.show('Added to favorites', 'success');
          },
          error: err => console.error(err)
        });
    }
  }
  similarArtists: any[] = [];
  
  loadSimilarArtistDetails(): void {
    if (!this.selectedArtistId) return;
    this.detailsLoading = true;
  
    this.http
  .get<any>(`/api/artist/${this.selectedArtistId}/artworks`, {
    withCredentials: true
  })
      .subscribe({
        next: (data) => {
          this.detailsLoading = false;
          this.artistInfo = data.artistInfo;
          this.artistArtworks = data.artworks;
  
          if (this.selectedArtistId) {
            this.loadSimilarArtists(this.selectedArtistId);
          }
        },
        error: () => {
          this.detailsLoading = false;
        }
      });
  }
  loadSimilarArtists(artistId: string): void {
    console.log('loadSimilarArtists called with:', artistId);
    this.http.get<any[]>(`/api/artist/${artistId}/similar`)
      .subscribe({
        next: (data) => {
          this.similarArtists = data.map(a => ({
            artistId: a.artistId,
            name: a.name,
            image: a.image
          }));
        },
        error: () => {
          console.error('Failed to load similar artists');
          this.similarArtists = [];
        }
      });
  }
  onSimilarArtistClick(artistId: string): void {
    this.errorMessage = '';
    this.selectedArtistId = artistId;
    this.activeTab = 'info';
  
    this.router.navigate([], {
      queryParams: { artistId, tab: this.activeTab },
      queryParamsHandling: 'merge'
    });
  
    this.loadSimilarArtistDetails();
    
  }
}
