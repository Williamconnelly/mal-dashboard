export interface MediaConfigMap {
  [key: number]: MediaConfig
}

export interface MediaConfig {
  filepath?: string;
  sakuga_title?: string,
  links?: MediaLink[];
}

export class MediaLink {
  name: string;
  url: string;
  constructor(name: string, url: string) {
    this.name = name;
    this.url = url;
  }
}

export class UserSettings {
  enableNSFWSearch = false;
}

export class StatusUpdate {
  status: 'watching';
  is_rewatching: false;
  score: 'Unrated';
  num_watched_episodes: 0;
  priority: 0;
  num_times_rewatched: 0;
  rewatch_value: 0;
  tags: '';
  comments: '';
}