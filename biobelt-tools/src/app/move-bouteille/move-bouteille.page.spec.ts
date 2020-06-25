import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveBouteillePage } from './move-bouteille.page';

describe('MoveBouteillePage', () => {
  let component: MoveBouteillePage;
  let fixture: ComponentFixture<MoveBouteillePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveBouteillePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveBouteillePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
