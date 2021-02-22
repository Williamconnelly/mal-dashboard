import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from 'src/app/services/data-service/data-service';
import { ListNode } from 'src/app/types/mal-types';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-media-view',
  templateUrl: './media-view.component.html',
  styleUrls: ['./media-view.component.css']
})
export class MediaViewComponent implements OnInit {

  public media$ = new BehaviorSubject<ListNode>(null);

  constructor(private _location: Location, private _data: DataService, private _route: ActivatedRoute) { }

  ngOnInit() {
    const media = this._data.getListNode(parseInt(this._route.snapshot.paramMap.get('id'), 10));
    console.log(this._route.snapshot.paramMap.get('id'), media);
    this.media$.next(media);
  }

  public goBack(): void {
    this._location.back();
  }

}
