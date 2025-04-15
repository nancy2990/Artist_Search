import { Component, ViewChild } from '@angular/core';
import { CategoriesModalComponent } from '../categories-modal/categories-modal.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  @ViewChild('categoriesModal', { static: false }) categoriesModal!: CategoriesModalComponent;

  handleArtworkSelected(artwork: any): void {
    if (this.categoriesModal) {
      this.categoriesModal.openModal(artwork);
    } else {
      console.error('categoriesModal is undefined');
    }
  }
}
