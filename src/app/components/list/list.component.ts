import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { MALService } from 'src/app/services/mal.service';
import { UserList } from 'src/app/types/mal-types';
import { ExpandedContentComponent } from '../expanded-content/expanded-content.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  @ViewChildren('expandedContent') expandedContent: QueryList<ExpandedContentComponent>;

  public list$ = new BehaviorSubject<UserList>(null);

  constructor(private _mal: MALService) {
    this._mal.getListData().pipe(
      filter(list => !!list),
      take(1)
    ).subscribe(
      list => {
        console.log('Got List', list);
        this.list$.next(list);
      }, 
      err => {
        console.error(err);
      }
    )
  }

  ngOnInit() {

  }

  public toggleExpandedContent(index: number): void {
    this.expandedContent.toArray()[index].toggleExpansion();
  };

}
