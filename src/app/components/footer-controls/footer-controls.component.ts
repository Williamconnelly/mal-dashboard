import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';

@Component({
  selector: 'app-footer-controls',
  templateUrl: './footer-controls.component.html',
  styleUrls: ['./footer-controls.component.css']
})
export class FooterControlsComponent implements OnInit {

  private searchString$ = new Subject<string>();

  constructor(private _data: DataService) { 
    this.searchString$.pipe(
      // debounceTime(1000),
      distinctUntilChanged()
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

}
