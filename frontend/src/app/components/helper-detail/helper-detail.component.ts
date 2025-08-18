import { Component ,EventEmitter,inject,Input, Output} from '@angular/core';
import { HelperUser } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { DividerComponent } from '../../shared/divider/divider.component';
import { InfoRowComponent } from '../../shared/info-row/info-row.component';
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog';
import { DeleteHelperComponent } from '../delete-helper/delete-helper.component';
import { HelpersService } from '../../services/helpers.service';
import { ToastService } from '../../services/toast.service';
import { SubmissionComponent } from '../submission/submission.component';
@Component({
  selector: 'app-helper-detail',
  standalone: true,
  imports: [CommonModule,MaterialModule,DividerComponent,InfoRowComponent,DeleteHelperComponent],
  templateUrl: './helper-detail.component.html',
  styleUrl: './helper-detail.component.scss'
})
export class HelperDetailComponent {
  @Input() helper?: HelperUser
  @Output() deleteDone = new EventEmitter<void>();
  router: Router = inject(Router);
  helperService = inject(HelpersService);
  toastService = inject(ToastService);
  readonly dialog = inject(MatDialog);
  constructor() {}
  editHelper() {
    this.router.navigate(['/update',this.helper?._id]);
  }
  deleteHelper(){
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const dialogRef = this.dialog.open(DeleteHelperComponent, {
      data:{fullName: this.helper?.fullName, typeOfService: this.helper?.typeOfService},
    });
    dialogRef.afterClosed().subscribe(result=>{
      if(result === 'Delete' && this.helper?.employeeId !== undefined){
        this.helperService.deleteHelper(this.helper._id)
          .subscribe({
            next: (response)=>{
            this.toastService.success(response.message);
            this.deleteDone.emit();
            },
            error: (error)=>{
              this.toastService.error('Failed to delete helper');
            } 
            });
      }
        
    })
  }
  getKycUrl(): string {
    if (typeof File !== 'undefined' && this.helper?.kycDocument instanceof File) {
      return '';
    }
    return (this.helper?.kycDocument as { url: string }).url; 
  }
  getAdditionalDocumentUrl(): string {
    if (typeof File !== 'undefined' && this.helper?.additionalDocuments instanceof File) {
      return '';
    }
    return (this.helper?.additionalDocuments as { url: string }).url;
  }
  getPhotoUrl(): string{
    const photo = this.helper?.photo as {url: string, name: string, size: number};
    if(photo && typeof photo.url === 'string') {
      const url = photo.url;
      return `https://res.cloudinary.com/dg5aldure/image/upload/w_200,h_200,c_fill/helper_upload/${url.substring(url.lastIndexOf('/')+1)}`;
    }
    return 'https://ui-avatars.com/api/?name='+this.helper?.fullName+'&background=random&color=fff&rounded=true&length=2';
  }
  idCardOpen(){
    const dialogRef = this.dialog.open(SubmissionComponent,{
      width: '600px',
      height: '600px',
      data:{
        helper: this.helper
      }
    })
  }


}
