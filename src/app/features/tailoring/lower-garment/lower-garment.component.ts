import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lower-garment',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './lower-garment.component.html',
  styleUrl: './lower-garment.component.scss'
})
export class LowerGarmentComponent {
  @Input({ required: true })
  group!: FormGroup;
}
