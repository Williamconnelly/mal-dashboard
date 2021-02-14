import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { MALService } from 'src/app/services/mal.service';
import { UserList } from 'src/app/types/mal-types';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  public list: UserList

  constructor(private _mal: MALService) {
    this._mal.getListData().pipe(
      filter(list => !!list),
      take(1)
    ).subscribe(
      list => {
        console.log('Got List', list);
        this.list = list;
      }, 
      err => {
        console.error(err);
      }
    )
  }

  ngOnInit() {

  }

}
