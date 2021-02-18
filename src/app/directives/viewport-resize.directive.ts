import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { Directive, Inject, Input, OnDestroy, OnInit, Self } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, delay, takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[appViewportResize]'
})
export class ViewportResizeDirective implements OnInit, OnDestroy {

  private readonly _destroy$ = new Subject();

  private readonly _total$ = new Subject<number>();

  @Input()
    public set total(value: number) {
      if (this._viewport.getDataLength() === value) { return; }
      this._total$.next(value);
    }

  constructor(
    @Self()
      @Inject(CdkVirtualScrollViewport)
      private readonly _viewport: CdkVirtualScrollViewport,
      @Inject(DOCUMENT)
      private readonly _document: any,
  ) { }

  ngOnInit() {
    merge(
      fromEvent(this._document.defaultView!, 'resize')
          .pipe(
              debounceTime(1000 / 60),
          ),
      this._total$.pipe(
          delay(0),
      ),
    )
      .pipe(
          tap(() => this._viewport.checkViewportSize()),
          takeUntil(this._destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
