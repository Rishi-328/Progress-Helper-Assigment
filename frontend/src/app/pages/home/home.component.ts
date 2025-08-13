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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,HelperDetailComponent,HelperListComponent,AddHelperComponent,FilterMultiselectComponent,MaterialModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  selectedDate: Date = new Date();
  selectedHelper?: HelperUser;
  router = inject(Router);
  helperService = inject(HelpersService);
  helperUsers: HelperUser[] = [];
  totalCount: number = 0;
  sortTerm: string = 'employeeId';
  searchTerm: string = '';
  serviceTypes: string[] = serviceTypes;
  Organization: string[] = Organization;
  iconMap: {[key: string]: string} = iconMap;
  service = new FormControl<string[]>([]);
  org = new FormControl<string[]>([]);
  showFilter: boolean = false;
  hidden: boolean = true;
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
  getHelperUsers() {
    const normalizeUTC  = (date: Date) =>{
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    }
    const startDate = this.rangeForm.value.start ? normalizeUTC(this.rangeForm.value.start) : undefined;
    const endDate = this.rangeForm.value.end ? normalizeUTC(this.rangeForm.value.end) : undefined;
    this.helperService.getHelpers(
      this.sortTerm,
      this.searchTerm,
      this.service.value || [],
      this.org.value || [],
      startDate,
      endDate
    )
      .subscribe({
        next: (response: HelperUser[])=>{
          this.helperUsers = response;
          this.selectedHelper = this.helperUsers.length > 0 ? this.helperUsers[0] : undefined;
        },
      });
      this.sortTerm = '';
      this.searchTerm = '';  
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
    this.hidden = false;
    
  }
  resetFilter(){
    this.service.reset();
    this.org.reset();
    this.showFilter = false;
    this.hidden = true;
    this.getHelperUsers();
  }
  resetDate() {
    this.rangeForm.reset();
    this.getHelperUsers();
  }
  onDateChange(event: any) {
    this.selectedDate = event.value;
    this.getHelperUsers();
  }
  ngOnInit(){
    this.getHelperUsers();
    this.getCount();
    this.rangeForm.valueChanges.subscribe((value)=>{
      if(value.start && value.end){
        this.getHelperUsers();
      }
    })
  }

}

