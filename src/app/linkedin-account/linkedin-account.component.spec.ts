import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedinAccountComponent } from './linkedin-account.component';

describe('LinkedinAccountComponent', () => {
  let component: LinkedinAccountComponent;
  let fixture: ComponentFixture<LinkedinAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkedinAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedinAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
