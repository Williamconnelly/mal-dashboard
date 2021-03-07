import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { SakugaService } from 'src/app/services/sakuga.service';
import { Post } from 'src/app/types/sakuga-types';

@Component({
  selector: 'app-sakuga',
  templateUrl: './sakuga.component.html',
  styleUrls: ['./sakuga.component.css']
})
export class SakugaComponent implements OnInit, OnDestroy {

  @Input() embedded = false;

  public posts$ = new BehaviorSubject<Post[]>(null);

  private _destroy$ = new Subject<boolean>();

  public currentPost: Post;

  @ViewChild('Modal', {static: false}) modal: ElementRef<HTMLElement>;

  @ViewChild('SakugaContainer', {static: false}) sakugaContainer: ElementRef<HTMLElement>;

  constructor(private _sakuga: SakugaService, private _data: DataService) {
    this._sakuga.getPosts().pipe(
      filter(posts => !!posts),
      takeUntil(this._destroy$)
    ).subscribe(
      posts => {
        console.log('Got Sakuga', posts);
        this.posts$.next(posts);
      },
      err => {
        console.error('Failed to fetch Sakuga', err);
      }
    )

  }

  ngOnInit() {

  }

  public getSourceDisplay(source: string): string {
    return (['op','ed','http','pv'].some(src => source.toLowerCase().includes(src))) ? 'Source' : 'Episode';
  }

  public previousPage(): void {

  }

  public nextPage(): void {

  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public openModal(post: Post): void {
    this.currentPost = post;
    this.modal.nativeElement.style.display = 'block';
  }

  public closeModal(): void {
    this.currentPost = null;
    this.modal.nativeElement.style.display = 'none';
  }

  public getTags(post: Post): string[] {
    return post.tags.split(' ');
  }

  public selectTag(tag: string): void {
    this._data.searchStrings.sakugaSearch.next(tag);
    this._sakuga.fetchPosts(tag);
    this.closeModal();
    this.sakugaContainer.nativeElement.scrollTo(0, 0);
  }

}
