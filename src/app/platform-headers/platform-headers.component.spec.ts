import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformHeadersComponent } from './platform-headers.component';

describe('PlatformHeadersComponent', () => {
  let component: PlatformHeadersComponent;
  let fixture: ComponentFixture<PlatformHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlatformHeadersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatformHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
