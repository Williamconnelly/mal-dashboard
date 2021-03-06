import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { SakugaService } from 'src/app/services/sakuga.service';
import { ThemeService } from 'src/app/services/theme-service/theme.service';
import { Post, Tag } from 'src/app/types/sakuga-types';

@Component({
  selector: 'app-sakuga',
  templateUrl: './sakuga.component.html',
  styleUrls: ['./sakuga.component.css']
})
export class SakugaComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() embedded = false;

  public posts$ = new BehaviorSubject<Post[]>(null);

  private _destroy$ = new Subject<boolean>();

  public currentPost: Post;

  public currentTags$ = new BehaviorSubject<Tag[]>(null);

  @ViewChild('Modal', {static: false}) modal: ElementRef<HTMLElement>;

  @ViewChild('ModalContent', {static: false}) modalContent: ElementRef<HTMLElement>;

  @ViewChild('SakugaContainer', {static: false}) sakugaContainer: ElementRef<HTMLElement>;

  public tagsLoading: boolean;

  public sakugaLoading: boolean;

  public currentPage: number;

  constructor(
    private _sakuga: SakugaService, 
    private _data: DataService, 
    private _renderer: Renderer2, 
    private _theme: ThemeService, 
    private _spinner: NgxSpinnerService
  ) {
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
    );

    this._sakuga.currentPage$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      pageNumber => this.currentPage = pageNumber
    );

    this._data.loadingStatus.sakugaLoading$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      loading => {
        this.sakugaLoading = loading;
        loading ? this._spinner.show('sakugaSpinner') : this._spinner.hide('sakugaSpinner');
      }
    );

    this._data.loadingStatus.tagLoading$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      loading => {
        this.tagsLoading = loading;
        loading ? this._spinner.show('tagSpinner') : this._spinner.hide('tagSpinner')
      }
    );

  }

  ngOnInit() {
    
  }

  // Click Listener for closing on external modal clicks
  @HostListener('window:click', ['$event']) onClick(e: MouseEvent) {
    if (this.modalContent) {
      const target = e.target as HTMLElement;
      // Target is not the Modal Content or a child of Modal Content && Was not the preview div opening the modal && currentPost exists
      if (target !== this.modalContent.nativeElement && !target.classList.contains('modal-field') && !this.modalContent.nativeElement.contains(target) && this.currentPost) {
        this.closeModal();
      }
    }
  }

  ngAfterViewInit() {

  }
  
  public getSourceDisplay(source: string): string {
    return (['op','ed','http','pv'].some(src => source.toLowerCase().includes(src))) ? 'Source' : 'Episode';
  }

  public changePage(change: boolean): void {
    this._sakuga.changePage(change);
    this.sakugaContainer.nativeElement.scrollTo(0, 0);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public openModal(post: Post): void {
    this._data.loadingStatus.tagLoading$.next(true);
    this._sakuga.fetchTags(post.tags.split(' ')).pipe(
      take(1)
    ).subscribe(
      tags => {
        this._data.loadingStatus.tagLoading$.next(false);
        console.log('Got Tags', tags);
        this.currentTags$.next(tags);
      },
      err => {
        console.error('Failed to set current tags', err);
      }
    )
    this.currentPost = post;
    this.modal.nativeElement.style.display = 'block';
  }

  public closeModal(): void {
    this.currentPost = null;
    this.currentTags$.next(null);
    this.modal.nativeElement.style.display = 'none';
  }

  public selectTag(tag: string): void {
    this._data.searchStrings.sakugaSearch.next(tag);
    this._sakuga.fetchPosts(tag);
    this.closeModal();
    this.sakugaContainer.nativeElement.scrollTo(0, 0);
  }

  public canPlay(post: Post): boolean {
    const split = post.file_url.split('.')
    const fileType = split[split.length - 1]
    return !['png','jpg','gif'].includes(fileType);
  }

  public getTagClass(type: number): string {
    switch(type) {
      case(0): return 'general'; break; // General Tag
      case(1): return 'artist'; break; // Artist Tag
      case(3): return 'copyright'; break // Show Title Tag
      case(4): return 'terminology'; break; // Sakuga Term
      default: return 'general'; break;
    }
  }

  public getPrimaryColor(): string {
    return this._theme.getActiveTheme().properties['--primary'];
  }

}
