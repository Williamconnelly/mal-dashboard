import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('player', {static: false}) videoPlayer: ElementRef<HTMLVideoElement>

  constructor(
    private _location: Location, 
    private _data: DataService, 
    private _route: ActivatedRoute,
    private _mal: MALService,
    private _ipc: IPCService
  ) { }

  ngOnInit() {
    const media = this._data.getListNode(parseInt(this._route.snapshot.paramMap.get('id'), 10));
    console.log(this._route.snapshot.paramMap.get('id'), media);
    this.media$.next(media);
    const config = this._data.getMediaConfig(this.media$.value.id);
    this.mediaConfig = config || null;
    this.scoreDifferential = this._data.getScoreDifferential(this.media$.value.my_list_status.score, this.media$.value.mean);

    // Setup Media Config
    if (!this.episodes$.value || this.mediaConfig) {
      this.getEpisodes();
    }

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

  public setDirectory(): void {
    this._ipc.renderer.invoke('set-directory').then(
      (path: string) => {
        console.log(path);
        this._data.updateMediaConfig(this.media$.value.id, 'filepath', path);
        this.getEpisodes();
      }
    ).catch(
      err => {
        console.error(err);
      }
    )
  }

  private getEpisodes(): void {
    const config = this._data.getMediaConfig(this.media$.value.id);
    if (config) {
      // Found configuration
      this.mediaConfig = config;
      this._mal.getDirectoryContents(this.mediaConfig.filepath).pipe(
        take(1)
      ).subscribe(
        episodes => {
          this.episodes$.next(episodes);
        },
        err => {
          console.error('Failed to fetch media files', err);
          // TODO: Handle error display
        }
      )
    }
  }

  public playVideo(filename: string): void {
    const url = `${this.mediaConfig.filepath}\\${filename}`;
    this._data.openFile(url);
  }

}
