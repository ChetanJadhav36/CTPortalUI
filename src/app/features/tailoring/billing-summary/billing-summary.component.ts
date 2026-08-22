import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaymentType } from 'src/app/enums/permission.enum';

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
}
