import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { ListNode } from "src/app/types/mal-types";

export class DataManagerService extends DataSource<ListNode> {

  private cachedNodes = Array.from<ListNode>({ length: 0 });

  private dataStream = new BehaviorSubject<ListNode[]>(this.cachedNodes);

  private subscription = new Subscription();

  private pageSize = 10;

  private lastPage = 0;

  constructor() {
    super();

    this.fetchNodes();

  }

  public connect(collectionViewer: CollectionViewer): Observable<ListNode[]> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const currentPage = this.getPageForIndex(range.end);
      if (currentPage && range) {
        console.log(currentPage, this.lastPage);
      }
      if (currentPage > this.lastPage) {
        this.lastPage = currentPage;
        this.fetchNodes();
      }
    }));
    return this.dataStream;
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.subscription.unsubscribe();
  }

  private fetchNodes(): void {
    for (let i = 0; i < this.pageSize; i++) {
      const node: ListNode = {
        title: `List Node ${i}`,
        my_list_status: {
          score: 5,
          status: 'Complete'
        },
        media_type: 'RANDOM'
      } as ListNode;
      this.cachedNodes = this.cachedNodes.concat(node);
      this.dataStream.next(this.cachedNodes);
    }
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

}