import { Component, OnInit, ViewChild } from '@angular/core';
import { TailoringService } from '../../../services/tailoring.service';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaymentStatus } from '../../../enums/permission.enum';
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
        ugQuantity:[0]
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
        lgQuantity:[0]
      }),

      billingSummary:this.fb.group({
        totalQuantity:[0],
        totalAmount:[0],
        advancePaidAmount:[0],
        balanceAmount:[0],
        paymentType:['Cash'],
        paymentDate:[
          this.dateUtcPipe.transform(new Date(),'input')
        ],
        paymentStatus:[PaymentStatus.Pending],
        discountAmount:[0],
        netAmount:[0],
        isActive:[true],
        receivedBy:[this.currentUserName]
      })

    });
  }

  get paymentGroup():FormGroup{
    return this.measurementForm.get('payment') as FormGroup;
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

  initializePaymentCalculation(){

    this.paymentGroup.get('totalAmount')
      ?.valueChanges
      .subscribe(()=>this.calculatePayment());

    this.paymentGroup.get('advancePaidAmount')
      ?.valueChanges
      .subscribe(()=>this.calculatePayment());

    this.paymentGroup.get('discountAmount')
      ?.valueChanges
      .subscribe(()=>this.calculatePayment());

  }

  calculatePayment(){
    const totalAmount=Number(this.paymentGroup.get('totalAmount')?.value)||0;
    const advance=Number(this.paymentGroup.get('advancePaidAmount')?.value)||0;
    const discount=Number(this.paymentGroup.get('discountAmount')?.value)||0;

    const netAmount=totalAmount-discount;
    const balance=netAmount-advance;

    this.paymentGroup.patchValue({netAmount, balanceAmount:balance},{ emitEvent:false});
    this.updatePaymentStatus(balance,advance,netAmount);
  }

  updatePaymentStatus(balance:number, advance:number, netAmount:number ){
    let status=PaymentStatus.Pending;

    if(advance>0 && balance>0){
      status=PaymentStatus.Partial;
    }

    if(balance<=0 && netAmount>0){
      status=PaymentStatus.Paid;
    }

    this.paymentGroup.get('paymentStatus')
      ?.setValue(status,{
        emitEvent:false
      });

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
