import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAdvancesComponent } from './employee-advances.component';

describe('EmployeeAdvancesComponent', () => {
  let component: EmployeeAdvancesComponent;
  let fixture: ComponentFixture<EmployeeAdvancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAdvancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAdvancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
