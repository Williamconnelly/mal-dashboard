export interface ListNode {
  node: {
    id: number;
    main_picture: {
      large: string;
      medium: string;
    },
    title: string;
  }
};

export interface ListStatus {
  is_rewatching: boolean;
  num_episodes_watched: number;
  score: number;
  status: string;
  updated_at: string;
}

export interface UserList {
  data: {node: ListNode, list_status: ListStatus}[];
  paging: object;
};