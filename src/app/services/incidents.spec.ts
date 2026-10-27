import { TestBed } from '@angular/core/testing';
import { Incidents } from './incidents';

describe('Incidents', () => {
  let service: Incidents;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Incidents);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
