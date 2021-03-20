import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';

@Component({
  selector: 'app-footer-controls',
  templateUrl: './footer-controls.component.html',
  styleUrls: ['./footer-controls.component.css']
})
export class FooterControlsComponent implements OnInit {

  private searchString$ = new Subject<string>();

  public searchString = '';

  public currentRoute: string;

  private _destroy$ = new Subject<boolean>();

  constructor(private _data: DataService, private _router: Router) { 
    this.searchString$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(
      query => {
        this._data.filterListByQuery(query);
      }
    );

    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._destroy$)
    ).subscribe(
      (nav: NavigationEnd) => {
        // Set currentRoute
        this.currentRoute = nav.url;
        console.log(this.currentRoute);
      },
      err => {
        console.error('Could not get route');
      }
    );

  }

  ngOnInit() {
    
  }

  public searchFieldChanged(query: string): void {
    this.searchString$.next(query);
  }

  public clearSearch(): void {
    this.searchString = '';
    this.searchString$.next('');
  }

  public toggleEpisodeFilter(state: boolean): void {
    this._data.filterListByHasEpisodes(state);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  public toggleNSFW(state: boolean): void {
    console.log(this._router.url);
  }

}
