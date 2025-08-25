import { Component ,inject, OnInit} from '@angular/core';
import { HelperUser } from './../../models/helper.model';
import { CommonModule } from '@angular/common';
import { HelperDetailComponent } from '../../components/helper-detail/helper-detail.component';
import { HelperListComponent } from '../../components/helper-list/helper-list.component';
import { MaterialModule } from '../../shared/material.module';
import { AddHelperComponent } from '../add-helper/add-helper.component';
import { Router } from '@angular/router'
import { HelpersService } from '../../services/helpers.service';
import { FormControl, FormGroup } from '@angular/forms';
import { serviceTypes,Organization,iconMap } from './../../models/helper.model';
import { FilterMultiselectComponent } from '../../shared/filter-multiselect/filter-multiselect.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,HelperDetailComponent,HelperListComponent,AddHelperComponent,FilterMultiselectComponent,MaterialModule,MatProgressSpinnerModule,NgxSkeletonLoaderModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  page: number = 0;
  loading: boolean = false;
  allLoaded: boolean = false;
  selectedHelper?: HelperUser;
  router = inject(Router);
  helperService = inject(HelpersService);
  helperUsers: HelperUser[] = [];
  totalCount: number = 0;
  sortTerm: string = 'employeeId';
  searchTerm: string = '';
  private timer: any;
  serviceTypes: string[] = serviceTypes;
  Organization: string[] = Organization;
  iconMap: {[key: string]: string} = iconMap;
  service = new FormControl<string[]>([]);
  org = new FormControl<string[]>([]);
  showFilter: boolean = false;
  hiddenFilter: boolean = true;
  hiddenDate: boolean = true;
  rangeForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  onSelectedHelper(helper: HelperUser){
    this.selectedHelper = helper;
  }
  navigateToAddHelper() {
    this.router.navigate(['/add-helper']);
  }
  getHelperUsers(reset: boolean = true) {
    if(reset){
      this.helperUsers = [];
      this.page = 0;
      this.selectedHelper = this.helperUsers[0];
      this.allLoaded = false;
    }
    if(this.loading || this.allLoaded) return;
    const normalizeUTC  = (date: Date) =>{
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }
    const startDate = this.rangeForm.value.start ? normalizeUTC(this.rangeForm.value.start) : undefined;
    const endDate = this.rangeForm.value.end ? normalizeUTC(this.rangeForm.value.end) : undefined;
    this.loading = true;
    setTimeout(()=>{
      this.helperService.getHelpers(
        this.sortTerm,
        this.searchTerm,
        this.service.value || [],
        this.org.value || [],
        startDate,
        endDate,
        this.page,
      )
      .subscribe({
        next: (response: any)=>{
          if(response.totalCount === 0){
            this.allLoaded = true;
          }else{

            this.helperUsers = [...this.helperUsers,...response.helpers];
            this.selectedHelper = this.helperUsers.length > 0 ? this.helperUsers[0] : undefined;
            this.page++;
          }
          this.loading = false;
          
        },
      });
    },500)
  }
  getCount(){
    this.helperService.getCount()
    .subscribe((response)=>{
      this.totalCount = response.count;
    })
  }
  onSortChange(sortTerm: string){
    this.sortTerm = sortTerm;
    this.getHelperUsers();
  }
  applyFilter(){
    this.getHelperUsers();
    this.showFilter = false;
    this.hiddenFilter = false;
    
  }
  resetFilter(){
    this.service.reset();
    this.org.reset();
    this.showFilter = false;
    this.hiddenFilter = true;
    this.getHelperUsers();
  }
  resetDate() {
    this.rangeForm.reset();
    this.hiddenDate = true;
    this.getHelperUsers();
  }
  applyDate(){
    this.hiddenDate = false;
    if(this.rangeForm.value.start && this.rangeForm.value.end){
      this.getHelperUsers();
    }
  }
  onSearchChange(value : string){
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      this.getHelperUsers();
    },500);
  }
  downloadHelpers(){
    this.helperService.downloadHelpers(this.helperUsers)
      .subscribe((response: Blob) =>{
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = "helpers.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })

  }
  ngOnInit(){
    this.getHelperUsers();
    this.getCount();
  }

}

