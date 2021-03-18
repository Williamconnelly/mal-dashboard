import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, scan, take, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { ThemeService } from 'src/app/services/theme-service/theme.service';
import { ListNode } from 'src/app/types/mal-types';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  private _destroy$ = new Subject<boolean>();

  public queryResults$ = new BehaviorSubject<ListNode[]>(null);

    // CDK Props

    private batchSize = 20;

    @ViewChild(CdkVirtualScrollViewport, {static: false}) private viewport: CdkVirtualScrollViewport;
  
    private theEnd = false;
  
    private offset = new BehaviorSubject(null);
  
    public infinite: Observable<any[]>;
  
    public rowSize = 77;

    private tempIds = [];

  constructor(
    private _data: DataService,
    private _spinner: NgxSpinnerService,
    private _theme: ThemeService
  ) { 
    this._data.getQueryResults().pipe(
      filter(list => !!list),
      takeUntil(this._destroy$)
    ).subscribe(
      list => {
        console.log('Query Results!', list);
        this.queryResults$.next(list);
        
        // // TEMP
        // // console.log(this.queryResults$.value.filter(node => this.queryResults$.value.filter(n => n.id === node.id).length > 1));
        // const shows: ListNode[] = [];
        // const dupes = [];
        // this.queryResults$.value.forEach(show => {
        //   if (!shows.map(s => s.id).includes(show.id)) {
        //     shows.push(show)
        //   } else {
        //     dupes.push(show);
        //   }
        // });
        // console.log('shows', shows);
        // console.log('dupes', dupes);
        // const sorted = this.queryResults$.value.sort((a, b) => a.id - b.id);
        // console.log(sorted);
        // this._cd.detectChanges();
        this.offset.next(null);
        this.theEnd = false;
        const batchMap = this.offset.pipe(
          mergeMap(n => {
            return this.getBatch(n)
          }),
          scan((acc, batch) => {
            return  [...acc, ...batch ];
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

  ngOnInit() {
    this._data.loadingStatus.exploreLoading$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      loading => {
        loading ? this._spinner.show('listSpinner') : this._spinner.hide('listSpinner');
      }
    )
  }

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
    if (!this.tempIds.includes(lastId)) {
      this.tempIds.push(lastId);
    } else {
      console.warn('LAST ID DUPLICATED', lastId);
      console.log(this.tempIds);
    }
    let arrayAfterIndex: ListNode[];
    if (lastId !== null) {
      const currentIndex = this.queryResults$.value.findIndex(node => node.id === lastId) + 1;
      console.log('``````````` CurrentIndex```````````````', currentIndex);
      arrayAfterIndex = this.queryResults$.value.slice(currentIndex, currentIndex + this.batchSize);
    } else {
      arrayAfterIndex = this.queryResults$.value.slice(0, this.batchSize);
    }
    console.log('lastId', lastId, 'AfterIndex', 'AfterIndex', arrayAfterIndex);
    const arrObs = of(arrayAfterIndex);
    return arrObs.pipe(
      tap(arr => (arr.length ? null : (this.theEnd = true)))
    )
  }

  public getPrimaryColor(): string {
    return this._theme.getActiveTheme().properties['--primary'];
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
