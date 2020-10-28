import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookAccountComponent } from './facebook-account.component';

describe('FacebookAccountComponent', () => {
  let component: FacebookAccountComponent;
  let fixture: ComponentFixture<FacebookAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacebookAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacebookAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
