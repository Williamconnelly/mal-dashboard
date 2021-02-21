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

  private activeFilters: ListFilter[];

  private currentSearch: string;

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
        // TODO: HANDLE FILTERS. CLEAR ALL FILTERS ON NEW DATA || MAINTAIN FILTERS
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
    this.currentSearch = filter;
    if (filter) {
      const filterList = [...this.userList$.value].filter(media => media.title.toLowerCase().includes(filter.toLowerCase()));
      if ((this.activeFilters && this.activeFilters.length)) {
        // Filter by name & filters
        this.displayList$.next(this.getListFromFilters(filterList, this.activeFilters));
      } else {
        // Filter by name
        this.displayList$.next(filterList);
      }
    } else if ((this.activeFilters && this.activeFilters.length)) {
      const filterList = this.currentSearch ? [...this.userList$.value].filter(media => media.title.toLowerCase().includes(this.currentSearch.toLowerCase())) : [...this.userList$.value];
      // Filter by filters
      console.log('Filtering by filters');
      this.displayList$.next(this.getListFromFilters(filterList, this.activeFilters));
    } else {
      this.currentSearch = null;
      // No filters provided. Send base list
      this.displayList$.next(this.userList$.value);
    }
  }
  
  public filterListByQuery(query: string) {
   if (query) {
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
      // Replace underscore w/ whitespace + toLowerCase
      values = values.map(val => val.toLowerCase().replace(/_/g, ' '));
      // Add new filter
      filters.push(new ListFilter(queryParam, values));
      return filters;
    }, []);
    // Update filters
    this.activeFilters = listFilters;
    // Check if there's an existing name filter
    const filterList = this.currentSearch ? [...this.userList$.value].filter(media => media.title.toLowerCase().includes(this.currentSearch.toLowerCase())) : [...this.userList$.value];
    // Pass list from filter function
    this.displayList$.next(this.getListFromFilters(filterList, this.activeFilters));
   } else {
    // No filter string provided, clear filters
    this.activeFilters = null;
    this.filterListByName(this.currentSearch);
   }
  }

  private filterListByMediaType(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => filter.values.includes(node.media_type.toLowerCase()));
  }

  private filterListByGenre(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => node.genres.some(genre => filter.values.includes(genre.name.toLowerCase())));
  }

  private filterListByUserStatus(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => filter.values.includes(node.my_list_status.status.toLowerCase()));
  }

  private filterListByUserScore(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => filter.values.includes(`${node.my_list_status.score}`));
  }

  private filterListByStudio(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => node.studios.some(studio => filter.values.includes(studio.name.toLowerCase())));
  }

  private getListFromFilters(list: ListNode[], filters: ListFilter[]): ListNode[] {
    let copy = [...list];
    filters.forEach(filter => {
      switch(filter.parameter) {
        case('studio'): copy = this.filterListByStudio(copy, filter); break;
        case('genre'): copy = this.filterListByGenre(copy, filter); break;
        case('type'): copy = this.filterListByMediaType(copy, filter); break;
        case('score'): copy = this.filterListByUserScore(copy, filter); break;
        case('status'): copy = this.filterListByUserStatus(copy, filter); break;
        default: break;
      }
    });
    return copy;
  }

  ngOnDestroy() {
    this._destroy$.next(null);
  };

}

