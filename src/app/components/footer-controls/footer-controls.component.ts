import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';

@Component({
  selector: 'app-footer-controls',
  templateUrl: './footer-controls.component.html',
  styleUrls: ['./footer-controls.component.css']
})
export class FooterControlsComponent implements OnInit {

  private searchString$ = new Subject<string>();

  public searchString = '';

  private _destroy$ = new Subject<boolean>();

  constructor(private _data: DataService) { 
    this.searchString$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(
      query => {
        this._data.filterListByQuery(query);
      }
    )
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

  ngOnDestroy() {
    this._destroy$.next(null);
  };
  
}
