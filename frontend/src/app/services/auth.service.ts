import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  fullname: string;
  profileImageUrl: string;
  favorite?: Favorite[];
}
export interface Favorite {
  artistId: string;
  addedAt: string; // or Date
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  setUser(user: User) {
    this.userSubject.next(user);
  }

  clearUser() {
    this.userSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isFavorited(artistId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.favorite) return false;
    return currentUser.favorite.some(f => f.artistId === artistId);
  }

  addFavorite(fav: Favorite) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    currentUser.favorite = [fav, ...(currentUser.favorite || [])];
    this.userSubject.next({ ...currentUser });
  }

  removeFavorite(artistId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    currentUser.favorite = currentUser.favorite?.filter(f => f.artistId !== artistId);
    this.userSubject.next({ ...currentUser });
  }
}
