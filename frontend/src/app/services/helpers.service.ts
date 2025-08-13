import { Injectable } from '@angular/core';
import { HelperUser } from '../models/helper.model'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class HelpersService {
  constructor(private httpClient : HttpClient) { }
  private url = 'http://localhost:5000/api/helpers';

  getHelpers(sortBy: string='',searchTerm: string='',service: string[]=[], org: string[] = [],startDate?: Date, endDate?: Date): Observable<HelperUser[]>{
    const body = {
      sortBy,
      searchTerm,
      service,
      org,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null
    }
    return this.httpClient.post<HelperUser[]>(`${this.url}/getAll`,body);
  }

  addHelper(helper: FormData): Observable<HelperUser>{
    return this.httpClient.post<HelperUser>(`${this.url}/add`,helper);
  }

  getCount(): Observable<{count:number}>{
    return this.httpClient.get<{count: number}>(`${this.url}/getCount`);
  }

  updateHelper(id: string,helper: FormData): Observable<{message: string}>{
    return this.httpClient.put<{message: string}>(`${this.url}/update/${id}`,helper);
  }
  getHelperById(id: string): Observable<HelperUser>{
    return this.httpClient.get<HelperUser>(`${this.url}/get/${id}`);
  }

  deleteHelper(id: string): Observable<{message: string}>{
    return this.httpClient.delete<{message: string}>(`${this.url}/delete/${id}`);
  } 

}
