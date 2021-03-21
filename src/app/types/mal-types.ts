export interface ListStatus {
  is_rewatching: boolean;
  num_episodes_watched: number;
  score: number;
  status: string;
  updated_at: string;
  start_date?: string;
  finish_date?: string;
}

export interface MALList {
  data: { node: ListNode }[];
  paging: {
    next?: string;
    previous?: string;
  };
};

export interface MALImage {
  medium: string;
  large: string;
}

export interface RelatedNode {
  node: {
    id: number;
    title: string;
    main_picture: MALImage
  };
  relation_type: string;
  relation_type_formatted: string;
}

export interface RecommendedNode {
  node: {
    id: number;
    title: string;
    main_picture: MALImage
  };
  num_recommendations: number;
}

export enum MediaStatus {
  currently_airing = 'Currently Airing',
  finished_airing = 'Finished Airing'
}

export interface ListNode {
  id: number;
  title: string;
  main_picture: MALImage;
  alternative_titles: {
    synonyms: string[],
    en: string,
    ja: string
  };
  start_date: string;
  end_date: string;
  synopsis: string;
  mean: number;
  rank: number;
  popularity: number;
  num_list_users: number;
  num_scoring_users: number;
  nsfw: string;
  created_at: string;
  updated_at: string;
  media_type: string;
  status: string;
  genres: Array<{ id: number, name: string }>;
  my_list_status: ListStatus;
  num_episodes: number;
  start_season: {
    year: number,
    season: string
  };
  broadcast: {
    day_of_the_week: string,
    start_time: string
  };
  source: string;
  average_episode_duration: number;
  rating: string;
  pictures: MALImage[];
  background: string;
  related_anime: RelatedNode[];
  related_manga: Array<any> //TODO: Type
  recommendations: RecommendedNode[];
  studios: Array<{ id: number; name: string }>;
  statistics: {
    status: {
      watching: string,
      completed: string,
      on_hold: string,
      dropped: string,
      plan_to_watch: string
    };
    num_list_users: number;
  }
}