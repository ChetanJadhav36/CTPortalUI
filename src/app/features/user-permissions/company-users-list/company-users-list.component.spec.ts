import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyUsersListComponent } from './company-users-list.component';

describe('CompanyUsersListComponent', () => {
  let component: CompanyUsersListComponent;
  let fixture: ComponentFixture<CompanyUsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyUsersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
