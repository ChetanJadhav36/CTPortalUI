import { Component, OnInit, ViewChild } from '@angular/core';
import { TailoringService } from '../../../services/tailoring.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaymentStatus, PaymentType } from '../../../enums/permission.enum';
import { CustomerDetailsComponent } from '../customer-details/customer-details.component';
import { UpperGarmentComponent } from '../upper-garment/upper-garment.component';
import { LowerGarmentComponent } from '../lower-garment/lower-garment.component';
import { BillingSummaryComponent } from '../billing-summary/billing-summary.component';

@Component({
  selector: 'app-measurements',
  standalone:true,
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TableModule,CustomerDetailsComponent, UpperGarmentComponent, LowerGarmentComponent, BillingSummaryComponent],
  templateUrl: './measurements.component.html',
  styleUrl: './measurements.component.scss'
})
export class MeasurementsComponent implements OnInit {
  companyId:any;
  measurementId:any;
  isUpdateMode=false;
  currentUserName='';
  measurementForm!:FormGroup;

  constructor(
    private fb:FormBuilder,
    private tailoringService:TailoringService,
    private authService:AuthService,
    private router:Router,
    private route:ActivatedRoute,
    private toastService:ToastService,
    private dateUtcPipe:DateUtcPipe
  ){
    const authData=this.authService.getUserAuthData();

    if(authData?.userId){
      this.companyId=authData.client?.clientId;
      this.currentUserName=authData.client?.userName;
    }
  }

  ngOnInit():void{
    this.initializeForm();
    this.measurementId=this.route.snapshot.paramMap.get('id');
    if(this.measurementId){
      this.isUpdateMode=true;
      this.getMeasurementById(this.measurementId);
    }

    this.initializePaymentCalculation();
  }

  initializeForm(){
    this.measurementForm=this.fb.group({
      id:[0],
      companyId:[this.companyId],
      customer:this.fb.group({
        mobileNo: new FormControl('', Validators.required),
        customerName: new FormControl('', Validators.required),
        orderNo: new FormControl(''),
        orderDate: [this.dateUtcPipe.transform(new Date(),'input')]        
      }),

      upperGarment:this.fb.group({
        ugLength:[''],
        ugLengthLosing:[''],
        ugShoulder:[''],
        ugShoulderLosing:[''],
        ugChest:[''],
        ugChestLosing:[''],
        ugBelly:[''],
        ugBellyLosing:[''],
        ugHip:[''],
        ugHipLosing:[''],
        ugSleeveLength:[''],
        ugSleeveLengthLosing:[''],
        ugArms:[''],
        ugArmsLosing:[''],
        ugCollar:[''],
        ugCollarLosing:[''],
        ugCuff:[''],
        ugCuffLosing:[''],
        ugThreeFourth:[''],
        ugThreeFourthLosing:[''],
        ugStyle:[''],
        ugFabric:[''],
        ugRemark:[''],
        ugQuantity:<number | null>(null),
      }),

      lowerGarment:this.fb.group({
        lgLength:[''],
        lgLengthLosing:[''],
        lgWaist:[''],
        lgWaistLosing:[''],
        lgHip:[''],
        lgHipLosing:[''],
        lgPockland:[''],
        lgPocklandLosing:[''],
        lgThigh:[''],
        lgThighLosing:[''],
        lgKnee:[''],
        lgKneeLosing:[''],
        lgPotree:[''],
        lgPotreeLosing:[''],
        lgBottom:[''],
        lgBottomLosing:[''],
        lgHeight:[''],
        lgHeightLosing:[''],
        lgStyle:[''],
        lgFabric:[''],
        lgRemark:[''],
        lgQuantity:<number | null>(null)
      }),
      
      billingSummary: this.fb.group({
        // ================= BILLING =================
        totalQuantity: [{ value: null, disabled: true }],
        totalAmount: [null],
        discountAmount: [null],
        netAmount: [{ value: null, disabled: true }],

        // ================= PAYMENT 1 =================
        payment1: this.fb.group({
          amount: [null],
          paymentType: [PaymentType.Cash],
          paymentDate: [this.dateUtcPipe.transform(new Date(), 'input')],

          // Cash notes
          notes2000: [null],
          notes1000: [null],
          notes500: [null],
          notes200: [null],
          notes100: [null],
          notes50: [null],
          notes20: [null],
          notes10: [null],
          notes5: [null],
          coins: [null]

        }),

        // ================= PAYMENT 2 =================
        payment2: this.fb.group({
          amount: [null],
          paymentType: [PaymentType.Cash],
          paymentDate: [this.dateUtcPipe.transform(new Date(), 'input')],

          // Cash notes
          notes2000: [null],
          notes1000: [null],
          notes500: [null],
          notes200: [null],
          notes100: [null],
          notes50: [null],
          notes20: [null],
          notes10: [null],
          notes5: [null],
          coins: [null]
        }),

        // ================= SUMMARY =================
        totalPaidAmount: [{ value: null, disabled: true }],
        balanceAmount: [{ value: null, disabled: true }],
        paymentStatus: [PaymentStatus.Pending],
        isActive: [true],
        createdBy: [{ value: null, disabled: true }]
      })

    });
  }
  
  get customerGroup(): FormGroup {
  return this.measurementForm.get('customer') as FormGroup;
}

  get upperGarmentGroup(): FormGroup {
    return this.measurementForm.get('upperGarment') as FormGroup;
  }

  get lowerGarmentGroup(): FormGroup {
    return this.measurementForm.get('lowerGarment') as FormGroup;
  }

  get billingSummaryGroup(): FormGroup {
    return this.measurementForm.get('billingSummary') as FormGroup;
  }  
  initializePaymentCalculation(): void {

  const billing = this.billingSummaryGroup;

  this.upperGarmentGroup.get('ugQuantity')?.valueChanges
  .subscribe(() => this.calculatePayment());

  this.lowerGarmentGroup
    .get('lgQuantity')
    ?.valueChanges
    .subscribe(() => this.calculatePayment());

  billing.get('totalAmount')
    ?.valueChanges
    .subscribe(() => this.calculatePayment());

  billing.get('discountAmount')
    ?.valueChanges
    .subscribe(() => this.calculatePayment());

  billing.get('payment1.amount')
    ?.valueChanges
    .subscribe(() => this.calculatePayment());

  billing.get('payment2.amount')
    ?.valueChanges
    .subscribe(() => this.calculatePayment());

  this.calculatePayment();
}

  calculatePayment(): void {

    const upperQuantity = Number(this.upperGarmentGroup.get('ugQuantity')?.value) || 0;
    const lowerQuantity = Number(this.lowerGarmentGroup.get('lgQuantity')?.value) || 0;
    const totalAmount = Number(this.billingSummaryGroup.get('totalAmount')?.value) || 0;
    const discount = Number(this.billingSummaryGroup.get('discountAmount')?.value) || 0;
    const payment1 = Number(this.billingSummaryGroup.get('payment1.amount')?.value) || 0;
    const payment2 = Number(this.billingSummaryGroup.get('payment2.amount')?.value) || 0;

    // Quantity
    const totalQuantity = upperQuantity + lowerQuantity;

    // Net
    const netAmount = Math.max(totalAmount - discount, 0);

    // Total paid
    const totalPaidAmount = Math.min(payment1 + payment2, netAmount);

    // Remaining
    const balanceAmount = Math.max(netAmount - totalPaidAmount, 0);


    this.billingSummaryGroup.patchValue(
      {
        totalQuantity,
        netAmount,
        totalPaidAmount,
        balanceAmount
      },
      {
        emitEvent: false
      }
    );

    this.updatePaymentStatus(totalPaidAmount, balanceAmount, netAmount);
  }   
  updatePaymentStatus(totalPaid: number, balance: number, netAmount: number): void {
    let status = PaymentStatus.Pending;
    if (netAmount <= 0) {
      status = PaymentStatus.Paid;
    }
    else if (totalPaid <= 0) {
      status = PaymentStatus.Pending;
    }
    else if (balance > 0) {
      status = PaymentStatus.Partial;
    }
    else {
      status = PaymentStatus.Paid;
    }

    this.billingSummaryGroup.get('paymentStatus')?.setValue(status, { emitEvent: false });
  }

  getMeasurementById(id:any){
    this.tailoringService.getMeasurementById(id)
    .subscribe({
      next:(data:any)=>{
        this.measurementForm.patchValue(data);
        const customer=this.measurementForm.get('customer') as FormGroup;
        customer.patchValue({
          orderDate:this.dateUtcPipe.transform(data.customer?.orderDate, 'input'),
          expectedDeliveryDate:this.dateUtcPipe.transform(data.customer?.expectedDeliveryDate,'input')
        });
        this.calculatePayment();
      },

      error:(error:any)=>{
        this.toastService.error(
          error.error.message ||
          'Unable to load measurement.'
        );
      }

    });

  }

  submitMeasurement(){
    if(this.measurementForm.invalid){
      this.toastService.error(
        'Please fill all required fields.'
      );
      return;
    }

    this.measurementForm.patchValue({
      companyId:this.companyId
    });

    const measurement=this.measurementForm.getRawValue();

    if(this.measurementId){
      this.updateMeasurement(measurement);
    }
    else{
      this.createMeasurement(measurement);
    }

  }

  createMeasurement(data:any){
    this.tailoringService.createMeasurement(data)
    .subscribe({
      next:(response:any)=>{
        this.toastService.success(response.message || 'Measurement saved successfully.');
        this.router.navigate(['/tailoring']);
      },
      error:(error:any)=>{
        this.toastService.error(
          error.error.message || 'Unable to save measurement.'
        );
      }
    });
  }

  updateMeasurement(data:any){
    this.tailoringService.updateMeasurement(this.measurementId, data)
    .subscribe({
      next:(response:any)=>{
        this.toastService.success(response.message || 'Measurement updated successfully.'
        );
        this.router.navigate(['/tailoring']);
      },
      error:(error:any)=>{
        this.toastService.error(error.error.message || 'Unable to update measurement.'
        );
      }
    });
  }

  isInvalid(controlName:string):boolean{
    const control=this.measurementForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
