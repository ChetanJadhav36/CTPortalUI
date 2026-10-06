import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { EmployeesService } from '../../../services/employees.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { RelationshipType } from '../../../enums/permission.enum';
import { UpperCaseDirective } from '../../../shared/directives/upper-case.directive';

@Component({
  selector: 'app-employee-contact-form',
  imports: [CommonModule,FormsModule, ReactiveFormsModule,TableModule, UpperCaseDirective],
  templateUrl: './employee-contact-form.component.html',
  styleUrl: './employee-contact-form.component.scss'
})
export class EmployeeContactFormComponent {
  isUpdateMode: boolean = false;
  companyId: any;
  userId: any;
  employeeId!: any;
  employeeDetails: any ={};
  contactId!: any;
  mode!: 'add' | 'edit';
  RelationshipType = RelationshipType;
  employeeContactForm = new FormGroup({
    id: new FormControl(0), // optional, usually auto-generated
    employeeId: new FormControl(0, Validators.required),
    relationship: new FormControl<number | null>(null, Validators.required),
    fullName: new FormControl('', Validators.required),
    phonePrimary: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
    phoneSecondary: new FormControl('', Validators.pattern(/^[0-9]{10}$/)),
    address: new FormControl('', Validators.required),
    notes: new FormControl(''),
    monthlySalary: new FormControl(0, [Validators.required, Validators.min(0)]),
    aadhaarNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{12}$/)]),
    panNumber: new FormControl('', [Validators.required, Validators.pattern(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)]),
    bankName: new FormControl('', Validators.required),
    bankAccountNumber: new FormControl('', Validators.required),
    ifscCode: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)])
  });
  constructor(
    private authService: AuthService,
    private masterService: MasterService,
    private employeeService: EmployeesService,
    private router: Router,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) { 
    const authData = this.authService.getUserAuthData();
  if (authData && authData.userId) {    
      this.userId = authData.userId;    
      this.companyId = authData.client?.clientId;
    } 
  }
  ngOnInit() {
    // Get employeeId from route
    this.employeeId = Number(this.route.snapshot.paramMap.get('employeeId'));
    if (isNaN(this.employeeId)) {
      this.toastService.error('Invalid Employee ID');
      this.router.navigate(['employees/employee-list']);
      return;
    }
    
    // Get mode from route data
    this.mode = this.route.snapshot.data['mode'];
    if (this.mode === 'add') {
      if (this.employeeId && this.companyId) {
      this.getEmployeeDetailsByEmployeeId();
      }      
    }
    else if (this.mode === 'edit') {
      this.isUpdateMode = true;
      this.contactId = Number(this.route.snapshot.paramMap.get('contactId'));
      this.getContactById();
    }
  }
  getEmployeeDetailsByEmployeeId(){
    this.employeeService.GetEmployeeDetailsByEmployeeId(this.employeeId, this.companyId).subscribe(
      (response:any) => {
        if (response.employeeId !== this.employeeId) {
          this.toastService.error('Employee Contact does not belong to the specified employee.');
          this.router.navigate(['employees/employee-list']);
          return;
        }
        if (response.employeeId && response.employeeCode && response.employeeFullName) {
          this.employeeDetails.employeeCode = response.employeeCode;
          this.employeeDetails.employeeFullName = response.employeeFullName;
        }       
      },
      (error:any) => {
        this.toastService.error(error.error.message || 'Error fetching Employee Contact');
      }
    );
  }
  getContactById() {
    this.employeeService.getContactById(this.contactId, this.employeeId).subscribe(
      (response:any) => {
        console.log('Employee Contact fetched successfully:', response);
        if (response.employeeId !== this.employeeId) {
          this.toastService.error('Employee Contact does not belong to the specified employee.');
          this.router.navigate(['employees/employee-list']);
          return;
        }
        if (response.employeeId && response.employeeCode && response.employeeFullName) {
          this.employeeDetails.employeeCode = response.employeeCode;
          this.employeeDetails.employeeFullName = response.employeeFullName;
        }
        this.employeeContactForm.patchValue({
            id: response.id,
            employeeId: response.employeeId,
            relationship: RelationshipType[response.relationship as keyof typeof RelationshipType],
            fullName: response.fullName,
            phonePrimary: response.phonePrimary,
            phoneSecondary: response.phoneSecondary,
            address: response.address,
            notes: response.notes,
            monthlySalary: response.monthlySalary,
            aadhaarNumber: response.aadhaarNumber,
            panNumber: response.panNumber,
            bankName: response.bankName,
            bankAccountNumber: response.bankAccountNumber,
            ifscCode: response.ifscCode
        });
      },
      (error:any) => {
        this.toastService.error(error.error.message || 'Error fetching Employee Contact');
      }
    );
  }
  onSubmit() {
    if (this.employeeContactForm.invalid) {
      this.employeeContactForm.markAllAsTouched(); // highlights all invalid fields
      alert('Please correct the errors before submitting.');
      return;
    }  
    if (this.employeeContactForm.valid) {
      const employeeContactData = {
        id: this.employeeContactForm.value.id,
        employeeId: this.employeeId,
        relationship: this.employeeContactForm.value.relationship,
        fullName: this.employeeContactForm.value.fullName,
        phonePrimary: this.employeeContactForm.value.phonePrimary,
        phoneSecondary: this.employeeContactForm.value.phoneSecondary,
        address: this.employeeContactForm.value.address,
        notes: this.employeeContactForm.value.notes,
        monthlySalary: this.employeeContactForm.value.monthlySalary,
        aadhaarNumber: this.employeeContactForm.value.aadhaarNumber,
        panNumber: this.employeeContactForm.value.panNumber,
        bankName: this.employeeContactForm.value.bankName,
        bankAccountNumber: this.employeeContactForm.value.bankAccountNumber,
        ifscCode: this.employeeContactForm.value.ifscCode,
      };

      const id = this.route.snapshot.paramMap.get('contactId');
      if (id) {
        this.onUpdateEmployeeContact(id, employeeContactData);
        return;
      }

      this.onRegisterEmployeeContact(employeeContactData);
    }  
  }

onRegisterEmployeeContact(employeeContactData: any) {
  this.employeeService.createContact(employeeContactData).subscribe(
    (response: any) => {
      this.toastService.success(response.message || 'Employee Contact registered successfully');
      this.router.navigate(['employees/employee-list']);
    },
    (error: any) => {
      this.toastService.error(error.error.message || 'Error creating Employee Contact');
    }
  );
}

  onUpdateEmployeeContact(id: any, employeeContactData: any) {
    this.employeeService.updateContact(id, employeeContactData).subscribe(
      (response: any) => {
        this.toastService.success(response.message || 'Employee Contact updated successfully');
        this.router.navigate(['employees/employee-list']);
      },
      (error: any) => {
        this.toastService.error(error.error.message || 'Error updating Employee Contact');
      }
    );
  }
}
