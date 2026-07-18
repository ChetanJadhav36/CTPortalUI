import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessListComponent } from './user-access-list.component';

describe('UserAccessListComponent', () => {
  let component: UserAccessListComponent;
  let fixture: ComponentFixture<UserAccessListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccessListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAccessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
