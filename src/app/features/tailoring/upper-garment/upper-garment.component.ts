import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-upper-garment',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './upper-garment.component.html',
  styleUrl: './upper-garment.component.scss'
})
export class UpperGarmentComponent {
  @Input({ required: true })
  group!: FormGroup;
}
