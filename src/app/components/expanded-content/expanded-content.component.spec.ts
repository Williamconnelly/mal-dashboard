import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandedContentComponent } from './expanded-content.component';

describe('ExpandedContentComponent', () => {
  let component: ExpandedContentComponent;
  let fixture: ComponentFixture<ExpandedContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpandedContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandedContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
