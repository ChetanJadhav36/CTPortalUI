import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySalariesComponent } from './pay-salaries.component';

describe('PaySalariesComponent', () => {
  let component: PaySalariesComponent;
  let fixture: ComponentFixture<PaySalariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaySalariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaySalariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
