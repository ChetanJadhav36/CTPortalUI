import { Component, OnInit } from '@angular/core';
import { TailoringService } from '../../../services/tailoring.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-measurements',
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TableModule],
  templateUrl: './measurements.component.html',
  styleUrl: './measurements.component.scss'
})
export class MeasurementsComponent implements OnInit {

  companyId: any;
  measurementId: any;
  isUpdateMode = false;
  currentUserName = '';

  constructor(
    private tailoringService: TailoringService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private dateUtcPipe: DateUtcPipe
  ) {

    const authData = this.authService.getUserAuthData();

    if (authData && authData.userId) {
      this.companyId = authData.client?.clientId;
      this.currentUserName = authData.client?.userName;
    }

  }

  measurementForm = new FormGroup({
    id: new FormControl(0),
    companyId: new FormControl(),

    customerName: new FormControl('', Validators.required),
    orderNo: new FormControl('', Validators.required),
    mobileNo: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9]{10}')
    ]),

    orderDate: new FormControl('', Validators.required),
    expectedDeliveryDate: new FormControl('', Validators.required),

    // Upper Garment

    ugLength: new FormControl(''),
    ugLengthLosing: new FormControl(''),

    ugShoulder: new FormControl(''),
    ugShoulderLosing: new FormControl(''),

    ugChest: new FormControl(''),
    ugChestLosing: new FormControl(''),

    ugBelly: new FormControl(''),
    ugBellyLosing: new FormControl(''),

    ugHip: new FormControl(''),
    ugHipLosing: new FormControl(''),

    ugSleeveLength: new FormControl(''),
    ugSleeveLengthLosing: new FormControl(''),

    ugArms: new FormControl(''),
    ugArmsLosing: new FormControl(''),

    ugCollar: new FormControl(''),
    ugCollarLosing: new FormControl(''),

    ugCuff: new FormControl(''),
    ugCuffLosing: new FormControl(''),

    ugThreeFourth: new FormControl(''),
    ugThreeFourthLosing: new FormControl(''),

    ugStyle: new FormControl(''),
    ugFabric: new FormControl(''),

    ugRemark: new FormControl(''),
    ugQuantity : new FormControl(''),

    // Lower Garment

    lgLength: new FormControl(''),
    lgLengthLosing: new FormControl(''),

    lgWaist: new FormControl(''),
    lgWaistLosing: new FormControl(''),

    lgHip: new FormControl(''),
    lgHipLosing: new FormControl(''),

    lgPockland: new FormControl(''),
    lgPocklandLosing: new FormControl(''),

    lgThigh: new FormControl(''),
    lgThighLosing: new FormControl(''),

    lgKnee: new FormControl(''),
    lgKneeLosing: new FormControl(''),

    lgPotree: new FormControl(''),
    lgPotreeLosing: new FormControl(''),

    lgBottom: new FormControl(''),
    lgBottomLosing: new FormControl(''),

    lgHeight: new FormControl(''),
    lgHeightLosing: new FormControl(''),

    lgStyle: new FormControl(''),
    lgFabric: new FormControl(''),

    lgRemark: new FormControl(''),
    lgQuantity : new FormControl(''),

    // Payment
    totalQuantity: new FormControl(1),
    totalAmount: new FormControl(0, Validators.required),
    advancePaidAmount: new FormControl(0),
    balanceAmount: new FormControl({value: 0, disabled: true}),
    paymentType: new FormControl('Cash'),
    isActive: new FormControl(true)
  });

  ngOnInit(): void {

    this.measurementForm.patchValue({
      orderDate: this.dateUtcPipe.transform(new Date(), 'input'),
      paymentType: 'Cash'
    });

    this.measurementId = this.route.snapshot.paramMap.get('id');
    if (this.measurementId) {
      this.isUpdateMode = true;
      this.onGetMeasurementById(this.measurementId);
    }

    this.measurementForm.get('totalAmount')?.valueChanges
      .subscribe(() => this.calculateBalance());
    this.measurementForm.get('advancePaidAmount')
      ?.valueChanges
      .subscribe(() => this.calculateBalance());
  }

  calculateBalance() {
    const total = Number(this.measurementForm.get('totalAmount')?.value) || 0;
    const advance = Number(this.measurementForm.get('advancePaidAmount')?.value) || 0;
    this.measurementForm.patchValue({ balanceAmount: total - advance }, { emitEvent: false });
  }

  onGetMeasurementById(id: any) {
    this.tailoringService.getMeasurementById(id)
      .subscribe({
        next: (data: any) => {
          this.measurementForm.patchValue({
            ...data,
            orderDate: this.dateUtcPipe.transform(data.orderDate, 'input'),           
            expectedDeliveryDate: this.dateUtcPipe.transform(data.expectedDeliveryDate,'input')
          });
          this.calculateBalance();
        },

        error: (error: any) => {
          this.toastService.error(error.error.message || 'Unable to load measurement.');
        }
      });
  }

  onSubmitMeasurement() {
    if (!this.measurementForm.valid) {
      this.toastService.error('Please fill all required fields.');
      return;
    }

    this.measurementForm.patchValue({
      companyId: this.companyId,
      orderDate: this.dateUtcPipe.transform(this.measurementForm.get('orderDate')?.value, 'withCurrentTime'),
      expectedDeliveryDate: this.dateUtcPipe.transform(this.measurementForm.get('expectedDeliveryDate')?.value, 'withCurrentTime')
    });

    const measurement = this.measurementForm.getRawValue();
    if (this.measurementId) {
      this.updateMeasurement(measurement);
    } else {
      this.createMeasurement(measurement);
    }
  }

  createMeasurement(measurement: any) {
    this.tailoringService.createMeasurement(measurement)
      .subscribe({
        next: (response: any) => {
          this.toastService.success( response.message || 'Measurement saved successfully.');
          this.router.navigate(['/tailoring']);
        },
        error: (error: any) => {
          this.toastService.error(error.error.message || 'Unable to save measurement.');
        }
      });

  }

  updateMeasurement(measurement: any) {
    this.tailoringService.updateMeasurement(this.measurementId, measurement)
      .subscribe({
        next: (response: any) => {
          this.toastService.success(response.message || 'Measurement updated successfully.');
          this.router.navigate(['/tailoring']);
        },
        error: (error: any) => {
          this.toastService.error(error.error.message || 'Unable to update measurement.');
        }
      });
  }

  isInvalid(controlName: string): boolean {
    const control = this.measurementForm.get(controlName);
    return !!(control && control.touched && control.invalid && control.errors);
  }

}
