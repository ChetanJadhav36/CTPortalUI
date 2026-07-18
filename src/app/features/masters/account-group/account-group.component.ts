import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MasterService } from '../../../services/master.service';
import { ToastService } from '../../../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-group',  
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './account-group.component.html',
  styleUrl: './account-group.component.scss'
})
export class AccountGroupComponent {
  userId: any;
  companyId: any;
  groups: any[] = [];  
  myForm = new FormGroup({
    accountGroupCode: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    accountGroupName: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    ugName: new FormControl('', [Validators.required, Validators.maxLength(50)])    
  });  
  isUpdateMode: boolean = false;
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
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.isUpdateMode = true;
    this.masterService.getAccountGroupById(id).subscribe(
      (response:any) => {
        this.myForm.patchValue({
          accountGroupCode: response.accountGroupCode,
          accountGroupName: response.accountGroupName,
          ugName: response.ugName
        });
      },
      (error:any) => {
        this.toastService.error(error.error.message || 'Error fetching Account Group');
      }
    );
  }
  this.onGetGroups();
}
 onGetGroups() {
    this.masterService.getGroups(this.companyId).subscribe(
      (response:any) => {
        this.groups = response;
      },
      (error:any) => {
        this.toastService.error(error.error.message || 'Error fetching Account Groups');
      }
    );
  }
  isInvalid(controlName: string): boolean {
  const control = this.myForm.get(controlName);
  return !!(control && control.touched && control.invalid);
}
  onSubmitAccountGroup() {
    if (this.myForm.valid) {
      let accountGroupData = {
        accountGroupCode: this.myForm.value.accountGroupCode,
        accountGroupName: this.myForm.value.accountGroupName,
        ugName: this.myForm.value.ugName,
        companyId: this.authService.getUserAuthData()?.client?.clientId,
        isActive: true,
        createdBy: this.userId,
        editedBy: this.userId
      };    
      if (this.route.snapshot.paramMap.get('id')) {
        const id = this.route.snapshot.paramMap.get('id');
        this.onUpdateAccountGroup(id, accountGroupData);
        return;
      }
      this.onCreatAccountGroup(accountGroupData);
    } 
  }  
  onCreatAccountGroup(accountGroupData: any) {
    this.masterService.createAccountGroup(accountGroupData).subscribe(
    (response) => {
      this.toastService.success(response.message || 'Account Group created successfully');
      this.router.navigate(['masters/account-groups']);
      },
      (error) => {
        this.toastService.error(error.error.message || 'Error creating Account Group');
      }
    );
  }
  onUpdateAccountGroup(id : any, accountGroupData: any) {
    this.masterService.updateAccountGroupById(id,accountGroupData).subscribe(
    (response) => {
      this.toastService.success(response.message || 'Account Group created successfully');
      this.router.navigate(['masters/account-groups']);
      },
      (error) => {
        this.toastService.error(error.error.message || 'Error creating Account Group');
      }
    );
  }
}
