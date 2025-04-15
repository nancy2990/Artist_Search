import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service'; 
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    public authService: AuthService,
    private http: HttpClient
  ) { }
  
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child && child.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data['title'] || 'Frontend';
      })
    ).subscribe((pageTitle: string) => {
      this.titleService.setTitle(pageTitle);
    });

    this.http.get<any>('/api/me', { withCredentials: true }).subscribe({
      next: (res) => {
        this.authService.setUser({
          fullname: res.fullname,
          profileImageUrl: res.profileImageUrl,
          favorite: res.favorite
        });
      },
      error: (err) => {
        console.log('Not authenticated or expired token');
      }
    });
  }
  
}
