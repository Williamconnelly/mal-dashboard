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