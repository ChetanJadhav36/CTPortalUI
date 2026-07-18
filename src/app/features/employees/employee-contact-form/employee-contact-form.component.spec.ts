import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeContactFormComponent } from './employee-contact-form.component';

describe('EmployeeContactFormComponent', () => {
  let component: EmployeeContactFormComponent;
  let fixture: ComponentFixture<EmployeeContactFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeContactFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
