import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ListNode, UserList } from '../../types/mal-types';
import { MALService } from '../mal.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Full List from MAL API
  private userList$ = new BehaviorSubject<ListNode[]>(null);

  // List displayed by components
  private displayList$ = new BehaviorSubject<ListNode[]>(null);

  private _destroy$ = new Subject<boolean>();

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
  
  ngOnDestroy() {
    this._destroy$.next(null);
  };

}

