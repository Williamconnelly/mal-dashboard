import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, scan, take, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { ThemeService } from 'src/app/services/theme-service/theme.service';
import { ListNode } from 'src/app/types/mal-types';
import { ExpandedContentComponent } from '../expanded-content/expanded-content.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, AfterViewInit {

  @ViewChildren('expandedContent') expandedContent: QueryList<ExpandedContentComponent>;

  private _destroy$ = new Subject<boolean>();

  public list$ = new BehaviorSubject<ListNode[]>(null);

  // CDK Props

  private batchSize = 20;

  @ViewChild(CdkVirtualScrollViewport, {static: false}) private viewport: CdkVirtualScrollViewport;

  private theEnd = false;

  private offset = new BehaviorSubject(null);

  public infinite: Observable<any[]>;

  public rowSize = 77;

  constructor(
    private _data: DataService, 
    private _cd: ChangeDetectorRef,
    private _spinner: NgxSpinnerService,
    private _theme: ThemeService
  ) {
    this._data.getListData().pipe(
      filter(list => !!list),
      takeUntil(this._destroy$)
    ).subscribe(
      list => {
        this.list$.next(list);
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
              this._data.loadingStatus.listLoading$.next(false);
              // this._spinner.hide('listSpinner');
            }
          }
        )
      }, 
      err => {
        console.error(err);
      }
    )
  }

  ngOnInit() {
    this._data.loadingStatus.listLoading$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      loading => {
        loading ? this._spinner.show('listSpinner') : this._spinner.hide('listSpinner');
      }
    )

    this._data.loadingStatus.listLoading$.next(true);
  }

  ngAfterViewInit() {

  }

  public toggleExpandedContent(id: number): void {
    // this.expandedContent.toArray()[].toggleExpansion();
    this.expandedContent.toArray().find(c => c.listNode.id === id).toggleExpansion();
  };

  ngOnDestroy() {
    this._destroy$.next(null);
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
      const currentIndex = this.list$.value.findIndex(node => node.id === lastId) + 1;
      arrayAfterIndex = this.list$.value.slice(currentIndex, currentIndex + this.batchSize);
    } else {
      arrayAfterIndex = this.list$.value.slice(0, this.batchSize);
    }
    const arrObs = of(arrayAfterIndex);
    return arrObs.pipe(
      tap(arr => (arr.length ? null : (this.theEnd = true)))
    )
  }

  public getPrimaryColor(): string {
    return this._theme.getActiveTheme().properties['--primary'];
  }

}
