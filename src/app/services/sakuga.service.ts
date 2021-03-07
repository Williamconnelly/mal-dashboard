import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Post } from '../types/sakuga-types';
import { DataService } from './data-service/data-service';

@Injectable({
  providedIn: 'root'
})
export class SakugaService {

  private readonly baseUrl= 'https://www.sakugabooru.com';
  
  private posts$ = new BehaviorSubject<Post[]>(null);

  constructor(private _http: HttpClient) {
    
  }

  public fetchPosts(query: string): void {
    const q = this.formatQueryString(query);
    const url = `${this.baseUrl}/post.json?limit=100&tags=${q}`;
    // return this._http.get<Post[]>(url);
    this._http.get<Post[]>(url).pipe(
      take(1)
    ).subscribe(
      posts => {
        this.posts$.next(posts);
      }, 
      err => {
        console.error('Failed to fetch Posts');
      }
    )
  }

  private formatQueryString(query: string): string {
    // Replace whitespace with connective '+'
    return query.replace(/ /g, '+');
  }

  public getPosts(): Observable<Post[]> {
    return this.posts$;
  }

}
