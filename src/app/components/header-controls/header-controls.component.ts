import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';
import { IPCService } from 'src/app/services/ipc.service';
import { SakugaService } from 'src/app/services/sakuga.service';

@Component({
  selector: 'app-header-controls',
  templateUrl: './header-controls.component.html',
  styleUrls: ['./header-controls.component.css']
})
export class HeaderControlsComponent implements OnInit, OnDestroy {

  private searchString$ = new Subject<string>();

  private submitString$ = new Subject<string>();

  public searchString = '';

  private _destroy$ = new Subject<boolean>();

  constructor(private _data: DataService, private _router: Router, private _ipc: IPCService, private _sakuga: SakugaService) {
    this.searchString$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(
      search => {
        this._data.filterListByName(search);
      }
    );

    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._destroy$)
    ).subscribe(
      (nav: NavigationEnd) => {
        // Set Searchbar to cached search string
        if (nav.url === '/list') {
          this.searchString = this._data.searchStrings.listSearch.value;
        } else if (nav.url === '/sakuga') {
          this.searchString = this._data.searchStrings.sakugaSearch.value;
        } else if (nav.url === '/explore') {
          this.searchString = this._data.searchStrings.exploreSearch.value;
        }
      },
      err => {
        console.error('Could not get route');
      }
    );

    this._data.searchStrings.listSearch.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      search => {
        if (this._router.url === '/list') {
          this.searchString = search;
        }
      }
    );

    this._data.searchStrings.sakugaSearch.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      search => {
        if (this._router.url === '/sakuga') {
          this.searchString = search;
        }
      }
    );

    this._data.searchStrings.exploreSearch.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      search => {
        if (this._router.url === '/explore') {
          this.searchString = search;
        }
      }
    );

    this.submitString$.pipe(
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(
      search => {
        if (this._router.url === '/sakuga') {
          this._sakuga.fetchPosts(search);
        } else if (this._router.url === '/explore') {
          // TODO: Handle Explore Search
        }
      }
    );

  }

  ngOnInit() {

  }

  public searchFieldChanged(search: string): void {
    if (this._router.url === '/list') {
      this.searchString$.next(search);
    }
  }

  public routeTo(route: string): void {
    this._router.navigate([route]);
  }

  public executeSearch(search: string) {
    this.submitString$.next(search);
    if (this._router.url === '/sakuga') {
      this._data.searchStrings.sakugaSearch.next(search);
    } else if (this._router.url === '/explore') {
      this._data.searchStrings.exploreSearch.next(search);
    }
  }

  ngOnDestroy() {
    this._destroy$.next(null);
  };

}
