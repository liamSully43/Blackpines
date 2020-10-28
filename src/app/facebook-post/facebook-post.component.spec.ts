import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacebookPostComponent } from './facebook-post.component';

describe('FacebookPostComponent', () => {
  let component: FacebookPostComponent;
  let fixture: ComponentFixture<FacebookPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacebookPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacebookPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
