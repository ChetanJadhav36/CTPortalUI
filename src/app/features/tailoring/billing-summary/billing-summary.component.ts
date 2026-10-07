import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaymentStatus, PaymentType } from '../../../enums/permission.enum';

@Component({
  selector: 'app-billing-summary',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './billing-summary.component.html',
  styleUrl: './billing-summary.component.scss'
})
export class BillingSummaryComponent {
  @Input({ required: true })
  group!: FormGroup;

  PaymentType = PaymentType;
  PaymentStatus = PaymentStatus;
  
  // FORM GROUP GETTERS
  get payment1(): FormGroup {
    return this.group.get('payment1') as FormGroup;
  }

  get payment2(): FormGroup {
    return this.group.get('payment2') as FormGroup;
  }
  
  // BASIC AMOUNTS
  getTotalAmount(): number {
    return Number(this.group.get('totalAmount')?.value) || 0;
  }

  getDiscountAmount(): number {
    return Number(this.group.get('discountAmount')?.value) || 0;
  }

  getNetAmount(): number {
    const totalAmount = this.getTotalAmount();
    const discountAmount = this.getDiscountAmount();

    return Math.max(totalAmount - discountAmount, 0);
  }
  
  // UPDATE BILLING SUMMARY  
  updateBillingSummary(): void {
    const netAmount = this.getNetAmount();
    const totalPaid = this.getTotalPaymentAmount();

    const balance = Math.max(netAmount - totalPaid, 0);

    this.group.patchValue(
      {
        netAmount,
        totalPaidAmount: totalPaid,
        balanceAmount: balance
      },
      { emitEvent: false }
    );
  }
  
  // PAYMENT 1
  getPayment1Amount(): number {
    return Number(this.payment1?.get('amount')?.value) || 0;
  }

  // PAYMENT 2
  getPayment2Amount(): number {
    return Number(this.payment2?.get('amount')?.value) || 0;
  }
  
  // PAYMENT TOTAL
  getTotalPaymentAmount(): number {
    return this.getPayment1Amount() + this.getPayment2Amount();
  }

  getPaymentTotal(): number {
    return this.getTotalPaymentAmount();
  }

  // REMAINING AMOUNT
  getRemainingAfterPayment1(): number {
    const remaining = this.getNetAmount() - this.getPayment1Amount();
    return Math.max(remaining, 0);
  }

  getFinalBalanceAmount(): number {
    const remaining = this.getNetAmount() - this.getTotalPaymentAmount();
    return Math.max(remaining, 0);
  }
  
  // PAYMENT AMOUNT VALIDATION
  isPaymentTotalExceeded(): boolean {
    return this.getTotalPaymentAmount() > this.getNetAmount();
  }

  isPayment1AmountExceeded(): boolean {
    return this.getPayment1Amount() > this.getNetAmount();
  }

  isPayment2AmountExceeded(): boolean {
    return this.getPayment2Amount() > this.getRemainingAfterPayment1();
  }

  isPaymentAmountInvalid(): boolean {
    return (
      this.isPaymentTotalExceeded() ||
      this.isPayment1AmountExceeded() ||
      this.isPayment2AmountExceeded()
    );
  }
  
  // PAYMENT 1 AMOUNT CHANGE
  onPayment1AmountChange(): void {
    let amount = this.getPayment1Amount();
    const netAmount = this.getNetAmount();

    if (amount < 0) {
      amount = 0;
    }

    if (amount > netAmount) {
      amount = netAmount;

      this.payment1.patchValue(
        { amount },
        { emitEvent: false }
      );
    }

    const remainingAfterPayment1 = Math.max(
      netAmount - amount,
      0
    );

    const payment2Amount = this.getPayment2Amount();

    if (payment2Amount > remainingAfterPayment1) {
      this.payment2.patchValue(
        { amount: remainingAfterPayment1 },
        { emitEvent: false }
      );

      if (this.isPayment2Cash()) {
        this.clearPayment2CashNotes();
      }
    }

    this.updateBillingSummary();
  }

  // PAYMENT 2 AMOUNT CHANGE
  onPayment2AmountChange(): void {
    let amount = this.getPayment2Amount();
    const remaining = this.getRemainingAfterPayment1();

    if (amount < 0) {
      amount = 0;
    }

    if (amount > remaining) {
      amount = remaining;

      this.payment2.patchValue(
        { amount },
        { emitEvent: false }
      );
    }

    this.updateBillingSummary();
  }

  // PAYMENT 1 TYPE CHANGE  
  onPayment1TypeChange(): void {
    if (!this.isPayment1Cash()) {
      this.clearPayment1CashNotes();
    }

    this.updateBillingSummary();
  }
  
  // PAYMENT 2 TYPE CHANGE
  onPayment2TypeChange(): void {
    if (!this.isPayment2Cash()) {
      this.clearPayment2CashNotes();
    }

    this.updateBillingSummary();
  }

  // PAYMENT 1 CASH  
  isPayment1Cash(): boolean {
    return (Number(this.payment1?.get('paymentType')?.value) === PaymentType.Cash);
  }

  getPayment1NotesTotal(): number {
    if (!this.payment1) {
      return 0;
    }

    return (
      (Number(this.payment1.get('notes2000')?.value) || 0) * 2000 +      
      (Number(this.payment1.get('notes500')?.value) || 0) * 500 +
      (Number(this.payment1.get('notes200')?.value) || 0) * 200 +
      (Number(this.payment1.get('notes100')?.value) || 0) * 100 +
      (Number(this.payment1.get('notes50')?.value) || 0) * 50 +
      (Number(this.payment1.get('notes20')?.value) || 0) * 20 +
      (Number(this.payment1.get('notes10')?.value) || 0) * 10 +
      (Number(this.payment1.get('notes5')?.value) || 0) * 5 +
      (Number(this.payment1.get('coins')?.value) || 0)
    );
  }

  getPayment1NotesCount(): number {
    if (!this.payment1) {
      return 0;
    }
    return (
      (Number(this.payment1.get('notes2000')?.value) || 0) +      
      (Number(this.payment1.get('notes500')?.value) || 0) +
      (Number(this.payment1.get('notes200')?.value) || 0) +
      (Number(this.payment1.get('notes100')?.value) || 0) +
      (Number(this.payment1.get('notes50')?.value) || 0) +
      (Number(this.payment1.get('notes20')?.value) || 0) +
      (Number(this.payment1.get('notes10')?.value) || 0) +
      (Number(this.payment1.get('notes5')?.value) || 0) +
      (Number(this.payment1.get('coins')?.value) || 0)
    );
  }

  isPayment1CashMismatch(): boolean {
    if (!this.isPayment1Cash()) {
      return false;
    }

    const amount = this.getPayment1Amount();
    const cashTotal = this.getPayment1NotesTotal();

    if (amount === 0 && cashTotal === 0) {
      return false;
    }

    return cashTotal !== amount;
  }
  
  // PAYMENT 2 CASH
  isPayment2Cash(): boolean {
    return (Number(this.payment2?.get('paymentType')?.value) === PaymentType.Cash);
  }

  getPayment2NotesTotal(): number {
    if (!this.payment2) {
      return 0;
    }

    return (
      (Number(this.payment2.get('notes2000')?.value) || 0) * 2000 +      
      (Number(this.payment2.get('notes500')?.value) || 0) * 500 +
      (Number(this.payment2.get('notes200')?.value) || 0) * 200 +
      (Number(this.payment2.get('notes100')?.value) || 0) * 100 +
      (Number(this.payment2.get('notes50')?.value) || 0) * 50 +
      (Number(this.payment2.get('notes20')?.value) || 0) * 20 +
      (Number(this.payment2.get('notes10')?.value) || 0) * 10 +
      (Number(this.payment2.get('notes5')?.value) || 0) * 5 +
      (Number(this.payment2.get('coins')?.value) || 0)
    );
  }

  getPayment2NotesCount(): number {
    if (!this.payment2) {
      return 0;
    }

    return (
      (Number(this.payment2.get('notes2000')?.value) || 0) +      
      (Number(this.payment2.get('notes500')?.value) || 0) +
      (Number(this.payment2.get('notes200')?.value) || 0) +
      (Number(this.payment2.get('notes100')?.value) || 0) +
      (Number(this.payment2.get('notes50')?.value) || 0) +
      (Number(this.payment2.get('notes20')?.value) || 0) +
      (Number(this.payment2.get('notes10')?.value) || 0) +
      (Number(this.payment2.get('notes5')?.value) || 0) +
      (Number(this.payment2.get('coins')?.value) || 0)
    );
  }

  isPayment2CashMismatch(): boolean {
    if (!this.isPayment2Cash()) {
      return false;
    }

    const amount = this.getPayment2Amount();
    const cashTotal = this.getPayment2NotesTotal();

    if (amount === 0 && cashTotal === 0) {
      return false;
    }

    return cashTotal !== amount;
  }
  
  // CLEAR CASH NOTES
  clearPayment1CashNotes(): void {
    this.payment1.patchValue(
      {
        notes2000: 0,        
        notes500: 0,
        notes200: 0,
        notes100: 0,
        notes50: 0,
        notes20: 0,
        notes10: 0,
        notes5: 0,
        coins: 0
      },
      { emitEvent: false }
    );
  }

  clearPayment2CashNotes(): void {
    this.payment2.patchValue(
      {
        notes2000: 0,        
        notes500: 0,
        notes200: 0,
        notes100: 0,
        notes50: 0,
        notes20: 0,
        notes10: 0,
        notes5: 0,
        coins: 0
      },
      { emitEvent: false }
    );
  }
  
  // PAYMENT VALIDATION
  isPaymentValid(): boolean {
    if (this.isPaymentTotalExceeded()) {
      return false;
    }

    if (this.isPayment1AmountExceeded()) {
      return false;
    }

    if (this.isPayment2AmountExceeded()) {
      return false;
    }

    if (this.isPayment1CashMismatch()) {
      return false;
    }

    if (this.isPayment2CashMismatch()) {
      return false;
    }

    return true;
  }
  
  // OLD / MAIN CASH PAYMENT  
  isCashPayment(): boolean {
    return (Number(this.group.get('paymentType')?.value) === PaymentType.Cash);
  }

  getNotesTotal(): number {
    return (
      (Number(this.group.get('notes2000')?.value) || 0) * 2000 +      
      (Number(this.group.get('notes500')?.value) || 0) * 500 +
      (Number(this.group.get('notes200')?.value) || 0) * 200 +
      (Number(this.group.get('notes100')?.value) || 0) * 100 +
      (Number(this.group.get('notes50')?.value) || 0) * 50 +
      (Number(this.group.get('notes20')?.value) || 0) * 20 +
      (Number(this.group.get('notes10')?.value) || 0) * 10 +
      (Number(this.group.get('notes5')?.value) || 0) * 5 +
      (Number(this.group.get('coins')?.value) || 0)
    );
  }

  getNotesCountTotal(): number {
    return (
      (Number(this.group.get('notes2000')?.value) || 0) +      
      (Number(this.group.get('notes500')?.value) || 0) +
      (Number(this.group.get('notes200')?.value) || 0) +
      (Number(this.group.get('notes100')?.value) || 0) +
      (Number(this.group.get('notes50')?.value) || 0) +
      (Number(this.group.get('notes20')?.value) || 0) +
      (Number(this.group.get('notes10')?.value) || 0) +
      (Number(this.group.get('notes5')?.value) || 0) +
      (Number(this.group.get('coins')?.value) || 0)
    );
  }

  isCashMismatch(): boolean {
    if (!this.isCashPayment()) {
      return false;
    }

    const cashTotal = this.getNotesTotal();
    const balanceAmount =
      Number(this.group.get('balanceAmount')?.value) || 0;

    return cashTotal !== balanceAmount;
  }
  
  // SUBMIT
  onSubmit(): void {
    this.updateBillingSummary();

    if (this.isPaymentTotalExceeded()) {
      alert(
        `Payment total cannot exceed Net Amount.\n\n` +
        `Net Amount: ₹${this.getNetAmount()}\n` +
        `Payment 1: ₹${this.getPayment1Amount()}\n` +
        `Payment 2: ₹${this.getPayment2Amount()}\n` +
        `Total Payment: ₹${this.getTotalPaymentAmount()}`
      );

      return;
    }

    if (this.isPayment1AmountExceeded()) {
      alert(
        `Payment 1 cannot exceed Net Amount.\n\n` +
        `Allowed: ₹${this.getNetAmount()}\n` +
        `Entered: ₹${this.getPayment1Amount()}`
      );

      return;
    }

    if (this.isPayment2AmountExceeded()) {
      alert(
        `Payment 2 cannot exceed the remaining amount.\n\n` +
        `Remaining: ₹${this.getRemainingAfterPayment1()}\n` +
        `Entered: ₹${this.getPayment2Amount()}`
      );

      return;
    }

    if (this.isPayment1CashMismatch()) {
      alert(
        `Payment 1 cash notes total must match Payment 1 amount.\n\n` +
        `Amount: ₹${this.getPayment1Amount()}\n` +
        `Cash Notes: ₹${this.getPayment1NotesTotal()}`
      );

      return;
    }

    if (this.isPayment2CashMismatch()) {
      alert(
        `Payment 2 cash notes total must match Payment 2 amount.\n\n` +
        `Amount: ₹${this.getPayment2Amount()}\n` +
        `Cash Notes: ₹${this.getPayment2NotesTotal()}`
      );

      return;
    }

    if (this.group.invalid) {
      this.group.markAllAsTouched();
      return;
    }

    // ==========================================================
    // SAVE API
    // ==========================================================

    console.log(
      'Billing Summary:',
      this.group.getRawValue()
    );
  }
  
  // KEYBOARD NAVIGATION
  focusNext(next: HTMLElement): void {
    next.focus();
  }
}


