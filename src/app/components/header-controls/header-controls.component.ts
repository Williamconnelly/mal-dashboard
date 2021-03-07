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
          this.searchString = this._data.searchStrings.listSearch;
        } else if (nav.url === '/sakuga') {
          this.searchString = this._data.searchStrings.sakugaSearch;
        } else if (nav.url === '/explore') {
          this.searchString = this._data.searchStrings.exploreSearch;
        }
      },
      err => {
        console.error('Could not get route');
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

  ngOnDestroy() {
    this._destroy$.next(null);
  };

  public routeTo(route: string): void {
    this._router.navigate([route]);
  }

  public openSettings(): void {
    this._ipc.renderer.send('open-settings');
    // const BrowserWindow = remote.BrowserWindow;

    // Create a browser window
    // var win = new BrowserWindow({
    //   width: 800,
    //   height: 600,
    //   center: true,
    //   resizable: false,
    //   frame: true,
    //   transparent: false
    // });
    // // Load the page + route
    // win.loadURL('file://' + __dirname + '/index.html#/settings');

  }

  public executeSearch(search: string) {
    this.submitString$.next(search);
  }

}
