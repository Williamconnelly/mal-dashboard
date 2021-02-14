export interface ListNode {
  node: {
    id: number,
    main_picture: {
      large: string,
      medium: string
    },
    title: string
  }
};

export interface UserList {
  data: ListNode[],
  paging: object
};