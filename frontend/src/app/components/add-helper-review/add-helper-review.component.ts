import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InfoRowComponent } from '../../shared/info-row/info-row.component';
import { DividerComponent } from '../../shared/divider/divider.component';
import { MaterialModule } from '../../shared/material.module';
import { Subscription } from 'rxjs';
import { url } from 'node:inspector';

@Component({
  selector: 'app-add-helper-review',
  standalone: true,
  imports: [CommonModule, InfoRowComponent, DividerComponent, MaterialModule],
  templateUrl: './add-helper-review.component.html',
  styleUrl: './add-helper-review.component.scss'
})
export class AddHelperReviewComponent implements OnInit {
  currentDate: Date = new Date();
  @Input() helperForm?: FormGroup;
  kycFileUrl: string | null = null;

  ngOnInit(): void {
    if (this.helperForm?.get('kycDocument')) {
      this.kycFileUrl = URL.createObjectURL(this.helperForm.get('kycDocument')?.value);
    }
  }
}
