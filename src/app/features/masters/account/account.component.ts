import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  companyId: any;
  userId: any;
  myForm = new FormGroup({    
    accountCode: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    accountName: new FormControl('', Validators.required),
    accountGroupId: new FormControl('', Validators.required),    
    isDefaultCash: new FormControl(false),
    isDefaultBank: new FormControl(false),
    openingBal: new FormControl('', [Validators.required, Validators.min(0)]),
    dc: new FormControl('D', Validators.required),
    netBal: new FormControl('', [Validators.required, Validators.min(0)]),
    minAppBal: new FormControl('', [Validators.required, Validators.min(0)])
  });  
  isUpdateMode: boolean = false;
  accountGroups: any[] = [];
  constructor(
    private authService: AuthService,
    private masterService: MasterService,
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
    this.onGetAccountGroups();
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.isUpdateMode = true;
    this.masterService.getAccountById(id).subscribe(
      (response:any) => {
        this.myForm.patchValue({
          accountCode: response.accountCode,
          accountName: response.accountName,
          accountGroupId: response.accountGroupId,          
          isDefaultCash: response.isDefaultCash,
          isDefaultBank: response.isDefaultBank,
          openingBal: response.openingBal,
          dc: response.dc,
          netBal: response.netBal,
          minAppBal: response.minAppBal
        });
      },
      (error:any) => {
        this.toastService.error(error.error.message || 'Error fetching Account Group');
      }
    );
  }
}
  onSubmitAccount() {   
    Object.keys(this.myForm.controls).forEach(key => {
    const control = this.myForm.get(key);
      if (control?.invalid) {
        console.log(key, control.errors);
      }
    });
  if (this.myForm.valid) {
      let accountGroupData = {
        id: this.route.snapshot.paramMap.get('id') || 0,
        accountCode: this.myForm.value.accountCode,
        accountName: this.myForm.value.accountName,
        accountGroupId: this.myForm.value.accountGroupId,        
        isDefaultCash: this.myForm.value.isDefaultCash,
        isDefaultBank: this.myForm.value.isDefaultBank,
        openingBal: this.myForm.value.openingBal,
        dc: this.myForm.value.dc,
        netBal: this.myForm.value.netBal,
        minAppBal: this.myForm.value.minAppBal,
        companyId: this.companyId,
        isActive: true,
        createdBy: this.userId,
        editedBy: this.userId
      };    
      if (this.route.snapshot.paramMap.get('id')) {
        const id = this.route.snapshot.paramMap.get('id');
        this.onUpdateAccount(id, accountGroupData);
        return;
      }
      this.onCreateAccount(accountGroupData);
    } 
  }  
  onCreateAccount(accountData: any) {
    this.masterService.createAccount(accountData).subscribe(
    (response) => {
      this.toastService.success(response.message || 'Account created successfully');
      this.router.navigate(['masters/accounts']);
      },
      (error) => {
        this.toastService.error(error.error.message || 'Error creating Account');
      }
    );
  }
  onUpdateAccount(id : any, accountData: any) {
    this.masterService.updateAccountById(id,accountData).subscribe(
    (response) => {
      this.toastService.success(response.message || 'Account updated successfully');
      this.router.navigate(['masters/accounts']);
      },
      (error) => {
        this.toastService.error(error.error.message || 'Error updating Account');
      }
    );
  }
  onGetAccountGroups() {
    this.masterService.getAccountGroups(this.companyId).subscribe(
      (response:any) => {
        this.accountGroups = response;
      },
      (error:any) => {
        this.toastService.error(error.error.message || 'Error fetching Account Groups');
      }
    );
  }
}
