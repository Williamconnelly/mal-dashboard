import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, filter, map, mergeMap, scan, take, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { DataManagerService } from 'src/app/services/data-service/data-service-manager';
import { MALService } from 'src/app/services/mal.service';
import { ListNode, UserList } from 'src/app/types/mal-types';
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

  public dataSource: DataManagerService;

  // CDK Props

  private batchSize = 20;

  @ViewChild(CdkVirtualScrollViewport, {static: false}) private viewport: CdkVirtualScrollViewport;

  private theEnd = false;

  private  offset = new BehaviorSubject(null);

  public infinite: Observable<any[]>;

  public rowSize = 77;

  constructor(private _data: DataService, private _mal: MALService) {
    this._data.getListData().pipe(
      filter(list => !!list),
      takeUntil(this._destroy$)
    ).subscribe(
      list => {
        // console.log('GOT DATA', list);
        this.list$.next(list);
        this.offset.next(null);
        this.theEnd = false;
        const batchMap = this.offset.pipe(
          // throttleTime(500),
          mergeMap(n => {
            // console.log('get batch', this.getBatch(n));
            return this.getBatch(n)
          }),
          scan((acc, batch) => {
            return  [...acc, ...batch ];
          }, [])
        );
  
        this.infinite = batchMap.pipe(map(v => {
          return Object.values(v)
        }));
        
      }, 
      err => {
        console.error(err);
      }
    )
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {

  }

  public toggleExpandedContent(id: string): void {
    // this.expandedContent.toArray()[].toggleExpansion();
    this.expandedContent.toArray().find(c => c.listNode.id === id).toggleExpansion();
  };

  ngOnDestroy() {
    this._destroy$.next(null);
  };

  // Added

  public nextBatch(e, offset) {
    // console.log(e, offset);
    if (this.theEnd) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();

    if (end === total) {
      this.offset.next(offset);
    }
  }

  public getBatch(lastId: string): Observable<ListNode[]> {
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

}
