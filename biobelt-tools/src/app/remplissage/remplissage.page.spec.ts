import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemplissagePage } from './remplissage.page';

describe('RemplissagePage', () => {
  let component: RemplissagePage;
  let fixture: ComponentFixture<RemplissagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemplissagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemplissagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
