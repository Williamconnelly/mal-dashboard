import { Component, OnInit } from '@angular/core';
import { MALService } from 'src/app/services/mal.service';

@Component({
  selector: 'app-authenticate',
  templateUrl: './authenticate.component.html',
  styleUrls: ['./authenticate.component.css']
})
export class AuthenticateComponent implements OnInit {

  constructor(private _mal: MALService) { }

  ngOnInit() {

  }

  public signInMal(): void {
    this._mal.authorizeUser();
  }

}
