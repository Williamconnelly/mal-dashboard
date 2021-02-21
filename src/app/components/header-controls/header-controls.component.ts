import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';

@Component({
  selector: 'app-header-controls',
  templateUrl: './header-controls.component.html',
  styleUrls: ['./header-controls.component.css']
})
export class HeaderControlsComponent implements OnInit, OnDestroy {

  private searchString$ = new Subject<string>();

  public searchString = '';

  private _destroy$ = new Subject<boolean>();

  constructor(private _data: DataService, private _router: Router) {
    this.searchString$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(
      search => {
        this._data.filterListByName(search);
      }
    )
  }

  ngOnInit() {

  }

  public searchFieldChanged(search: string): void {
    this.searchString$.next(search);
  }

  ngOnDestroy() {
    this._destroy$.next(null);
  };

  public routeTo(route: string): void {
    this._router.navigate([route]);
  }

}
