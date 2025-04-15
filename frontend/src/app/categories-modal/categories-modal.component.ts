import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var bootstrap: any; 

@Component({
  selector: 'app-categories-modal',
  templateUrl: './categories-modal.component.html',
  styleUrls: ['./categories-modal.component.css']
})
export class CategoriesModalComponent {
  selectedArtwork: any;
  categories: any[] = [];
  categoriesLoading = false;

  constructor(private http: HttpClient) {}

  openModal(artwork: any): void {
    this.selectedArtwork = artwork;
    
    console.log('openModal called with artwork:', artwork.id); 
    this.loadCategories(artwork.id);
  
    setTimeout(() => {
      const modalElement = document.getElementById('categoriesModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else {
        console.error('Modal element not found');
      }
    }, 100); 
  }

  loadCategories(artworkId: string): void {
    this.categoriesLoading = true;
    this.categories = [];
    this.http
  .get<any>('/api/genes', {
    params: { artwork_id: artworkId },
    withCredentials: true
  })
      .subscribe({
        next: (response) => {
          this.categoriesLoading = false;
          if (response?._embedded?.genes) {
            this.categories = response._embedded.genes.map((gene: any) => ({
              name: gene.name,
              thumbnail: gene._links?.thumbnail?.href
            }));
          }
        },
        error: (err) => {
          this.categoriesLoading = false;
          console.error('Error loading categories:', err);
        }
      });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '../../assets/artsy_logo.svg';
  }
}
