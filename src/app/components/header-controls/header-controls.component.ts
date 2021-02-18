import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DataService } from 'src/app/services/data-service/data-service';

@Component({
  selector: 'app-header-controls',
  templateUrl: './header-controls.component.html',
  styleUrls: ['./header-controls.component.css']
})
export class HeaderControlsComponent implements OnInit {

  private searchString$ = new Subject<string>();

  constructor(private _data: DataService) {
    this.searchString$.pipe(
      debounceTime(1000),
      distinctUntilChanged()
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

}
