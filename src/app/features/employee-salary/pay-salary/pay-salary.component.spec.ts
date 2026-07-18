import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySalaryComponent } from './pay-salary.component';

describe('PaySalaryComponent', () => {
  let component: PaySalaryComponent;
  let fixture: ComponentFixture<PaySalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaySalaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaySalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
