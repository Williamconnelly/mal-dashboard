import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { SakugaService } from 'src/app/services/sakuga.service';

@Component({
  selector: 'app-sakuga',
  templateUrl: './sakuga.component.html',
  styleUrls: ['./sakuga.component.css']
})
export class SakugaComponent implements OnInit {

  constructor(private _sakuga: SakugaService) { 
    this._sakuga.getPosts('black_clover -production_materials source:*63*').pipe(
      take(1)
    ).subscribe(
      res => {
        console.log(res);
      }, err => {
        console.error(err);
      }
    )
  }

  ngOnInit() {

  }

}
