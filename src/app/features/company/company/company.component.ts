import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import {AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ToastService } from '../../../services/toast.service';
import { DateUtcPipe } from '../../../shared/pipes/date-utc.pipe';

@Component({
  selector: 'app-company',
  providers: [DateUtcPipe],
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TableModule],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent {
  
  userId: any;
  isUpdateMode: boolean = false;
  states: any[] = [];
  myForm = new FormGroup({
    companyCode: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    companyName: new FormControl('', Validators.required),
    registrationNumber: new FormControl('', Validators.required),
    industryType: new FormControl('', Validators.required),
    registrationDate: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', Validators.required),
    addressLine1: new FormControl('', Validators.required),
    addressLine2: new FormControl(''),
    city: new FormControl('', Validators.required),
    postalCode: new FormControl('', Validators.required),
    stateId: new FormControl('', Validators.required)
  });

  constructor(
    private authService: AuthService,
    private masterService: MasterService,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private dateUtcPipe: DateUtcPipe
  ) {
    const authData = this.authService.getUserAuthData();
    if (authData && authData.userId) {
      this.userId = authData.userId;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isUpdateMode = true;
      this.getCompanyById(id);
    }
    this.getStates();
  }

  getCompanyById(id: any) {
    this.masterService.getCompanyById(id).subscribe(
      (response: any) => {        
        this.myForm.patchValue({
          companyCode: response.companyCode,
          companyName: response.companyName,
          registrationNumber: response.registrationNumber,
          industryType: response.industryType,          
          registrationDate: this.dateUtcPipe.transform(response.registrationDate, 'input'),
          email: response.email,
          phoneNumber: response.phoneNumber,
          addressLine1: response.addressLine1,
          addressLine2: response.addressLine2,
          city: response.city,
          postalCode: response.postalCode,
          stateId: response.stateId
        });
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error fetching Company');
      }
    );
  }
  getStates() {
    this.masterService.getStates().subscribe(
      (response: any) => {
        this.states = response;
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error fetching States');
      }
    );
  }

  onSubmitCompany() {
    Object.keys(this.myForm.controls).forEach(key => {
      const control = this.myForm.get(key);
      if (control?.invalid) {
        console.log(key, control.errors);
      }
    });

    if (this.myForm.valid) {
      const companyData = {
        companyCode: this.myForm.value.companyCode,
        companyName: this.myForm.value.companyName,
        registrationNumber: this.myForm.value.registrationNumber,
        industryType: this.myForm.value.industryType,
        registrationDate: this.dateUtcPipe.transform(this.myForm.get('registrationDate')?.value, 'withCurrentTime'),
        email: this.myForm.value.email,
        phoneNumber: this.myForm.value.phoneNumber,
        addressLine1: this.myForm.value.addressLine1,
        addressLine2: this.myForm.value.addressLine2,
        city: this.myForm.value.city,
        postalCode: this.myForm.value.postalCode,
        stateId: this.myForm.value.stateId,
        isActive: true,
        createdBy: this.userId,
        editedBy: this.userId
      };

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.onUpdateCompany(id, companyData);
      } else
      {
        this.onRegisterCompany(companyData);
      }      
    }
  }

  onRegisterCompany(companyData: any) {
    this.masterService.registerCompany(companyData).subscribe(
      (response: any) => {
        this.toastService.success(response.message || 'Company registered successfully');
        this.router.navigate(['/company/companies']);
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error creating Company');
      }
    );
  }

  onUpdateCompany(id: any, companyData: any) {
    this.masterService.updateCompanyById(id, companyData).subscribe(
      (response: any) => {
        this.toastService.success(response.message || 'Company updated successfully');
        this.router.navigate(['/company/companies']);
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error updating Company');
      }
    );
  }
}
