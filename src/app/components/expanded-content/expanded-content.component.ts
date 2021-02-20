import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MALService } from 'src/app/services/mal.service';
import { ListNode } from 'src/app/types/mal-types';

@Component({
  selector: 'app-expanded-content',
  templateUrl: './expanded-content.component.html',
  styleUrls: ['./expanded-content.component.css']
})
export class ExpandedContentComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() listNode: ListNode;

  @ViewChildren('panel') panels: QueryList<ElementRef<HTMLElement>>

  public expanded: boolean;

  public expandedController$ = new Subject<boolean>();

  public closeExpanded$ = new Subject<boolean>();

  private panelRef: HTMLElement;

  private transitionType: any;

  private _destroy$ = new Subject<boolean>();

  private isTransitioning: boolean;

  public episodes$ = new BehaviorSubject<string[]>(null);

  constructor(private _renderer: Renderer2, private _mal: MALService) { }

  ngOnInit() {
    // When closed, this callback will set the height to 0 and trigger the animation callback.
    this.closeExpanded$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      expandedState => {
        if (this.panelRef) {
          // Content is now transitioning
          this.isTransitioning = true;
          this.panelRef.style.maxHeight = null;
        };
      }
    );
  }

  ngAfterViewInit() {
    // Listen for when the panel has been made available in the view.
    this.panels.changes.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      (panels: QueryList<ElementRef<HTMLElement>>) => {
        if (panels && panels.length) {
          // Add a callback to the panels' transition animation in order to remove the panel from the view when completed.
          this.panelRef = panels.toArray()[0].nativeElement;
          !this.transitionType ? this.transitionType = this.getTransitionEvent() : null;
          // Content is transitioning
          this.isTransitioning = true;
          this.panelRef.addEventListener(this.transitionType, this.animationCallback.bind(this));
          // Expand panel by setting height to scrollHeight.
          this.panelRef.style.maxHeight = `${this.panelRef.scrollHeight}px`;
        };
      }
    )
  };

  // Exposed Toggle Event - Expanded => Call next on the controller to render the template; Closed => Call next to animate the close
  public toggleExpansion(): void {
    // Disable toggle method during an active transition
    if (!this.isTransitioning) {
      this.expanded = !this.expanded;
      this.expanded ? this.expandedController$.next(this.expanded) : this.closeExpanded$.next(this.expanded);
    }
    if (!this.episodes$.value) {
      this._mal.getDirectoryContents('F:\\Anime\\Houseki no Kuni').pipe(
        take(1)
      ).subscribe(
        res => {
          this.episodes$.next(res);
        },
        err => {
          console.error(err);
        }
      )
    }
  };

  private getTransitionEvent() {
    const transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };
    const ele = this._renderer.createElement('div') as HTMLElement;
    for (let transition in transitions) {
      if (ele.style[transition] !== undefined) {
        return transitions[transition];
      }
    };
  };

  // Callback methods to run when open/close animation has completed
  private animationCallback(): void {
    if (!this.expanded) {
      // When closed and transition animation has finished of height:0, remove rendered content
      this.expandedController$.next(false);
    } else {
      // Do something when completely opened
    };
    // No longer in transition
    this.isTransitioning = false;
  };

  ngOnDestroy() {
    this._destroy$.next(null);
  };

}
