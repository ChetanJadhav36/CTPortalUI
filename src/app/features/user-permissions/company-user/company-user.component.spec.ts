import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyUserComponent } from './company-user.component';

describe('CompanyUserComponent', () => {
  let component: CompanyUserComponent;
  let fixture: ComponentFixture<CompanyUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
