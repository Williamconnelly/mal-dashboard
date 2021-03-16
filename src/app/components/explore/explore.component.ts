import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { MALService } from 'src/app/services/mal.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  constructor(private _mal: MALService) { }

  ngOnInit() {
    this.tempQuery();
  }

  public tempQuery() {
    this._mal.getQueryList('one').pipe(
      
    ).subscribe(
      res => {
        console.log(res);
      }, 
      err => {
        console.warn(err);
      }
    )
  }

}
