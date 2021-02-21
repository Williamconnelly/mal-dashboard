import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ListNode, UserList } from '../../types/mal-types';
import { MALService } from '../mal.service';

class ListFilter {
  public parameter: string;
  public values: string[];

  constructor(param: string, values: string[]) {
    this.parameter = param;
    this.values = values;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Full List from MAL API
  private userList$ = new BehaviorSubject<ListNode[]>(null);

  // List displayed by components
  private displayList$ = new BehaviorSubject<ListNode[]>(null);

  private _destroy$ = new Subject<boolean>();

  // Available filter params
  private validFilterParameters = [
    'type',
    'genre',
    'status',
    'score',
    'studio'
  ];

  constructor(private _mal: MALService) {
    this._mal.getListData().pipe(
      filter(list => !!list),
      takeUntil(this._destroy$)
    ).subscribe(
      list => {
        // Update User List
        this.userList$.next(list.data.map(ele => ele.node));
        // Update Display List
        this.displayList$.next(this.userList$.value);
      }, 
      err => {
        console.error(err);
      }
    )
  }

  public getListData(): Observable<ListNode[]> {
    return this.displayList$;
  }

  public filterListByName(filter: string): void {
    if (filter) {
      const filterList = [...this.userList$.value].filter(media => media.title.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
      this.displayList$.next(filterList);
    } else {
      this.displayList$.next(this.userList$.value);
    }
  }
  
  public filterListByQuery(query: string) {
    // Split query segments by whitespace
    const subStrings = query.split(/\s+/g);
    // Create filters
    const listFilters = subStrings.reduce<ListFilter[]>((filters, subStr) => {
      // Find param
      const queryParam = subStr.substring(0, subStr.indexOf(':'));
      // If invalid param, return
      if (!this.validFilterParameters.includes(queryParam)) {
        return filters;
      }
      // Get values array
      let values = subStr.substring(subStr.indexOf(':') + 1).split(',');
      // Replace underscore w/ whitespace
      values = values.map(val => val.replace(/_/g, ' '));
      // Add new filter
      filters.push(new ListFilter(queryParam, values));
      return filters;
    }, []);
    console.log(listFilters);
  }

  ngOnDestroy() {
    this._destroy$.next(null);
  };

}

