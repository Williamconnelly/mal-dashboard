import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { SakugaService } from 'src/app/services/sakuga.service';
import { Post } from 'src/app/types/sakuga-types';

@Component({
  selector: 'app-sakuga',
  templateUrl: './sakuga.component.html',
  styleUrls: ['./sakuga.component.css']
})
export class SakugaComponent implements OnInit {

  @Input() embedded = false;

  public posts$ = new BehaviorSubject<Post[]>(null);

  constructor(private _sakuga: SakugaService) { 
    this._sakuga.getPosts('black_clover -production_materials source:*63*').pipe(
      take(1)
    ).subscribe(
      res => {
        console.log(res);
        this.posts$.next(res);
      }, err => {
        console.error(err);
      }
    )
  }

  ngOnInit() {

  }

}
