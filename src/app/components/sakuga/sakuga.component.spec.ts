import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SakugaComponent } from './sakuga.component';

describe('SakugaComponent', () => {
  let component: SakugaComponent;
  let fixture: ComponentFixture<SakugaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SakugaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SakugaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
