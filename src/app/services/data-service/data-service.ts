import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MediaConfig, MediaConfigMap } from 'src/app/types/media-types';
import { Post } from 'src/app/types/sakuga-types';
import { ListNode, UserList } from '../../types/mal-types';
import { IPCService } from '../ipc.service';
import { MALService } from '../mal.service';
import { SakugaService } from '../sakuga.service';

class ListFilter {
  public parameter: string;
  public values: string[];

  constructor(param: string, values: string[]) {
    this.parameter = param;
    this.values = values;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  // Full List from MAL API
  private userList$ = new BehaviorSubject<ListNode[]>(null);

  // List displayed by components
  private displayList$ = new BehaviorSubject<ListNode[]>(null);

  private _destroy$ = new Subject<boolean>();

  // Available filter params
  private validFilterParameters = [
    'type',
    'genre',
    'status',
    'score',
    'studio'
  ];

  private mediaConfigMap: MediaConfigMap;

  private filterState = {
    name: '',
    queryFilters: [],
    hasEpisodes: false
  }

  public sakugaQuery: string;

  public searchStrings = {
    listSearch: new BehaviorSubject<string>(''),
    exploreSearch: new BehaviorSubject<string>(''),
    sakugaSearch: new BehaviorSubject<string>('')
  };

  public loadingStatus = {
    listLoading$: new BehaviorSubject<boolean>(true),
    sakugaLoading$: new BehaviorSubject<boolean>(false),
    tagLoading$:new BehaviorSubject<boolean>(true),
    exploreLoading$: new BehaviorSubject<boolean>(true)
  };

  constructor(private _mal: MALService, private _ipc: IPCService) {
    this._mal.getListData().pipe(
      filter(list => !!list),
      takeUntil(this._destroy$)
    ).subscribe(
      list => {
        // Update User List
        this.userList$.next(list.data.map(ele => ele.node));
        // Update Display List
        this.displayList$.next(this.userList$.value);
        // TODO: HANDLE FILTERS. CLEAR ALL FILTERS ON NEW DATA || MAINTAIN FILTERS
      }, 
      err => {
        console.error(err);
      }
    );

    this._ipc.renderer.invoke('get-media-config').then(
      (map: string) => {
        console.log('Got config', JSON.parse(map));
        this.mediaConfigMap = (JSON.parse(map) as MediaConfigMap);
      }
    ).catch(
      err => {
        console.error('Failed to retrieve config', err);
      }
    )
  }

  public getListData(): Observable<ListNode[]> {
    return this.displayList$;
  }

  private filterList(): void {
    // Stage 1 - Check if hasEpisodes filter is active
    let filteredList = [...this.userList$.value];
    if (this.filterState.hasEpisodes) {
      filteredList = this.filterListByMap(filteredList);
    }
    // Stage 2 - Check if name filter is active
    if (this.filterState.name) {
      filteredList = filteredList.filter(media => media.title.toLowerCase().includes(this.filterState.name.toLowerCase()))
    }
    // Stage 3 - Check if query filter is active
    if (this.filterState.queryFilters && this.filterState.queryFilters.length) {
      filteredList = this.getListFromFilters(filteredList, this.filterState.queryFilters);
    }
    // Filtering Complete
    this.displayList$.next(filteredList);
  }

  public filterListByName(filter: string): void {
    this.filterState.name = filter || '';
    this.searchStrings.listSearch.next(this.filterState.name);
    this.filterList();
  }

  public filterListByQuery(query: string): void {
    if (query) {
      // Split query segments by whitespace
      const subStrings = query.split(/\s+/g);
      // Create filters
      const listFilters = subStrings.reduce<ListFilter[]>((filters, subStr) => {
        // Find param
        const queryParam = subStr.substring(0, subStr.indexOf(':'));
        // If invalid param, return
        if (!this.validFilterParameters.includes(queryParam)) {
          return filters;
        }
        // Get values array
        let values = subStr.substring(subStr.indexOf(':') + 1).split(',');
        // Replace underscore w/ whitespace + toLowerCase
        values = values.map(val => val.toLowerCase().replace(/_/g, ' '));
        // Add new filter
        filters.push(new ListFilter(queryParam, values));
        return filters;
      }, []);
      // Update filters
      this.filterState.queryFilters = listFilters;
      this.filterList();
    } else {
      // Clear filters
      this.filterState.queryFilters = null;
      this.filterList();
    }
  }

  public filterListByHasEpisodes(state: boolean): void {
    this.filterState.hasEpisodes = state;
    this.filterList();
  }

  private filterListByMediaType(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => filter.values.includes(node.media_type.toLowerCase()));
  }

  private filterListByGenre(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => node.genres.some(genre => filter.values.includes(genre.name.toLowerCase())));
  }

  private filterListByUserStatus(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => filter.values.includes(node.my_list_status.status.toLowerCase()));
  }

  private filterListByUserScore(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => filter.values.includes(`${node.my_list_status.score}`));
  }

  private filterListByStudio(list: ListNode[], filter: ListFilter): ListNode[] {
    return [...list].filter(node => node.studios.some(studio => filter.values.includes(studio.name.toLowerCase())));
  }

  private filterListByMap(list: ListNode[]): ListNode[] {
    const mapIds = Object.keys(this.mediaConfigMap).map(key => +key);
    return [...list].filter(node => mapIds.includes(node.id));
  }

  private getListFromFilters(list: ListNode[], filters: ListFilter[]): ListNode[] {
    let copy = [...list];
    filters.forEach(filter => {
      switch(filter.parameter) {
        case('studio'): copy = this.filterListByStudio(copy, filter); break;
        case('genre'): copy = this.filterListByGenre(copy, filter); break;
        case('type'): copy = this.filterListByMediaType(copy, filter); break;
        case('score'): copy = this.filterListByUserScore(copy, filter); break;
        case('status'): copy = this.filterListByUserStatus(copy, filter); break;
        default: break;
      }
    });
    return copy;
  }

  public getListNode(id: number): ListNode {
    return this.userList$.value.find(node => node.id === id);
  }

  ngOnDestroy() {
    this._destroy$.next(null);
  };

  public updateMediaConfig(id: number, property: string, updateValue: any): void {
    if (this.mediaConfigMap) {
      if (this.mediaConfigMap[id]) {
        this.mediaConfigMap[id][property] = updateValue;
      } else if (property === 'filepath') {
        this.mediaConfigMap[id] = {
          filepath: updateValue
        };
      }
    } else {
      if (property === 'filepath') {
        this.mediaConfigMap = {[id]: {
          filepath: updateValue
        }};
      }
    }
    // Update config file
    this._ipc.renderer.invoke('set-media-config', JSON.stringify(this.mediaConfigMap)).then(
      res => {
        console.log('SUCCESS! Updated Config File');
      }
    ).catch(
      err => {
        console.error('Failed to update config file', err);
      }
    )
  }

  private getMediaConfigMap(): void {
    this._ipc.renderer.invoke('get-media-config').then(
      (map: MediaConfigMap) => {
        this.mediaConfigMap = map;
      }
    ).catch(
      err => {
        console.error('Failed to get Config Map', err); 
      }
    );
  }

  private setMediaConfigMap(): void {
    this._ipc.renderer.invoke('set-media-config').then(
      (result: boolean) => {
       console.log('Media Config File Updated', result);
      }
    ).catch(
      err => {
        console.error('Failed to update Config Map', err); 
      }
    );
  }

  public getMediaConfig(id: number): MediaConfig {
    return this.mediaConfigMap ? this.mediaConfigMap[id] : null;
  }

  public getScoreDifferential(userScore: number, meanScore: number): number {
    return +(userScore - meanScore).toFixed(2);
  };

  public openFile(path: string): void {
    // shell.openExternal(path).then(
    //   res => {
    //     console.log(res);
    //   }
    // ).catch(
    //   err => {
    //     console.error(err);
    //   }
    // )
    this._ipc.renderer.invoke('open-file', path).then(
      res => {
        console.log('Opened file', res);
      }
    ).catch(
      err => {
        console.error('Failed to open file', err);
      }
    )
  }

}

