import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../types/sakuga-types';

@Injectable({
  providedIn: 'root'
})
export class SakugaService {

  private readonly baseUrl= 'https://www.sakugabooru.com';
  
  constructor(private _http: HttpClient) {
    
  }

  public getPosts(query: string): Observable<Post[]> {
    const q = this.formatQueryString(query);
    const url = `${this.baseUrl}/post.json?limit=100&tags=${q}`;
    return this._http.get<Post[]>(url);
  }

  private formatQueryString(query: string): string {
    // Replace whitespace with connective '+'
    return query.replace(/ /g, '+');
  }

}
