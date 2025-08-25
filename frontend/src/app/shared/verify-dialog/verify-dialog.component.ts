import { Component, inject } from '@angular/core';
import {  MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-verify-dialog',
  standalone: true,
  imports: [],
  templateUrl: './verify-dialog.component.html',
  styleUrl: './verify-dialog.component.scss'
})
export class VerifyDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VerifyDialogComponent>);
  readonly fullName = inject(MAT_DIALOG_DATA).fullName;
  ngOnInit(): void{
    setTimeout(() => {
      this.dialogRef.close();
    }, 4000);
  }

}
