import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DataService } from 'src/app/services/data-service/data-service';
import { ListNode, MediaStatus } from 'src/app/types/mal-types';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MediaConfig } from 'src/app/types/media-types';
import { MALService } from 'src/app/services/mal.service';
import { take } from 'rxjs/operators';
import { IPCService } from 'src/app/services/ipc.service';

@Component({
  selector: 'app-media-view',
  templateUrl: './media-view.component.html',
  styleUrls: ['./media-view.component.css']
})
export class MediaViewComponent implements OnInit {

  public media$ = new BehaviorSubject<ListNode>(null);

  public mediaConfig: MediaConfig;

  public scoreDifferential: number;

  public episodes$ = new BehaviorSubject<string[]>(null);

  constructor(
    private _location: Location, 
    private _data: DataService, 
    private _route: ActivatedRoute,
    private _mal: MALService,
    private _ipc: IPCService
  ) { 
    if (!this.episodes$.value) {
      // TODO: Replace with correct file path logic
      this._mal.getDirectoryContents('F:\\Anime\\Houseki no Kuni').pipe(
        take(1)
      ).subscribe(
        res => {
          this.episodes$.next(res);
        },
        err => {
          // TODO: Handle Error dispaly here
          console.error(err);
        }
      )
    }
  }

  ngOnInit() {
    const media = this._data.getListNode(parseInt(this._route.snapshot.paramMap.get('id'), 10));
    console.log(this._route.snapshot.paramMap.get('id'), media);
    this.media$.next(media);
    const config = this._data.getMediaConfig(this.media$.value.id);
    this.mediaConfig = config || null;
    this.scoreDifferential = this._data.getScoreDifferential(this.media$.value.my_list_status.score, this.media$.value.mean);
  }

  public goBack(): void {
    this._location.back();
  }
  
  public getMediaDuration(seconds: number): number {
    return Math.round(seconds / 60);
  }

  public getMediaStatus(status: string): string {
    return (MediaStatus[status]) || status;
  }

  @HostListener('document:keydown.Alt.ArrowLeft', ['$event']) onKeyDown(e) {
    this.goBack();
  }

  public createDirectory(name: string): void {
    this._ipc.renderer.invoke('create-directory', name).then(
      (result: boolean) => {
        console.log(result);
      }
    ).catch(
      err => {
        console.error(err);
      }
    )
  }

}
