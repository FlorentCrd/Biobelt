import { TestBed } from '@angular/core/testing';

import { Upcv3serviceService } from './upcv3service.service';

describe('Upcv3serviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Upcv3serviceService = TestBed.get(Upcv3serviceService);
    expect(service).toBeTruthy();
  });
});
