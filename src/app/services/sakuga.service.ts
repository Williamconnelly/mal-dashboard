import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeStamp } from 'console';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { Post, Tag } from '../types/sakuga-types';
import { DataService } from './data-service/data-service';

@Injectable({
  providedIn: 'root'
})
export class SakugaService {

  private readonly baseUrl= 'https://www.sakugabooru.com';

  private posts = new Map<number, Post[]>();

  private display$ = new BehaviorSubject<Post[]>(null);

  public pageSize = 100;

  public currentPage$ = new BehaviorSubject<number>(1);
  
  private fetchedPages: number;

  constructor(private _http: HttpClient, private _data: DataService) {

  }

  public fetchPosts(query: string, page?: number): void {
    console.log('FETCHING')
    const q = this.formatQueryString(query);
    const url = `${this.baseUrl}/post.json?limit=${this.pageSize}&tags=${q}${page ? `&page=${page}` : ''}`;
    this._http.get<Post[]>(url).pipe(
      take(1)
    ).subscribe(
      posts => {
        if (page) {
          this.posts.set(page, posts);
          this.fetchedPages = page;
        } else {
          // Reset Pages
          this.fetchedPages = 1;
          this.currentPage$.next(1);
          this.posts.clear();
          // Update List
          this.posts.set(1, posts);
          // Update Display
          this.display$.next(posts);
          // Prepare Offset Page
          this.fetchPosts(query, 2);
        }
      }, 
      err => {
        console.error('Failed to fetch Posts', err);
      }
    )
  }

  public fetchTag(tag: string): Observable<Tag> {
    const url = `${this.baseUrl}/tag.json?name=${tag}`;
    return this._http.get<any>(url).pipe(
      take(1)
    );
  }

  public fetchTags(tags: string[]): Observable<Tag[]> {
    const requests = tags.map(tag => this._http.get<Tag[]>(`${this.baseUrl}/tag.json?name=${tag}&order=count`));
    return forkJoin(requests).pipe(
      map(allTags => {
        // Flatten matrix of tags
        const tagsArray: Tag[] = [].concat(...allTags);
        // Find exact tag from results
        return tags.map(tag => tagsArray.find(resultTag => resultTag.name === tag));
      })
    );
  }

  private formatQueryString(query: string): string {
    // Replace whitespace with connective '+'
    return query.replace(/ /g, '+');
  }

  public getPosts(): Observable<Post[]> {
    return this.display$;
  }

  public changePage(change: boolean): void {
    // Update current page depending on next or previous change
    this.currentPage$.next(change ? this.currentPage$.value + 1 : this.currentPage$.value - 1);
    const page = this.currentPage$.value;
    // Check if page is in map
    if (this.posts.has(page)) {
      // Check if additional page needs to be fetched
      if (page === this.fetchedPages) {
        this.fetchPosts(this._data.searchStrings.sakugaSearch.value, page + 1);
      }
      this.display$.next(this.posts.get(page));
    } else {
      console.error('Invalid Page', page);
    }
  }

}
