import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BouteillePage } from './bouteille.page';

describe('BouteillePage', () => {
  let component: BouteillePage;
  let fixture: ComponentFixture<BouteillePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BouteillePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BouteillePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
