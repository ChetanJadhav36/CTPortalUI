import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialEntryApprovalComponent } from './financial-entry-approval.component';

describe('FinancialEntryApprovalComponent', () => {
  let component: FinancialEntryApprovalComponent;
  let fixture: ComponentFixture<FinancialEntryApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialEntryApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialEntryApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
