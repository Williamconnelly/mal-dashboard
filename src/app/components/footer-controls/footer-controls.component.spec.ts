import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterControlsComponent } from './footer-controls.component';

describe('FooterControlsComponent', () => {
  let component: FooterControlsComponent;
  let fixture: ComponentFixture<FooterControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
