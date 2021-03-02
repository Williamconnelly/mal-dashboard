import { TestBed } from '@angular/core/testing';

import { SakugaService } from './sakuga.service';

describe('SakugaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SakugaService = TestBed.get(SakugaService);
    expect(service).toBeTruthy();
  });
});
