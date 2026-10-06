import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  
  // MAIN CASH PAYMENT
  isCashPayment(): boolean {
    return Number(this.group.get('paymentType')?.value) === PaymentType.Cash;
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
      (Number(this.group.get('notes5')?.value) || 0)
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
  // PAYMENT 1 
  isPayment1Cash(): boolean {
    const payment1 = this.group.get('payment1') as FormGroup | null;

    return Number(
      payment1?.get('paymentType')?.value
    ) === PaymentType.Cash;
  }

  getPayment1NotesTotal(): number {
    const payment1 = this.group.get('payment1') as FormGroup | null;

    if (!payment1) {
      return 0;
    }

    return (
      (Number(payment1.get('notes2000')?.value) || 0) * 2000 +
      (Number(payment1.get('notes1000')?.value) || 0) * 1000 +
      (Number(payment1.get('notes500')?.value) || 0) * 500 +
      (Number(payment1.get('notes200')?.value) || 0) * 200 +
      (Number(payment1.get('notes100')?.value) || 0) * 100 +
      (Number(payment1.get('notes50')?.value) || 0) * 50 +
      (Number(payment1.get('notes20')?.value) || 0) * 20 +
      (Number(payment1.get('notes10')?.value) || 0) * 10 +
      (Number(payment1.get('notes5')?.value) || 0) * 5 +
      (Number(payment1.get('coins')?.value) || 0)
    );
  }
  
  // PAYMENT 2  
  isPayment2Cash(): boolean {
    const payment2 = this.group.get('payment2') as FormGroup | null;

    return Number(
      payment2?.get('paymentType')?.value
    ) === PaymentType.Cash;
  }

  getPayment2NotesTotal(): number {
    const payment2 = this.group.get('payment2') as FormGroup | null;

    if (!payment2) {
      return 0;
    }

    return (
      (Number(payment2.get('notes2000')?.value) || 0) * 2000 +
      (Number(payment2.get('notes1000')?.value) || 0) * 1000 +
      (Number(payment2.get('notes500')?.value) || 0) * 500 +
      (Number(payment2.get('notes200')?.value) || 0) * 200 +
      (Number(payment2.get('notes100')?.value) || 0) * 100 +
      (Number(payment2.get('notes50')?.value) || 0) * 50 +
      (Number(payment2.get('notes20')?.value) || 0) * 20 +
      (Number(payment2.get('notes10')?.value) || 0) * 10 +
      (Number(payment2.get('notes5')?.value) || 0) * 5 +
      (Number(payment2.get('coins')?.value) || 0)
    );
  }

  isPayment2CashMismatch(): boolean {
    if (!this.isPayment2Cash()) {
      return false;
    }

    const payment2 = this.group.get('payment2') as FormGroup | null;

    if (!payment2) {
      return false;
    }

    const payment2Amount =
      Number(payment2.get('amount')?.value) || 0;

    return this.getPayment2NotesTotal() !== payment2Amount;
  }  
  
  // KEYBOARD NAVIGATION  
  focusNext(next: HTMLElement): void {
    next.focus();
  }
}

