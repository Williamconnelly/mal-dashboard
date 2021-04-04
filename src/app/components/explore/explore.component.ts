import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, scan, take, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { MALService } from 'src/app/services/mal.service';
import { ThemeService } from 'src/app/services/theme-service/theme.service';
import { ListNode } from 'src/app/types/mal-types';
import { StatusUpdate } from 'src/app/types/media-types';
import { ExpandedContentComponent } from '../expanded-content/expanded-content.component';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  private _destroy$ = new Subject<boolean>();

  public exploreResults$ = new BehaviorSubject<ListNode[]>(null);

    @ViewChildren('expandedContent') expandedContent: QueryList<ExpandedContentComponent>;

    public activeTab: 'search' | 'seasonal' | 'top' = 'search';

    public seasonQuery: string;

    public yearQuery: number;

    public seasonOptions = [
      'Winter',
      'Spring',
      'Summer',
      'Fall'
    ];

    public statusOptions = [
      'Watching',
      'Completed',
      'On Hold',
      'Dropped',
      'Plan to Watch'
    ];

    public scoreOptions = [
      '--',
      '10',
      '9',
      '8',
      '7',
      '6',
      '5',
      '4',
      '3',
      '2',
      '1'
    ];

    public episodeOptions: number[];

    public yearOptions: string[];

    public currentMedia: ListNode;

    public pendingStatusUpdate: StatusUpdate

    @ViewChild('Modal', {static: false}) modal: ElementRef<HTMLElement>;

    @ViewChild('ModalContent', {static: false}) modalContent: ElementRef<HTMLElement>;

    // CDK Props

    private batchSize = 20;

    @ViewChild(CdkVirtualScrollViewport, {static: false}) private viewport: CdkVirtualScrollViewport;
  
    private theEnd = false;
  
    private offset = new BehaviorSubject(null);
  
    public infinite: Observable<any[]>;
  
    public rowSize = 77;

  constructor(
    private _data: DataService,
    private _spinner: NgxSpinnerService,
    private _theme: ThemeService,
    private _mal: MALService
  ) { 
    this._data.getExploreResults().pipe(
      filter(list => !!list),
      takeUntil(this._destroy$)
    ).subscribe(
      list => {
        console.log('Explore Results!', list);
        this.exploreResults$.next(list);
        this.offset.next(null);
        this.theEnd = false;
        const batchMap = this.offset.pipe(
          mergeMap(n => {
            return this.getBatch(n)
          }),
          scan((acc, batch) => {
            return [...acc, ...batch];
          }, [])
        );
  
        this.infinite = batchMap.pipe(map(v => {
          return Object.values(v)
        }));
        
        // Disable Spinner when data recieved
        this.infinite.pipe(
          filter(data => !!data),
          take(1)
        ).subscribe(
          data => {
            if (data) {
              // No longer fetching
              this._data.loadingStatus.exploreLoading$.next(false);
            }
          }
        )
      }, 
      err => {
        console.error(err);
      }
    );
  }

  // Click Listener for closing on external modal clicks
  @HostListener('window:click', ['$event']) onClick(e: MouseEvent) {
    if (this.modalContent) {
      const target = e.target as HTMLElement;
      // Target is not the Modal Content or a child of Modal Content && Was not the preview div opening the modal && currentPost exists
      if (target !== this.modalContent.nativeElement && !target.classList.contains('modal-field') && !this.modalContent.nativeElement.contains(target) && this.currentMedia) {
        this.closeModal();
      }
    }
  }

  ngOnInit() {
    this._data.loadingStatus.exploreLoading$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      loading => {
        loading ? this._spinner.show('listSpinner') : this._spinner.hide('listSpinner');
      }
    );

    const currentSeason = this._data.getCurrentSeason();
    this.seasonQuery = this._data.searchStrings.seasonSearch.value ? this._data.searchStrings.seasonSearch.value.season : currentSeason.season;
    this.yearOptions = [...Array(100)].map((ele, i) => `${currentSeason.year - i}`);
    this.yearQuery = this._data.searchStrings.seasonSearch.value ? this._data.searchStrings.seasonSearch.value.year : currentSeason.year;

    this.activeTab = this._data.activeExplorerTab || 'search';
  }

  public toggleExpandedContent(id: number): void {
    this.expandedContent.toArray().find(c => c.listNode.id === id).toggleExpansion();
  };

   // Virtual Scrolling

   public nextBatch(e, offset) {
    if (this.theEnd) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    if (end === total) {
      this.offset.next(offset);
    }
  }

  public getBatch(lastId: number): Observable<ListNode[]> {
    let arrayAfterIndex: ListNode[];
    if (lastId !== null) {
      const currentIndex = this.exploreResults$.value.findIndex(node => node.id === lastId) + 1;
      arrayAfterIndex = this.exploreResults$.value.slice(currentIndex, currentIndex + this.batchSize);
    } else {
      arrayAfterIndex = this.exploreResults$.value.slice(0, this.batchSize);
    }
    const arrObs = of(arrayAfterIndex);
    return arrObs.pipe(
      tap(arr => (arr.length ? null : (this.theEnd = true)))
    )
  }

  public getPrimaryColor(): string {
    return this._theme.getActiveTheme().properties['--primary'];
  }

  public activateTab(tab: 'search' | 'seasonal' | 'top'): void {
    if (tab !== this.activeTab) {
      this.activeTab = tab;
      this._data.getExploreTabData(tab);
    }
  }

  public seasonChanged(season: string): void {
    this.seasonQuery = season;
  }

  public yearChanged(year: string): void {
    this.yearQuery = parseInt(year, 10);
  }

  public submitSeasonSearch(): void {
    this._data.searchStrings.seasonSearch.next({season: this.seasonQuery, year: this.yearQuery});
    // Use lowercase season for MAL request
    this._mal.getSeasonList(this.seasonQuery.toLowerCase(), this.yearQuery);
    this._data.loadingStatus.exploreLoading$.next(true);
  }

  public getStatusColor(status: string): string {
    switch(status) {
      case('completed'): return 'complete'
      case('watching'): return 'active';
      case('dropped'): return 'dropped';
      case('on_hold'): return 'hold';
      default: return null; 
    }
  }

  public addToList(event: MouseEvent, media: ListNode): void {
    event.stopPropagation();
    if (media) {
      this.currentMedia = media;
    }
  }

  public openModal(event: MouseEvent, media: ListNode): void {
    event.stopPropagation();
    if (media) {
      this.episodeOptions = [...Array(media.num_episodes)].map((ele, i) => i + 1);
      this.episodeOptions.unshift(0);
      this.pendingStatusUpdate = new StatusUpdate();
      this.currentMedia = media;
      this.modal.nativeElement.style.display = 'block';
    }
  }

  public closeModal(): void {
    this.currentMedia = null;
    this.episodeOptions = null;
    this.pendingStatusUpdate = null;
    this.modal.nativeElement.style.display = 'none';
  }

  public updatePendingStatus(property: string, value: any): void {
    this.pendingStatusUpdate[property] = value;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
